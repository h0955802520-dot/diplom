from rest_framework import serializers

from .models import Brand, Category, Product, ProductType, Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "slug", "name")


class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = ("id", "slug", "name")


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "slug", "name")


class ProductListSerializer(serializers.ModelSerializer):
    type = serializers.SlugRelatedField(source="product_type", slug_field="slug", read_only=True)
    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    brand = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    img = serializers.SerializerMethodField()
    discount_percent = serializers.IntegerField(read_only=True)
    stock_status = serializers.CharField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "legacy_id",
            "name",
            "slug",
            "price",
            "old_price",
            "type",
            "category",
            "brand",
            "age",
            "stock",
            "stock_status",
            "promo",
            "popular",
            "is_new",
            "img",
            "discount_percent",
        )

    def get_img(self, obj: Product) -> str:
        if obj.image:
            request = self.context.get("request")
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return obj.image_url


class ProductDetailSerializer(ProductListSerializer):
    description = serializers.CharField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ("description",)


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ("id", "product", "user", "rating", "comment", "created_at")
        read_only_fields = ("id", "user", "created_at")
