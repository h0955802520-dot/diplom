from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline

from .models import Cart, CartItem, WishlistItem


class CartItemInline(TabularInline):
    model = CartItem
    extra = 0
    tab = True


@admin.register(Cart)
class CartAdmin(ModelAdmin):
    list_display = ("user", "items_total", "subtotal", "updated_at")
    inlines = [CartItemInline]
    autocomplete_fields = ("user",)
    search_fields = ("user__username", "user__email")


@admin.register(WishlistItem)
class WishlistAdmin(ModelAdmin):
    list_display = ("user", "product", "created_at")
    search_fields = ("user__username", "product__name")
    autocomplete_fields = ("user", "product")
