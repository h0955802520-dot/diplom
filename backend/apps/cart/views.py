from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product

from .models import Cart, CartItem, WishlistItem
from .serializers import CartItemSerializer, CartSerializer, WishlistItemSerializer


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_or_create_cart(self, user) -> Cart:
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self._get_or_create_cart(request.user)
        return Response(CartSerializer(cart, context={"request": request}).data)

    def post(self, request):
        """Add product to cart or increment quantity."""
        cart = self._get_or_create_cart(request.user)
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))
        product = Product.objects.filter(pk=product_id).first()
        if not product:
            return Response({"detail": "Товар не знайдено."}, status=status.HTTP_404_NOT_FOUND)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": quantity})
        if not created:
            item.quantity += quantity
            item.save()
        return Response(CartItemSerializer(item, context={"request": request}).data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        cart = self._get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_item(self, request, pk) -> CartItem | None:
        return CartItem.objects.filter(pk=pk, cart__user=request.user).first()

    def patch(self, request, pk):
        item = self._get_item(request, pk)
        if not item:
            return Response(status=status.HTTP_404_NOT_FOUND)
        qty = int(request.data.get("quantity", item.quantity))
        if qty <= 0:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        item.quantity = qty
        item.save()
        return Response(CartItemSerializer(item, context={"request": request}).data)

    def delete(self, request, pk):
        item = self._get_item(request, pk)
        if not item:
            return Response(status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).select_related("product")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"])
    def toggle(self, request):
        product_id = request.data.get("product_id")
        product = Product.objects.filter(pk=product_id).first()
        if not product:
            return Response({"detail": "Товар не знайдено."}, status=status.HTTP_404_NOT_FOUND)
        item = WishlistItem.objects.filter(user=request.user, product=product).first()
        if item:
            item.delete()
            return Response({"in_wishlist": False})
        WishlistItem.objects.create(user=request.user, product=product)
        return Response({"in_wishlist": True}, status=status.HTTP_201_CREATED)
