from rest_framework.routers import DefaultRouter

from .views import BlogCategoryViewSet, BlogPostViewSet

router = DefaultRouter()
router.register("categories", BlogCategoryViewSet, basename="blog-category")
router.register("posts", BlogPostViewSet, basename="blog-post")

urlpatterns = router.urls
