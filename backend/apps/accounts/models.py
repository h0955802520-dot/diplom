from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    TIER_REGULAR = "regular"
    TIER_WHOLESALE = "wholesale"
    TIER_PARTNER = "partner"
    TIER_CHOICES = (
        (TIER_REGULAR, "Звичайний"),
        (TIER_WHOLESALE, "Оптовий"),
        (TIER_PARTNER, "Партнер"),
    )

    phone = models.CharField("Телефон", max_length=20, blank=True)
    city = models.CharField("Місто", max_length=80, blank=True)
    address = models.CharField("Адреса", max_length=255, blank=True)
    tier = models.CharField(
        "Категорія клієнта",
        max_length=16,
        choices=TIER_CHOICES,
        default=TIER_REGULAR,
        help_text="Звичайний — роздрібні ціни; Оптовий — оптові ціни; Партнер — партнерські ціни.",
    )
    company_name = models.CharField("Назва компанії", max_length=200, blank=True)
    tax_id = models.CharField("ЄДРПОУ/ІПН", max_length=20, blank=True)
    notes = models.TextField("Примітки адміна", blank=True)

    class Meta:
        verbose_name = "Користувач"
        verbose_name_plural = "Користувачі"

    def __str__(self) -> str:
        suffix = ""
        if self.tier != self.TIER_REGULAR:
            suffix = f" [{self.get_tier_display()}]"
        return (self.username or self.email or f"User #{self.pk}") + suffix


class Address(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField("Назва", max_length=60, default="Доставка", help_text="Напр. «Дім», «Офіс»")
    city = models.CharField("Місто", max_length=80)
    street = models.CharField("Вулиця та номер", max_length=200)
    apartment = models.CharField("Квартира/офіс", max_length=20, blank=True)
    zip_code = models.CharField("Індекс", max_length=10, blank=True)
    np_warehouse = models.CharField("Відділення НП", max_length=200, blank=True)
    is_default = models.BooleanField("За замовчуванням", default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Адреса"
        verbose_name_plural = "Адреси"
        ordering = ("-is_default", "-created_at")

    def __str__(self) -> str:
        return f"{self.label}: {self.city}, {self.street}"
