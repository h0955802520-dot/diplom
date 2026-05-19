"""
Django settings for budmaster project.
"""

from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    raw = os.environ.get(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-insecure-secret-change-me")

DEBUG = env_bool("DJANGO_DEBUG", True)

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")


INSTALLED_APPS = [
    # Unfold (modern admin theme) — має йти ПЕРЕД django.contrib.admin
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.forms",
    "unfold.contrib.inlines",
    "unfold.contrib.import_export",

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "django_ckeditor_5",

    # local
    "apps.accounts",
    "apps.catalog",
    "apps.cart",
    "apps.orders",
    "apps.blog",
    "apps.submissions",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "budmaster.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "budmaster.wsgi.application"


# Database — Postgres via DATABASE_URL, SQLite fallback for local dev
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {"default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


AUTH_USER_MODEL = "accounts.User"
LOGIN_REDIRECT_URL = "/admin/"
LOGIN_URL = "/admin/login/"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


LANGUAGE_CODE = "uk"
TIME_ZONE = "Europe/Kyiv"
USE_I18N = True
USE_TZ = True


STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"

# WhiteNoise — gzip + immutable hashes у проді
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
# В DEBUG-режимі manifest вимикаємо, щоб не треба було робити collectstatic перед runserver
if DEBUG:
    STORAGES["staticfiles"]["BACKEND"] = "django.contrib.staticfiles.storage.StaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.environ.get("JWT_ACCESS_LIFETIME_MIN", 60))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.environ.get("JWT_REFRESH_LIFETIME_DAYS", 7))),
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# CORS — фронт і бек на одному домені, тож CORS потрібен лише якщо ви додасте
# окремий піддомен для API. Залишаємо налаштування для гнучкості.
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOW_CREDENTIALS = True


# ===== django-unfold (admin theme) =====
# Палітра збігається з фронтом: амбер #f59e0b + темна сталь #1e293b
UNFOLD = {
    "SITE_TITLE": "БудМайстер — Адмін",
    "SITE_HEADER": "БудМайстер",
    "SITE_SUBHEADER": "Панель адміністратора",
    "SITE_URL": "/",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "SHOW_BACK_BUTTON": True,
    "THEME": None,  # None = користувач може перемикати dark/light
    "COLORS": {
        # primary — амбер (як --primary на фронті)
        "primary": {
            "50":  "255 251 235",
            "100": "254 243 199",
            "200": "253 230 138",
            "300": "252 211 77",
            "400": "251 191 36",
            "500": "245 158 11",
            "600": "217 119 6",
            "700": "180 83 9",
            "800": "146 64 14",
            "900": "120 53 15",
            "950": "69 26 3",
        },
        "font": {
            "subtle-light": "var(--color-base-500)",
            "subtle-dark": "var(--color-base-400)",
            "default-light": "var(--color-base-600)",
            "default-dark": "var(--color-base-300)",
            "important-light": "var(--color-base-900)",
            "important-dark": "var(--color-base-100)",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": "Огляд",
                "separator": True,
                "items": [
                    {
                        "title": "Дашборд",
                        "icon": "dashboard",
                        "link": "/admin/",
                    },
                ],
            },
            {
                "title": "Магазин",
                "separator": True,
                "items": [
                    {"title": "Товари", "icon": "inventory_2", "link": "/admin/catalog/product/"},
                    {"title": "Категорії", "icon": "category", "link": "/admin/catalog/category/"},
                    {"title": "Типи товарів", "icon": "label", "link": "/admin/catalog/producttype/"},
                    {"title": "Бренди", "icon": "verified", "link": "/admin/catalog/brand/"},
                    {"title": "Відгуки", "icon": "rate_review", "link": "/admin/catalog/review/"},
                ],
            },
            {
                "title": "Продажі",
                "separator": True,
                "items": [
                    {"title": "Замовлення", "icon": "receipt_long", "link": "/admin/orders/order/"},
                    {"title": "Повернення", "icon": "assignment_return", "link": "/admin/orders/returnrequest/"},
                    {"title": "Промокоди", "icon": "sell", "link": "/admin/orders/promocode/"},
                ],
            },
            {
                "title": "Контент",
                "separator": True,
                "items": [
                    {"title": "Статті блогу", "icon": "article", "link": "/admin/blog/blogpost/"},
                    {"title": "Категорії блогу", "icon": "folder", "link": "/admin/blog/blogcategory/"},
                ],
            },
            {
                "title": "Заявки",
                "separator": True,
                "items": [
                    {"title": "Контактні форми", "icon": "contact_mail", "link": "/admin/submissions/contactsubmission/"},
                    {"title": "Підписки на розсилку", "icon": "mail", "link": "/admin/submissions/newslettersubscription/"},
                ],
            },
            {
                "title": "Користувачі",
                "separator": True,
                "items": [
                    {"title": "Клієнти", "icon": "group", "link": "/admin/accounts/user/"},
                ],
            },
        ],
    },
    "DASHBOARD_CALLBACK": "apps.accounts.dashboard.dashboard_callback",
}


# ===== django-ckeditor-5 (rich text editor for blog) =====
CKEDITOR_5_CONFIGS = {
    "default": {
        "toolbar": [
            "heading", "|",
            "bold", "italic", "link", "bulletedList", "numberedList", "|",
            "blockQuote", "imageUpload", "|",
            "undo", "redo",
        ],
    },
    "blog": {
        "blockToolbar": ["paragraph", "heading1", "heading2", "heading3", "|", "bulletedList", "numberedList", "|", "blockQuote"],
        "toolbar": [
            "heading", "|",
            "outdent", "indent", "|",
            "bold", "italic", "link", "underline", "strikethrough", "highlight", "|",
            "bulletedList", "numberedList", "todoList", "|",
            "code", "blockQuote", "codeBlock", "|",
            "imageUpload", "insertImage", "mediaEmbed", "|",
            "alignment", "|",
            "horizontalLine", "removeFormat", "|",
            "undo", "redo",
        ],
        "image": {
            "toolbar": ["imageTextAlternative", "imageStyle:alignLeft", "imageStyle:alignRight", "imageStyle:alignCenter", "imageStyle:side"],
            "styles": ["full", "side", "alignLeft", "alignRight", "alignCenter"],
        },
        "heading": {
            "options": [
                {"model": "paragraph", "title": "Параграф", "class": "ck-heading_paragraph"},
                {"model": "heading2", "view": "h2", "title": "Заголовок 2", "class": "ck-heading_heading2"},
                {"model": "heading3", "view": "h3", "title": "Заголовок 3", "class": "ck-heading_heading3"},
            ],
        },
    },
}
CKEDITOR_5_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
