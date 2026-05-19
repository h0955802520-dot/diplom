from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import ContactSubmission, NewsletterSubscription
from .serializers import ContactSubmissionSerializer, NewsletterSubscriptionSerializer


class ContactSubmissionCreateView(generics.CreateAPIView):
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer
    permission_classes = [permissions.AllowAny]


class NewsletterSubscribeView(generics.CreateAPIView):
    queryset = NewsletterSubscription.objects.all()
    serializer_class = NewsletterSubscriptionSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response({"detail": "Email обов'язковий."}, status=status.HTTP_400_BAD_REQUEST)
        sub, created = NewsletterSubscription.objects.get_or_create(
            email=email,
            defaults={"is_active": True},
        )
        if not created and not sub.is_active:
            sub.is_active = True
            sub.unsubscribed_at = None
            sub.save()
        return Response(
            {"email": sub.email, "created": created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
