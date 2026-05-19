from django.conf import settings
from django.db import models

from apps.catalog.models import Product


class PromoCode(models.Model):
    PERCENT = "percent"
    FIXED = "fixed"
    TYPE_CHOICES = ((PERCENT, "Відсоток"), (FIXED, "Фіксована сума"))

    code = models.CharField("Код", max_length=32, unique=True)
    type = models.CharField("Тип", max_length=10, choices=TYPE_CHOICES, default=PERCENT)
    value = models.DecimalField("Значення", max_digits=10, decimal_places=2)
    label = models.CharField("Підпис", max_length=64, blank=True)
    active = models.BooleanField("Активний", default=True)
    min_order = models.DecimalField("Мін. замовлення", max_digits=10, decimal_places=2, default=0)
    valid_until = models.DateField("Діє до", null=True, blank=True)

    class Meta:
        verbose_name = "Промокод"
        verbose_name_plural = "Промокоди"

    def __str__(self) -> str:
        return self.code

    def calc_discount(self, subtotal) -> float:
        if self.type == self.PERCENT:
            return float(subtotal) * float(self.value) / 100
        return min(float(self.value), float(subtotal))


class Order(models.Model):
    NEW = "new"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    STATUS_CHOICES = (
        (NEW, "Нове"),
        (PROCESSING, "В обробці"),
        (SHIPPED, "Відправлено"),
        (DELIVERED, "Доставлено"),
        (CANCELLED, "Скасовано"),
    )

    DELIVERY_PICKUP = "pickup"
    DELIVERY_NOVA = "nova"
    DELIVERY_COURIER = "courier"
    DELIVERY_TRUCK = "truck"
    DELIVERY_CHOICES = (
        (DELIVERY_PICKUP, "Самовивіз"),
        (DELIVERY_NOVA, "Нова Пошта"),
        (DELIVERY_COURIER, "Кур'єр Київ"),
        (DELIVERY_TRUCK, "Вантажне авто"),
    )

    PAYMENT_CASH = "cash"
    PAYMENT_CARD = "card"
    PAYMENT_INVOICE = "invoice"
    PAYMENT_CHOICES = (
        (PAYMENT_CASH, "Готівка"),
        (PAYMENT_CARD, "Картка"),
        (PAYMENT_INVOICE, "Безготівковий"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=NEW)

    first_name = models.CharField("Ім'я", max_length=80)
    last_name = models.CharField("Прізвище", max_length=80, blank=True)
    phone = models.CharField("Телефон", max_length=20)
    email = models.EmailField("Email", blank=True)

    delivery = models.CharField("Доставка", max_length=16, choices=DELIVERY_CHOICES, default=DELIVERY_NOVA)
    delivery_address = models.CharField("Адреса доставки", max_length=255, blank=True)
    delivery_cost = models.DecimalField("Вартість доставки", max_digits=10, decimal_places=2, default=0)

    payment = models.CharField("Оплата", max_length=16, choices=PAYMENT_CHOICES, default=PAYMENT_CARD)

    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)
    discount = models.DecimalField("Знижка", max_digits=10, decimal_places=2, default=0)

    subtotal = models.DecimalField("Сума товарів", max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField("Разом", max_digits=12, decimal_places=2, default=0)

    comment = models.TextField("Коментар", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Замовлення"
        verbose_name_plural = "Замовлення"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"Замовлення #{self.pk}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "Позиція замовлення"
        verbose_name_plural = "Позиції замовлення"

    def __str__(self) -> str:
        return f"{self.name} × {self.quantity}"

    @property
    def line_total(self):
        return self.price * self.quantity
