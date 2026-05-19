from rest_framework import mixins, viewsets

from .models import BlogCategory, BlogPost
from .serializers import BlogCategorySerializer, BlogPostDetailSerializer, BlogPostListSerializer


class BlogCategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    pagination_class = None


class BlogPostViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = BlogPost.objects.select_related("category").all()
    filterset_fields = ("category__slug",)
    search_fields = ("title", "excerpt", "content")
    ordering_fields = ("published_at", "legacy_id")
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BlogPostDetailSerializer
        return BlogPostListSerializer
