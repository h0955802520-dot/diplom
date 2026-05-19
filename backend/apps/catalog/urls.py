from rest_framework.routers import DefaultRouter

from .views import BrandViewSet, CategoryViewSet, ProductTypeViewSet, ProductViewSet, ReviewViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("types", ProductTypeViewSet, basename="product-type")
router.register("brands", BrandViewSet, basename="brand")
router.register("products", ProductViewSet, basename="product")
router.register("reviews", ReviewViewSet, basename="review")

urlpatterns = router.urls
