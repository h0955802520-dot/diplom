from rest_framework import serializers

from .models import ContactSubmission, NewsletterSubscription


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ("id", "name", "email", "phone", "subject", "message", "source")
        read_only_fields = ("id",)


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ("id", "email")
        read_only_fields = ("id",)
