from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CartItemView, CartView, WishlistViewSet

router = DefaultRouter()
router.register("wishlist", WishlistViewSet, basename="wishlist")

urlpatterns = [
    path("", CartView.as_view(), name="cart"),
    path("items/<int:pk>/", CartItemView.as_view(), name="cart-item"),
    path("", include(router.urls)),
]
