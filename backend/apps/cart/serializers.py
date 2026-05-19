from rest_framework import serializers

from apps.catalog.models import Product
from apps.catalog.serializers import ProductListSerializer

from .models import Cart, CartItem, WishlistItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "quantity")


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    items_total = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "items_total", "subtotal", "updated_at")


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = WishlistItem
        fields = ("id", "product", "product_id", "created_at")
        read_only_fields = ("id", "created_at")
