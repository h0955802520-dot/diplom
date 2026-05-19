"""
Кастомний дашборд для django-unfold. Викликається через
UNFOLD['DASHBOARD_CALLBACK'] на головній сторінці адмінки.

Повертає dict, який передається в шаблон unfold/admin/index.html
(перевизначений у backend/templates/admin/index.html).
"""
from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Sum, Q
from django.utils import timezone


def dashboard_callback(request, context):
    # Імпорти всередині функції, щоб уникнути циклічних залежностей при старті Django
    from apps.accounts.models import User
    from apps.catalog.models import Product
    from apps.orders.models import Order, ReturnRequest
    from apps.submissions.models import ContactSubmission, NewsletterSubscription

    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)

    orders_qs = Order.objects.all()
    total_orders = orders_qs.count()
    orders_month = orders_qs.filter(created_at__gte=month_start).count()
    orders_week = orders_qs.filter(created_at__gte=week_start).count()
    orders_today = orders_qs.filter(created_at__gte=today_start).count()

    revenue_total = orders_qs.aggregate(s=Sum("total"))["s"] or Decimal("0")
    revenue_month = orders_qs.filter(created_at__gte=month_start).aggregate(s=Sum("total"))["s"] or Decimal("0")
    revenue_week = orders_qs.filter(created_at__gte=week_start).aggregate(s=Sum("total"))["s"] or Decimal("0")

    new_orders = orders_qs.filter(status=Order.NEW).count()
    processing_orders = orders_qs.filter(status=Order.PROCESSING).count()

    users_total = User.objects.count()
    users_new_week = User.objects.filter(date_joined__gte=week_start).count()
    users_wholesale = User.objects.filter(tier=User.TIER_WHOLESALE).count()
    users_partner = User.objects.filter(tier=User.TIER_PARTNER).count()

    products_total = Product.objects.count()
    products_out_of_stock = Product.objects.filter(stock=0).count()
    products_promo = Product.objects.filter(promo=True).count()

    pending_returns = ReturnRequest.objects.filter(status=ReturnRequest.PENDING).count()
    new_contacts = ContactSubmission.objects.filter(status=ContactSubmission.NEW).count()
    subscribers_total = NewsletterSubscription.objects.filter(is_active=True).count()

    # Топ-5 товарів за продажами
    top_products = (
        Product.objects.annotate(
            sold=Sum("orderitem__quantity", filter=~Q(orderitem__order__status=Order.CANCELLED))
        )
        .filter(sold__gt=0)
        .order_by("-sold")[:5]
    )

    # Графік виручки за останні 7 днів (для Chart.js)
    revenue_chart_labels = []
    revenue_chart_data = []
    for i in range(6, -1, -1):
        day = today_start - timedelta(days=i)
        day_end = day + timedelta(days=1)
        day_revenue = (
            orders_qs.filter(created_at__gte=day, created_at__lt=day_end)
            .aggregate(s=Sum("total"))["s"] or Decimal("0")
        )
        revenue_chart_labels.append(day.strftime("%d.%m"))
        revenue_chart_data.append(float(day_revenue))

    context.update({
        "kpis": [
            {"title": "Замовлень всього", "value": total_orders, "footer": f"+{orders_week} за тиждень", "icon": "receipt_long"},
            {"title": "Виручка всього", "value": f"{revenue_total:,.0f} грн".replace(",", " "), "footer": f"{revenue_month:,.0f} грн / місяць".replace(",", " "), "icon": "payments"},
            {"title": "Нових замовлень", "value": new_orders, "footer": f"в обробці: {processing_orders}", "icon": "fiber_new"},
            {"title": "Клієнтів", "value": users_total, "footer": f"+{users_new_week} за тиждень", "icon": "group"},
        ],
        "secondary_kpis": [
            {"title": "Сьогодні замовлень", "value": orders_today},
            {"title": "Товарів в каталозі", "value": products_total, "danger": products_out_of_stock if products_out_of_stock > 0 else None, "danger_label": "немає в наявності" if products_out_of_stock > 0 else ""},
            {"title": "Акційних товарів", "value": products_promo},
            {"title": "Оптовиків / Партнерів", "value": f"{users_wholesale} / {users_partner}"},
            {"title": "Запитів на повернення", "value": pending_returns, "highlight": pending_returns > 0},
            {"title": "Нових заявок", "value": new_contacts, "highlight": new_contacts > 0},
            {"title": "Підписників розсилки", "value": subscribers_total},
            {"title": "Виручка за тиждень", "value": f"{revenue_week:,.0f} грн".replace(",", " ")},
        ],
        "top_products": top_products,
        "revenue_chart": {
            "labels": revenue_chart_labels,
            "data": revenue_chart_data,
        },
    })
    return context
