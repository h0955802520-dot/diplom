from django.contrib import admin

from .models import Brand, Category, Product, ProductType, Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "legacy_id",
        "name",
        "price",
        "old_price",
        "product_type",
        "brand",
        "stock",
        "promo",
        "popular",
        "is_new",
    )
    list_filter = ("product_type", "category", "brand", "promo", "popular", "is_new")
    search_fields = ("name", "legacy_id")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("price", "stock", "promo", "popular", "is_new")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "created_at")
    list_filter = ("rating",)
    search_fields = ("product__name", "user__username", "comment")
