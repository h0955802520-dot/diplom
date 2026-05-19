from django.db import models


class ContactSubmission(models.Model):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    STATUS_CHOICES = (
        (NEW, "Нова"),
        (IN_PROGRESS, "В обробці"),
        (RESOLVED, "Опрацьовано"),
    )

    SOURCE_CONTACT = "contact"
    SOURCE_FOOTER = "footer"
    SOURCE_BUSINESS = "business"
    SOURCE_OTHER = "other"
    SOURCE_CHOICES = (
        (SOURCE_CONTACT, "Сторінка контактів"),
        (SOURCE_FOOTER, "Футер"),
        (SOURCE_BUSINESS, "Для бізнесу"),
        (SOURCE_OTHER, "Інше"),
    )

    name = models.CharField("Ім'я", max_length=120)
    email = models.EmailField("Email", blank=True)
    phone = models.CharField("Телефон", max_length=20, blank=True)
    subject = models.CharField("Тема", max_length=200, blank=True)
    message = models.TextField("Повідомлення")
    source = models.CharField("Джерело", max_length=16, choices=SOURCE_CHOICES, default=SOURCE_CONTACT)
    status = models.CharField("Статус", max_length=16, choices=STATUS_CHOICES, default=NEW)
    created_at = models.DateTimeField("Створено", auto_now_add=True)
    processed_at = models.DateTimeField("Опрацьовано", null=True, blank=True)
    admin_note = models.TextField("Примітка адміна", blank=True)

    class Meta:
        verbose_name = "Контактна заявка"
        verbose_name_plural = "Контактні заявки"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"{self.name} ({self.get_source_display()}) — {self.created_at:%d.%m.%Y}"


class NewsletterSubscription(models.Model):
    email = models.EmailField("Email", unique=True)
    is_active = models.BooleanField("Активна", default=True)
    confirmed = models.BooleanField("Підтверджена", default=False)
    created_at = models.DateTimeField("Підписався", auto_now_add=True)
    unsubscribed_at = models.DateTimeField("Відписався", null=True, blank=True)

    class Meta:
        verbose_name = "Підписка на розсилку"
        verbose_name_plural = "Підписки на розсилку"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.email
