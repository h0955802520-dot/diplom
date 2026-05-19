from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from unfold.admin import ModelAdmin, StackedInline
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import action, display
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from .models import Address, User


class AddressInline(StackedInline):
    model = Address
    extra = 0
    tab = True


@admin.register(User)
class CustomUserAdmin(DjangoUserAdmin, ModelAdmin):
    # Unfold-форми (стилізовані поля)
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    list_display = ("username", "email", "full_name", "tier_badge", "phone", "date_joined", "is_staff")
    list_filter = (
        ("tier", ChoicesDropdownFilter),
        "is_staff",
        "is_superuser",
        "is_active",
        "date_joined",
    )
    list_filter_submit = True
    search_fields = ("username", "email", "phone", "first_name", "last_name", "company_name", "tax_id")
    ordering = ("-date_joined",)
    inlines = [AddressInline]

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Контакти", {"fields": ("first_name", "last_name", "email", "phone")}),
        ("Адреса (стара)", {"fields": ("city", "address"), "classes": ("collapse",)}),
        ("Категорія клієнта", {
            "fields": ("tier", "company_name", "tax_id", "notes"),
            "description": "Зміна категорії впливає на ціни, які користувач бачить у каталозі.",
        }),
        ("Права доступу", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Дати", {"fields": ("last_login", "date_joined")}),
    )

    actions = ["set_tier_wholesale", "set_tier_partner", "set_tier_regular"]

    @display(description="Ім'я")
    def full_name(self, obj):
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full or "—"

    @display(description="Категорія", label={
        "regular": "info", "wholesale": "warning", "partner": "success"
    })
    def tier_badge(self, obj):
        return obj.tier, obj.get_tier_display()

    @action(description="Встановити: Оптовий")
    def set_tier_wholesale(self, request, queryset):
        n = queryset.update(tier=User.TIER_WHOLESALE)
        self.message_user(request, f"Переведено в оптовики: {n}")

    @action(description="Встановити: Партнер")
    def set_tier_partner(self, request, queryset):
        n = queryset.update(tier=User.TIER_PARTNER)
        self.message_user(request, f"Переведено в партнери: {n}")

    @action(description="Встановити: Звичайний")
    def set_tier_regular(self, request, queryset):
        n = queryset.update(tier=User.TIER_REGULAR)
        self.message_user(request, f"Переведено в звичайні: {n}")


@admin.register(Address)
class AddressAdmin(ModelAdmin):
    list_display = ("user", "label", "city", "street", "is_default")
    list_filter = ("is_default", "city")
    search_fields = ("user__username", "user__email", "city", "street", "label")
    autocomplete_fields = ("user",)
