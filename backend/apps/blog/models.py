from django.db import models
from django_ckeditor_5.fields import CKEditor5Field


class BlogCategory(models.Model):
    name = models.CharField("Категорія", max_length=64, unique=True)
    slug = models.SlugField(max_length=80, unique=True)

    class Meta:
        verbose_name = "Категорія блогу"
        verbose_name_plural = "Категорії блогу"
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name


class BlogPost(models.Model):
    legacy_id = models.PositiveIntegerField(unique=True, db_index=True)
    category = models.ForeignKey(BlogCategory, on_delete=models.PROTECT, related_name="posts")
    title = models.CharField("Заголовок", max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    date_label = models.CharField("Дата (текст)", max_length=64, blank=True)
    excerpt = models.TextField("Короткий опис")
    content = CKEditor5Field("Повний текст", config_name="blog", blank=True)
    image_url = models.URLField("URL зображення", max_length=500, blank=True)
    image = models.ImageField(upload_to="blog/", blank=True, null=True)
    published_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Стаття"
        verbose_name_plural = "Статті"
        ordering = ("-legacy_id",)

    def __str__(self) -> str:
        return self.title
