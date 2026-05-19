from django.conf import settings
from django.db import models


class Category(models.Model):
    """Високорівневі категорії з фронту: construction / finishing."""

    slug = models.SlugField(max_length=60, unique=True)
    name = models.CharField("Назва", max_length=120)

    class Meta:
        verbose_name = "Категорія"
        verbose_name_plural = "Категорії"
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name


class ProductType(models.Model):
    """Тип товару: cement, brick, tool, paint, metal, electric, finishing."""

    slug = models.SlugField(max_length=60, unique=True)
    name = models.CharField("Назва", max_length=120)

    class Meta:
        verbose_name = "Тип товару"
        verbose_name_plural = "Типи товарів"
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name


class Brand(models.Model):
    slug = models.SlugField(max_length=60, unique=True)
    name = models.CharField("Назва", max_length=120)

    class Meta:
        verbose_name = "Бренд"
        verbose_name_plural = "Бренди"
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    AGE_CHOICES = (
        ("small", "Малий"),
        ("medium", "Середній"),
        ("large", "Великий"),
    )

    legacy_id = models.CharField("Legacy ID (з js.js)", max_length=10, unique=True, db_index=True)
    name = models.CharField("Назва", max_length=255)
    slug = models.SlugField(max_length=255, unique=True)

    price = models.DecimalField("Ціна", max_digits=10, decimal_places=2)
    old_price = models.DecimalField("Стара ціна", max_digits=10, decimal_places=2, null=True, blank=True)

    product_type = models.ForeignKey(ProductType, on_delete=models.PROTECT, related_name="products")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products")

    age = models.CharField("Фасування", max_length=10, choices=AGE_CHOICES, default="medium")
    stock = models.PositiveIntegerField("Залишок", default=0)

    promo = models.BooleanField("Акція", default=False)
    popular = models.BooleanField("Хіт", default=False)
    is_new = models.BooleanField("Новинка", default=False)

    image_url = models.URLField("URL зображення", max_length=500, blank=True)
    image = models.ImageField("Файл зображення", upload_to="products/", blank=True, null=True)

    description = models.TextField("Опис", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товари"
        ordering = ("legacy_id",)
        indexes = (
            models.Index(fields=("product_type",)),
            models.Index(fields=("brand",)),
            models.Index(fields=("promo",)),
            models.Index(fields=("popular",)),
            models.Index(fields=("is_new",)),
        )

    def __str__(self) -> str:
        return self.name

    @property
    def discount_percent(self) -> int | None:
        if self.old_price and self.old_price > self.price:
            return int(round((self.old_price - self.price) / self.old_price * 100))
        return None

    @property
    def stock_status(self) -> str:
        if self.stock == 0:
            return "out"
        if self.stock < 20:
            return "low"
        return "in"


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField("Оцінка", default=5)
    comment = models.TextField("Коментар", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Відгук"
        verbose_name_plural = "Відгуки"
        ordering = ("-created_at",)
        constraints = (
            models.UniqueConstraint(fields=("product", "user"), name="unique_review_per_user_product"),
        )

    def __str__(self) -> str:
        return f"{self.user} → {self.product} ({self.rating})"
