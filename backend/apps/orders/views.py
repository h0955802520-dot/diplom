from decimal import Decimal

from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, PromoCode
from .serializers import OrderCreateSerializer, OrderSerializer, PromoCodeSerializer


class OrderViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Order.objects.all().prefetch_related("items")
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return self.queryset.filter(user=user)
        return self.queryset.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class PromoCheckView(APIView):
    """POST { code, subtotal } → перевіряє та повертає розрахунок знижки."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = (request.data.get("code") or "").strip()
        try:
            subtotal = Decimal(str(request.data.get("subtotal", "0")))
        except (TypeError, ValueError):
            return Response({"valid": False, "detail": "Невірна сума."}, status=400)

        promo = PromoCode.objects.filter(code__iexact=code, active=True).first()
        if not promo:
            return Response({"valid": False, "detail": "Промокод не знайдено."}, status=404)
        if subtotal < promo.min_order:
            return Response(
                {
                    "valid": False,
                    "detail": f"Мінімальна сума замовлення для цього промокоду — {promo.min_order} грн.",
                },
                status=400,
            )
        discount = promo.calc_discount(subtotal)
        return Response(
            {
                "valid": True,
                "code": promo.code,
                "label": promo.label,
                "type": promo.type,
                "value": str(promo.value),
                "discount": f"{discount:.2f}",
            }
        )
