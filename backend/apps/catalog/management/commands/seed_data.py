"""
Seed the database with catalog data, blog posts and promo codes.

Source: bundled JSON fixtures in ``seed_data_files/`` (extracted from the
original frontend ``js/js.js``). Idempotent — re-running updates existing
records by legacy_id / code.

Usage:
    python manage.py seed_data
    python manage.py seed_data --flush     # wipe before seeding
"""
from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.blog.models import BlogCategory, BlogPost
from apps.catalog.models import Brand, Category, Product, ProductType
from apps.orders.models import PromoCode


DATA_DIR = Path(__file__).resolve().parent / "seed_data_files"


CATEGORY_NAMES = {
    "construction": "Будівництво",
    "finishing": "Оздоблення",
}

PRODUCT_TYPE_NAMES = {
    "cement": "Цемент та суміші",
    "brick": "Цегла та блоки",
    "tool": "Інструмент",
    "paint": "Фарби та лаки",
    "metal": "Металопрокат",
    "electric": "Електрика",
    "finishing": "Оздоблення",
}

BRAND_NAMES = {
    "knauf": "Knauf",
    "ceresit": "Ceresit",
    "bosch": "Bosch",
    "makita": "Makita",
    "dewalt": "DeWalt",
    "hilti": "Hilti",
    "stanley": "Stanley",
    "schneider": "Schneider Electric",
    "henkel": "Henkel",
    "sniezka": "Sniezka",
    "other": "Інші",
}


def make_unique_slug(model, base: str, *, instance_pk: int | None = None) -> str:
    slug = slugify(base, allow_unicode=False) or "item"
    candidate = slug
    n = 2
    while model.objects.filter(slug=candidate).exclude(pk=instance_pk).exists():
        candidate = f"{slug}-{n}"
        n += 1
    return candidate


class Command(BaseCommand):
    help = "Seed catalog (products, categories, brands), blog posts, and promo codes from JSON fixtures"

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Wipe existing rows before seeding")

    @transaction.atomic
    def handle(self, *args, **opts):
        products_file = DATA_DIR / "products.json"
        blog_file = DATA_DIR / "blog.json"
        if not products_file.exists() or not blog_file.exists():
            self.stderr.write(f"Не знайдено фікстури в {DATA_DIR}")
            return

        if opts["flush"]:
            self.stdout.write("Чищу таблиці...")
            Product.objects.all().delete()
            BlogPost.objects.all().delete()
            PromoCode.objects.all().delete()

        products_data = json.loads(products_file.read_text(encoding="utf-8"))
        blog_data = json.loads(blog_file.read_text(encoding="utf-8"))
        self.stdout.write(f"Завантажено: {len(products_data)} товарів, {len(blog_data)} постів")

        # --- довідники ---
        categories = {slug: Category.objects.get_or_create(slug=slug, defaults={"name": name})[0]
                      for slug, name in CATEGORY_NAMES.items()}
        types = {slug: ProductType.objects.get_or_create(slug=slug, defaults={"name": name})[0]
                 for slug, name in PRODUCT_TYPE_NAMES.items()}
        brands = {slug: Brand.objects.get_or_create(slug=slug, defaults={"name": name})[0]
                  for slug, name in BRAND_NAMES.items()}

        # --- товари ---
        created = updated = 0
        for p in products_data:
            cat = categories.setdefault(
                p["category"],
                Category.objects.get_or_create(slug=p["category"], defaults={"name": p["category"].title()})[0],
            )
            ptype = types.setdefault(
                p["type"],
                ProductType.objects.get_or_create(slug=p["type"], defaults={"name": p["type"].title()})[0],
            )
            brand = brands.setdefault(
                p["brand"],
                Brand.objects.get_or_create(slug=p["brand"], defaults={"name": p["brand"].title()})[0],
            )

            existing = Product.objects.filter(legacy_id=p["id"]).first()
            slug = existing.slug if existing else make_unique_slug(Product, f"{p['name']}-{p['id']}")
            defaults = {
                "name": p["name"],
                "slug": slug,
                "price": Decimal(str(p["price"])),
                "old_price": Decimal(str(p["old_price"])) if p["old_price"] is not None else None,
                "product_type": ptype,
                "category": cat,
                "brand": brand,
                "age": p["age"],
                "stock": p["stock"],
                "promo": p["promo"],
                "popular": p["popular"],
                "is_new": p["is_new"],
                "image_url": p.get("image_url", ""),
            }
            obj, is_created = Product.objects.update_or_create(legacy_id=p["id"], defaults=defaults)
            created += int(is_created)
            updated += int(not is_created)

        self.stdout.write(f"Товари: створено {created}, оновлено {updated}")

        # --- блог ---
        blog_created = blog_updated = 0
        for post in blog_data:
            blog_cat, _ = BlogCategory.objects.get_or_create(
                name=post["cat"],
                defaults={"slug": make_unique_slug(BlogCategory, post["cat"])},
            )
            existing_post = BlogPost.objects.filter(legacy_id=post["id"]).first()
            slug = existing_post.slug if existing_post else make_unique_slug(BlogPost, f"{post['title']}-{post['id']}")
            defaults = {
                "category": blog_cat,
                "title": post["title"],
                "slug": slug,
                "date_label": post["date"],
                "excerpt": post["excerpt"],
                "image_url": post.get("image_url", ""),
            }
            _, is_created = BlogPost.objects.update_or_create(legacy_id=post["id"], defaults=defaults)
            blog_created += int(is_created)
            blog_updated += int(not is_created)

        self.stdout.write(f"Блог: створено {blog_created}, оновлено {blog_updated}")

        # --- промокоди ---
        promos = [
            {"code": "BUD10", "type": PromoCode.PERCENT, "value": Decimal("10"), "label": "-10%"},
            {"code": "BUD500", "type": PromoCode.FIXED, "value": Decimal("500"), "label": "-500 грн", "min_order": Decimal("1000")},
            {"code": "NEW2026", "type": PromoCode.PERCENT, "value": Decimal("15"), "label": "-15%"},
        ]
        for promo in promos:
            PromoCode.objects.update_or_create(code=promo["code"], defaults=promo)

        self.stdout.write(self.style.SUCCESS("Сидинг завершено."))
