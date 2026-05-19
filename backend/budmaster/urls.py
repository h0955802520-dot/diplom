from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
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

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api_v1)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
