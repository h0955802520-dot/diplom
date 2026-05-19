from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import BlogCategory, BlogPost


@admin.register(BlogCategory)
class BlogCategoryAdmin(ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(BlogPost)
class BlogPostAdmin(ModelAdmin):
    list_display = ("legacy_id", "title", "category", "published_at")
    list_filter = ("category", "published_at")
    search_fields = ("title", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("category",)
    fieldsets = (
        ("Основне", {
            "fields": ("legacy_id", "title", "slug", "category", "date_label"),
        }),
        ("Зображення", {
            "fields": ("image", "image_url"),
        }),
        ("Текст", {
            "fields": ("excerpt", "content"),
            "description": "Поле «Повний текст» — рiч-редактор (CKEditor 5).",
        }),
    )
