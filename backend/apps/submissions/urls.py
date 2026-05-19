from django.urls import path

from .views import ContactSubmissionCreateView, NewsletterSubscribeView

urlpatterns = [
    path("contact/", ContactSubmissionCreateView.as_view(), name="contact-submit"),
    path("newsletter/", NewsletterSubscribeView.as_view(), name="newsletter-subscribe"),
]
