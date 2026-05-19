from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenRefreshView


def health(_request):
    return JsonResponse({"status": "ok", "service": "budmaster-api"})


api_v1 = [
    path("health/", health, name="health"),
    path("auth/", include("apps.accounts.urls")),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("catalog/", include("apps.catalog.urls")),
    path("cart/", include("apps.cart.urls")),
    path("orders/", include("apps.orders.urls")),
    path("blog/", include("apps.blog.urls")),
]


# Frontend pages (HTML templates served as-is, бо логіка вся в js.js + REST API)
def page(name):
    return TemplateView.as_view(template_name=f"pages/{name}.html")


frontend_pages = [
    path("", page("index"), name="home"),
    path("index.html", page("index")),
    path("shop.html", page("shop"), name="shop"),
    path("product.html", page("product"), name="product"),
    path("cart.html", page("cart"), name="cart"),
    path("checkout.html", page("checkout"), name="checkout"),
    path("about.html", page("about"), name="about"),
    path("contacts.html", page("contacts"), name="contacts"),
    path("services.html", page("services"), name="services"),
    path("business.html", page("business"), name="business"),
    path("blog.html", page("blog"), name="blog"),
    path("article.html", page("article"), name="article"),
]


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api_v1)),
] + frontend_pages

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
