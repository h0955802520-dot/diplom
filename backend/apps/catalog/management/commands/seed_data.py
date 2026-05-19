"""
Seed the database with catalog data scraped from the legacy frontend
(js/js.js): 100 products, 6 blog posts, 3 promo codes.

Idempotent — re-running updates existing records by legacy_id / slug.

Usage:
    python manage.py seed_data
    python manage.py seed_data --flush     # wipe before seeding
"""
from __future__ import annotations

import re
from decimal import Decimal
from pathlib import Path
from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.blog.models import BlogCategory, BlogPost
from apps.catalog.models import Brand, Category, Product, ProductType
from apps.orders.models import PromoCode


FRONTEND_JS = Path(__file__).resolve().parents[4].parent / "js" / "js.js"


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


IMG_RE = re.compile(r"^\s*(\w+):\s*'([^']+)'\s*,?\s*$")
PRODUCT_RE = re.compile(
    r"\{\s*id:'(?P<id>\d+)',\s*"
    r"name:'(?P<name>(?:[^'\\]|\\.)*)',\s*"
    r"price:(?P<price>\d+(?:\.\d+)?),\s*"
    r"(?:oldPrice:(?P<old>\d+(?:\.\d+)?),\s*)?"
    r"type:'(?P<type>[^']+)',\s*"
    r"category:'(?P<category>[^']+)',\s*"
    r"age:'(?P<age>[^']+)',\s*"
    r"brand:'(?P<brand>[^']+)',\s*"
    r"stock:(?P<stock>\d+),\s*"
    r"promo:(?P<promo>true|false),\s*"
    r"popular:(?P<popular>true|false),\s*"
    r"isNew:(?P<is_new>true|false),\s*"
    r"img:IMG\.(?P<img>\w+)\s*\}",
)
BLOG_RE = re.compile(
    r"\{\s*id:\s*(?P<id>\d+),\s*"
    r"cat:\s*'(?P<cat>[^']+)',\s*"
    r"date:\s*'(?P<date>[^']+)',\s*"
    r"title:\s*'(?P<title>(?:[^'\\]|\\.)*)',\s*"
    r"excerpt:\s*'(?P<excerpt>(?:[^'\\]|\\.)*)',\s*"
    r"img:\s*'(?P<img>[^']+)'\s*\}",
)


def unescape_js(text: str) -> str:
    return text.replace("\\'", "'").replace("\\\\", "\\")


def parse_js_data(js_path: Path) -> tuple[dict[str, str], list[dict[str, Any]], list[dict[str, Any]]]:
    source = js_path.read_text(encoding="utf-8")

    img_block_match = re.search(r"const\s+IMG\s*=\s*\{([^}]+)\};", source)
    if not img_block_match:
        raise RuntimeError("Не знайдено IMG-словник у js.js")
    img_map: dict[str, str] = {}
    for line in img_block_match.group(1).splitlines():
        m = IMG_RE.match(line)
        if m:
            img_map[m.group(1)] = m.group(2)

    products = []
    for m in PRODUCT_RE.finditer(source):
        d = m.groupdict()
        products.append(
            {
                "id": d["id"],
                "name": unescape_js(d["name"]),
                "price": Decimal(d["price"]),
                "old_price": Decimal(d["old"]) if d["old"] else None,
                "type": d["type"],
                "category": d["category"],
                "age": d["age"],
                "brand": d["brand"],
                "stock": int(d["stock"]),
                "promo": d["promo"] == "true",
                "popular": d["popular"] == "true",
                "is_new": d["is_new"] == "true",
                "img_key": d["img"],
            }
        )

    blog_block_match = re.search(r"const\s+BLOG_POSTS\s*=\s*\[(.+?)\];", source, re.DOTALL)
    blog_posts = []
    if blog_block_match:
        for m in BLOG_RE.finditer(blog_block_match.group(1)):
            d = m.groupdict()
            blog_posts.append(
                {
                    "id": int(d["id"]),
                    "cat": unescape_js(d["cat"]),
                    "date": unescape_js(d["date"]),
                    "title": unescape_js(d["title"]),
                    "excerpt": unescape_js(d["excerpt"]),
                    "img": d["img"],
                }
            )

    return img_map, products, blog_posts


def make_unique_slug(model, base: str, *, instance_pk: int | None = None) -> str:
    slug = slugify(base, allow_unicode=False) or "item"
    candidate = slug
    n = 2
    while model.objects.filter(slug=candidate).exclude(pk=instance_pk).exists():
        candidate = f"{slug}-{n}"
        n += 1
    return candidate


class Command(BaseCommand):
    help = "Seed catalog (products, categories, brands), blog posts, and promo codes from legacy js/js.js"

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Wipe existing rows before seeding")

    @transaction.atomic
    def handle(self, *args, **opts):
        if not FRONTEND_JS.exists():
            self.stderr.write(f"Не знайдено фронт-файл: {FRONTEND_JS}")
            return

        if opts["flush"]:
            self.stdout.write("Чищу таблиці...")
            Product.objects.all().delete()
            BlogPost.objects.all().delete()
            PromoCode.objects.all().delete()

        img_map, products_data, blog_data = parse_js_data(FRONTEND_JS)
        self.stdout.write(f"Знайдено в JS: {len(products_data)} товарів, {len(blog_data)} постів")

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
                "price": p["price"],
                "old_price": p["old_price"],
                "product_type": ptype,
                "category": cat,
                "brand": brand,
                "age": p["age"],
                "stock": p["stock"],
                "promo": p["promo"],
                "popular": p["popular"],
                "is_new": p["is_new"],
                "image_url": img_map.get(p["img_key"], ""),
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
                "image_url": post["img"],
            }
            _, is_created = BlogPost.objects.update_or_create(legacy_id=post["id"], defaults=defaults)
            blog_created += int(is_created)
            blog_updated += int(not is_created)

        self.stdout.write(f"Блог: створено {blog_created}, оновлено {blog_updated}")

        # --- промокоди (PROMO_CODES в js.js) ---
        promos = [
            {"code": "BUD10", "type": PromoCode.PERCENT, "value": Decimal("10"), "label": "-10%"},
            {"code": "BUD500", "type": PromoCode.FIXED, "value": Decimal("500"), "label": "-500 грн", "min_order": Decimal("1000")},
            {"code": "NEW2026", "type": PromoCode.PERCENT, "value": Decimal("15"), "label": "-15%"},
        ]
        for promo in promos:
            PromoCode.objects.update_or_create(code=promo["code"], defaults=promo)

        self.stdout.write(self.style.SUCCESS("Сидинг завершено."))
