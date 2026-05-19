from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.cart.models import Cart
from apps.catalog.models import Product

from .models import Order, OrderItem, PromoCode


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = ("code", "type", "value", "label", "min_order")


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "name", "price", "quantity", "line_total")
        read_only_fields = ("id", "name", "price", "line_total")


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    promo_code = serializers.SlugRelatedField(slug_field="code", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "status",
            "first_name",
            "last_name",
            "phone",
            "email",
            "delivery",
            "delivery_address",
            "delivery_cost",
            "payment",
            "promo_code",
            "discount",
            "subtotal",
            "total",
            "comment",
            "items",
            "created_at",
        )
        read_only_fields = ("id", "status", "discount", "subtotal", "total", "delivery_cost", "created_at")


DELIVERY_BASE_COST = {
    Order.DELIVERY_PICKUP: Decimal("0"),
    Order.DELIVERY_NOVA: Decimal("80"),
    Order.DELIVERY_COURIER: Decimal("350"),
    Order.DELIVERY_TRUCK: Decimal("800"),
}
FREE_DELIVERY_THRESHOLD = Decimal("5000")


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True, required=False)
    promo_code = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Order
        fields = (
            "first_name",
            "last_name",
            "phone",
            "email",
            "delivery",
            "delivery_address",
            "payment",
            "promo_code",
            "comment",
            "items",
        )

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        items_input = attrs.pop("items", [])
        if not items_input:
            if user and user.is_authenticated:
                cart = Cart.objects.filter(user=user).first()
                if not cart or not cart.items.exists():
                    raise serializers.ValidationError("Кошик порожній.")
                items_input = [
                    {"product_id": item.product_id, "quantity": item.quantity}
                    for item in cart.items.select_related("product")
                ]
            else:
                raise serializers.ValidationError("Необхідно передати позиції замовлення.")
        attrs["_items"] = items_input
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        items_input = validated_data.pop("_items")
        promo_code_str = validated_data.pop("promo_code", "") or ""

        product_ids = [it["product_id"] for it in items_input]
        products = {p.pk: p for p in Product.objects.filter(pk__in=product_ids)}
        if len(products) != len(set(product_ids)):
            raise serializers.ValidationError("Деякі товари не знайдено.")

        subtotal = Decimal("0")
        order_items_buf = []
        for it in items_input:
            p = products[it["product_id"]]
            qty = it["quantity"]
            line_price = p.price
            subtotal += line_price * qty
            order_items_buf.append((p, line_price, qty))

        promo = None
        discount = Decimal("0")
        if promo_code_str:
            promo = PromoCode.objects.filter(code__iexact=promo_code_str, active=True).first()
            if promo and subtotal >= promo.min_order:
                discount = Decimal(str(promo.calc_discount(subtotal)))

        delivery = validated_data.get("delivery", Order.DELIVERY_NOVA)
        delivery_cost = DELIVERY_BASE_COST.get(delivery, Decimal("0"))
        if subtotal >= FREE_DELIVERY_THRESHOLD and delivery in (Order.DELIVERY_NOVA, Order.DELIVERY_COURIER):
            delivery_cost = Decimal("0")

        total = max(subtotal - discount, Decimal("0")) + delivery_cost

        order = Order.objects.create(
            user=user if user and user.is_authenticated else None,
            promo_code=promo,
            discount=discount,
            subtotal=subtotal,
            delivery_cost=delivery_cost,
            total=total,
            **validated_data,
        )
        for product, price, qty in order_items_buf:
            OrderItem.objects.create(order=order, product=product, name=product.name, price=price, quantity=qty)

        if user and user.is_authenticated:
            Cart.objects.filter(user=user).first() and Cart.objects.get(user=user).items.all().delete()

        return order
