from rest_framework import serializers

from .models import BlogCategory, BlogPost


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ("id", "slug", "name")


class BlogPostListSerializer(serializers.ModelSerializer):
    cat = serializers.SlugRelatedField(source="category", slug_field="name", read_only=True)
    img = serializers.SerializerMethodField()
    date = serializers.CharField(source="date_label", read_only=True)

    class Meta:
        model = BlogPost
        fields = ("id", "legacy_id", "cat", "date", "title", "slug", "excerpt", "img")

    def get_img(self, obj: BlogPost) -> str:
        if obj.image:
            request = self.context.get("request")
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return obj.image_url


class BlogPostDetailSerializer(BlogPostListSerializer):
    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + ("content", "published_at")
