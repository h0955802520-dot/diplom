from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import RangeNumericFilter, ChoicesDropdownFilter
from unfold.decorators import action, display

from .models import Brand, Category, Product, ProductType, Review


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "slug")


@admin.register(ProductType)
class ProductTypeAdmin(ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "slug")


@admin.register(Brand)
class BrandAdmin(ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "slug")


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = (
        "legacy_id",
        "name",
        "display_price",
        "stock_badge",
        "product_type",
        "brand",
        "badges",
    )
    list_display_links = ("name",)
    list_filter = (
        ("product_type", admin.RelatedFieldListFilter),
        ("category", admin.RelatedFieldListFilter),
        ("brand", admin.RelatedFieldListFilter),
        ("age", ChoicesDropdownFilter),
        ("price", RangeNumericFilter),
        "promo",
        "popular",
        "is_new",
    )
    list_filter_submit = True
    search_fields = ("name", "legacy_id", "brand__name")
    prepopulated_fields = {"slug": ("name",)}
    list_editable_disabled = False
    list_per_page = 25
    autocomplete_fields = ("product_type", "category", "brand")
    fieldsets = (
        ("Основне", {
            "fields": ("legacy_id", "name", "slug", "image", "image_url", "description"),
        }),
        ("Ціни", {
            "fields": ("price", "old_price", "wholesale_price", "partner_price"),
        }),
        ("Категоризація", {
            "fields": ("product_type", "category", "brand", "age"),
        }),
        ("Залишки та бейджі", {
            "fields": ("stock", "promo", "popular", "is_new"),
        }),
    )
    readonly_fields = ()
    actions = ["mark_as_promo", "remove_promo", "mark_as_popular"]

    @display(description="Ціна", ordering="price")
    def display_price(self, obj):
        if obj.old_price and obj.old_price > obj.price:
            return format_html(
                '<span style="text-decoration:line-through;color:#94a3b8;margin-right:6px;">{} грн</span>'
                '<strong style="color:#ea580c;">{} грн</strong>',
                obj.old_price, obj.price,
            )
        return format_html("<strong>{} грн</strong>", obj.price)

    @display(description="Залишок", ordering="stock", label={
        "in": "success", "low": "warning", "out": "danger"
    })
    def stock_badge(self, obj):
        status = obj.stock_status
        text = "В наявності" if status == "in" else ("Закінчується" if status == "low" else "Немає")
        return obj.stock_status, f"{text} ({obj.stock})"

    @display(description="Мітки")
    def badges(self, obj):
        parts = []
        if obj.promo:
            parts.append('<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">ЗНИЖКА</span>')
        if obj.popular:
            parts.append('<span style="background:#fed7aa;color:#9a3412;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">ХІТ</span>')
        if obj.is_new:
            parts.append('<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">НОВИНКА</span>')
        return format_html(" ".join(parts)) if parts else "—"

    @action(description="Позначити як акційні")
    def mark_as_promo(self, request, queryset):
        n = queryset.update(promo=True)
        self.message_user(request, f"Позначено акційними: {n}")

    @action(description="Зняти акцію")
    def remove_promo(self, request, queryset):
        n = queryset.update(promo=False)
        self.message_user(request, f"Знято акцію з: {n}")

    @action(description="Позначити як хіт")
    def mark_as_popular(self, request, queryset):
        n = queryset.update(popular=True)
        self.message_user(request, f"Позначено хітами: {n}")


@admin.register(Review)
class ReviewAdmin(ModelAdmin):
    list_display = ("product", "user", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("product__name", "user__username", "comment")
    autocomplete_fields = ("product", "user")
