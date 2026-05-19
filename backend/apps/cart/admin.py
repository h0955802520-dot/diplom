from django.contrib import admin

from .models import Cart, CartItem, WishlistItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "items_total", "subtotal", "updated_at")
    inlines = [CartItemInline]


@admin.register(WishlistItem)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")
    search_fields = ("user__username", "product__name")
