from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import ProductFilter
from .models import Brand, Category, Product, ProductType, Review
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductTypeSerializer,
    ReviewSerializer,
)


class CategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None


class ProductTypeViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = ProductType.objects.all()
    serializer_class = ProductTypeSerializer
    pagination_class = None


class BrandViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    pagination_class = None


class ProductViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Product.objects.select_related("product_type", "category", "brand").all()
    filterset_class = ProductFilter
    search_fields = ("name", "brand__name", "product_type__name")
    ordering_fields = ("price", "created_at", "popular", "is_new")
    ordering = ("legacy_id",)
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=True, methods=["get"])
    def similar(self, request, slug=None):
        product = self.get_object()
        qs = (
            Product.objects.filter(product_type=product.product_type)
            .exclude(pk=product.pk)
            .order_by("-popular", "-is_new")[:4]
        )
        serializer = ProductListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["get", "post"])
    def reviews(self, request, slug=None):
        product = self.get_object()
        if request.method == "GET":
            serializer = ReviewSerializer(product.reviews.all(), many=True)
            return Response(serializer.data)
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=401)
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, product=product)
        return Response(serializer.data, status=201)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related("user", "product").all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
