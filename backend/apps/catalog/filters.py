import django_filters as filters

from .models import Product


class ProductFilter(filters.FilterSet):
    type = filters.CharFilter(field_name="product_type__slug")
    category = filters.CharFilter(field_name="category__slug")
    brand = filters.CharFilter(field_name="brand__slug")
    age = filters.CharFilter(field_name="age")
    price_min = filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = filters.NumberFilter(field_name="price", lookup_expr="lte")
    promo = filters.BooleanFilter(field_name="promo")
    popular = filters.BooleanFilter(field_name="popular")
    is_new = filters.BooleanFilter(field_name="is_new")
    in_stock = filters.BooleanFilter(method="filter_in_stock")

    class Meta:
        model = Product
        fields = ("type", "category", "brand", "age", "promo", "popular", "is_new")

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)
