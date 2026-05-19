from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.filters.admin import ChoicesDropdownFilter, RangeNumericFilter
from unfold.decorators import action, display

from .models import Order, OrderItem, PromoCode, ReturnRequest


class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "name", "price", "quantity")
    tab = True


@admin.register(PromoCode)
class PromoCodeAdmin(ModelAdmin):
    list_display = ("code", "type", "value_display", "active_badge", "min_order", "valid_until")
    list_filter = ("active", "type", "valid_until")
    list_editable = ("min_order",)
    search_fields = ("code", "label")
    actions = ["activate_codes", "deactivate_codes"]
    fieldsets = (
        ("Код", {"fields": ("code", "label", "active")}),
        ("Знижка", {"fields": ("type", "value", "min_order")}),
        ("Термін дії", {"fields": ("valid_until",)}),
    )

    @display(description="Значення")
    def value_display(self, obj):
        if obj.type == PromoCode.PERCENT:
            return f"−{obj.value}%"
        return f"−{obj.value} грн"

    @display(description="Активний", label={"yes": "success", "no": "danger"})
    def active_badge(self, obj):
        return ("yes", "Так") if obj.active else ("no", "Ні")

    @action(description="Активувати обрані")
    def activate_codes(self, request, queryset):
        n = queryset.update(active=True)
        self.message_user(request, f"Активовано: {n}")

    @action(description="Деактивувати обрані")
    def deactivate_codes(self, request, queryset):
        n = queryset.update(active=False)
        self.message_user(request, f"Деактивовано: {n}")


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = (
        "id",
        "customer",
        "status_badge",
        "delivery_display",
        "payment_display",
        "total_display",
        "created_at",
    )
    list_filter = (
        ("status", ChoicesDropdownFilter),
        ("delivery", ChoicesDropdownFilter),
        ("payment", ChoicesDropdownFilter),
        ("total", RangeNumericFilter),
        "created_at",
    )
    list_filter_submit = True
    search_fields = ("first_name", "last_name", "phone", "email", "id")
    inlines = [OrderItemInline]
    readonly_fields = ("subtotal", "discount", "delivery_cost", "total", "created_at", "updated_at")
    autocomplete_fields = ("user", "promo_code")
    fieldsets = (
        ("Статус", {"fields": ("status",)}),
        ("Клієнт", {"fields": ("user", "first_name", "last_name", "phone", "email")}),
        ("Доставка", {"fields": ("delivery", "delivery_address", "delivery_cost")}),
        ("Оплата", {"fields": ("payment",)}),
        ("Сума", {"fields": ("subtotal", "promo_code", "discount", "total")}),
        ("Додатково", {"fields": ("comment", "created_at", "updated_at")}),
    )
    actions = ["mark_processing", "mark_shipped", "mark_delivered", "mark_cancelled"]
    list_per_page = 25

    @display(description="Клієнт")
    def customer(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        if obj.user:
            return format_html("<strong>{}</strong><br><small style='color:#64748b;'>{}</small>", name or obj.user.username, obj.phone)
        return format_html("<span>{}</span><br><small style='color:#64748b;'>{}</small>", name, obj.phone)

    @display(description="Статус", label={
        "new": "info", "processing": "warning", "shipped": "warning",
        "delivered": "success", "cancelled": "danger",
    })
    def status_badge(self, obj):
        return obj.status, obj.get_status_display()

    @display(description="Доставка")
    def delivery_display(self, obj):
        return obj.get_delivery_display()

    @display(description="Оплата")
    def payment_display(self, obj):
        return obj.get_payment_display()

    @display(description="Разом", ordering="total")
    def total_display(self, obj):
        return format_html("<strong>{} грн</strong>", obj.total)

    def _set_status(self, request, queryset, status, label):
        n = queryset.update(status=status, updated_at=timezone.now())
        self.message_user(request, f"{label}: {n} замовлень")

    @action(description="→ В обробці")
    def mark_processing(self, request, queryset):
        self._set_status(request, queryset, Order.PROCESSING, "В обробці")

    @action(description="→ Відправлено")
    def mark_shipped(self, request, queryset):
        self._set_status(request, queryset, Order.SHIPPED, "Відправлено")

    @action(description="→ Доставлено")
    def mark_delivered(self, request, queryset):
        self._set_status(request, queryset, Order.DELIVERED, "Доставлено")

    @action(description="✗ Скасувати")
    def mark_cancelled(self, request, queryset):
        self._set_status(request, queryset, Order.CANCELLED, "Скасовано")


@admin.register(ReturnRequest)
class ReturnRequestAdmin(ModelAdmin):
    list_display = ("id", "order_item_link", "user", "reason_display", "status_badge", "quantity", "refund_amount", "created_at")
    list_filter = (("status", ChoicesDropdownFilter), ("reason", ChoicesDropdownFilter), "created_at")
    list_filter_submit = True
    search_fields = ("order_item__name", "user__username", "comment")
    autocomplete_fields = ("user",)
    raw_id_fields = ("order_item",)
    readonly_fields = ("created_at", "processed_at")
    actions = ["approve_returns", "reject_returns", "mark_refunded"]
    fieldsets = (
        ("Запит", {"fields": ("order_item", "user", "quantity", "reason", "comment")}),
        ("Обробка", {"fields": ("status", "admin_note", "refund_amount", "processed_at")}),
        ("Дати", {"fields": ("created_at",)}),
    )

    @display(description="Товар")
    def order_item_link(self, obj):
        return obj.order_item.name

    @display(description="Причина")
    def reason_display(self, obj):
        return obj.get_reason_display()

    @display(description="Статус", label={
        "pending": "warning", "approved": "info",
        "rejected": "danger", "refunded": "success",
    })
    def status_badge(self, obj):
        return obj.status, obj.get_status_display()

    def _set_status(self, request, queryset, status, label):
        n = queryset.update(status=status, processed_at=timezone.now())
        self.message_user(request, f"{label}: {n}")

    @action(description="✓ Прийняти")
    def approve_returns(self, request, queryset):
        self._set_status(request, queryset, ReturnRequest.APPROVED, "Прийнято")

    @action(description="✗ Відхилити")
    def reject_returns(self, request, queryset):
        self._set_status(request, queryset, ReturnRequest.REJECTED, "Відхилено")

    @action(description="💰 Повернено")
    def mark_refunded(self, request, queryset):
        self._set_status(request, queryset, ReturnRequest.REFUNDED, "Повернено")
