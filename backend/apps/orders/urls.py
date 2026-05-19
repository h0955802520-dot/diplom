from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import OrderViewSet, PromoCheckView

router = DefaultRouter()
router.register("", OrderViewSet, basename="order")

urlpatterns = [
    path("promo/check/", PromoCheckView.as_view(), name="promo-check"),
    path("", include(router.urls)),
]
