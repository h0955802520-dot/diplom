from django.contrib import admin

from .models import Order, OrderItem, PromoCode


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "name", "price", "quantity")


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "type", "value", "label", "active", "min_order", "valid_until")
    list_editable = ("active",)
    search_fields = ("code",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "delivery", "payment", "total", "created_at")
    list_filter = ("status", "delivery", "payment")
    search_fields = ("first_name", "last_name", "phone", "email")
    inlines = [OrderItemInline]
    readonly_fields = ("subtotal", "discount", "delivery_cost", "total", "created_at", "updated_at")
