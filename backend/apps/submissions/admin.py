from django.contrib import admin
from django.utils import timezone
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import action, display

from .models import ContactSubmission, NewsletterSubscription


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(ModelAdmin):
    list_display = ("name", "contact", "source_display", "status_badge", "subject_short", "created_at")
    list_filter = (
        ("status", ChoicesDropdownFilter),
        ("source", ChoicesDropdownFilter),
        "created_at",
    )
    list_filter_submit = True
    search_fields = ("name", "email", "phone", "subject", "message")
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Заявка", {"fields": ("name", "email", "phone", "subject", "message", "source", "created_at")}),
        ("Обробка", {"fields": ("status", "admin_note", "processed_at")}),
    )
    actions = ["mark_in_progress", "mark_resolved"]

    @display(description="Контакти")
    def contact(self, obj):
        parts = []
        if obj.email: parts.append(obj.email)
        if obj.phone: parts.append(obj.phone)
        return " · ".join(parts) or "—"

    @display(description="Джерело")
    def source_display(self, obj):
        return obj.get_source_display()

    @display(description="Статус", label={
        "new": "warning", "in_progress": "info", "resolved": "success"
    })
    def status_badge(self, obj):
        return obj.status, obj.get_status_display()

    @display(description="Тема")
    def subject_short(self, obj):
        s = obj.subject or obj.message[:60]
        return s[:60] + ("…" if len(s) >= 60 else "")

    @action(description="→ В обробці")
    def mark_in_progress(self, request, queryset):
        n = queryset.update(status=ContactSubmission.IN_PROGRESS, processed_at=timezone.now())
        self.message_user(request, f"В обробці: {n}")

    @action(description="✓ Опрацьовано")
    def mark_resolved(self, request, queryset):
        n = queryset.update(status=ContactSubmission.RESOLVED, processed_at=timezone.now())
        self.message_user(request, f"Опрацьовано: {n}")


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(ModelAdmin):
    list_display = ("email", "active_badge", "confirmed", "created_at", "unsubscribed_at")
    list_filter = ("is_active", "confirmed", "created_at")
    list_filter_submit = True
    search_fields = ("email",)
    actions = ["deactivate"]

    @display(description="Активна", label={"yes": "success", "no": "danger"})
    def active_badge(self, obj):
        return ("yes", "Так") if obj.is_active else ("no", "Ні")

    @action(description="Деактивувати")
    def deactivate(self, request, queryset):
        n = queryset.update(is_active=False, unsubscribed_at=timezone.now())
        self.message_user(request, f"Деактивовано: {n}")
