from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone = models.CharField("Телефон", max_length=20, blank=True)
    city = models.CharField("Місто", max_length=80, blank=True)
    address = models.CharField("Адреса", max_length=255, blank=True)

    class Meta:
        verbose_name = "Користувач"
        verbose_name_plural = "Користувачі"

    def __str__(self) -> str:
        return self.username or self.email or f"User #{self.pk}"
