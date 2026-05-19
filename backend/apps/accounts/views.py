from django.contrib.auth import authenticate, get_user_model, login as django_login, logout as django_logout
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


def _build_login_payload(user):
    """JWT-пара + публічні поля юзера для фронта (вирішує, куди редиректити)."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "tier": user.tier,
        },
    }


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — реєструє юзера і одразу логінить
    (створює і JWT, і Django-сесію)."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # bypass CSRF/SessionAuth for public endpoint

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Django session, щоб /admin/ і /account/ запрацювали без повторного логіну
        django_login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        return Response(_build_login_payload(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/auth/login/ — логін за username, email або телефоном.

    Створює і JWT-пару, і Django-сесію (щоб користувач одразу мав доступ
    до /admin/ якщо is_staff, без повторного входу в адмінці).
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        identifier = (request.data.get("username") or request.data.get("login") or "").strip()
        password = request.data.get("password") or ""
        if not identifier or not password:
            return Response({"detail": "Логін та пароль обов'язкові."}, status=status.HTTP_400_BAD_REQUEST)

        # Шукаємо юзера за username/email/phone
        user = User.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier) | Q(phone=identifier)
        ).first()
        if not user:
            return Response({"detail": "Невірний логін або пароль."}, status=status.HTTP_401_UNAUTHORIZED)

        authenticated = authenticate(request, username=user.username, password=password)
        if not authenticated:
            return Response({"detail": "Невірний логін або пароль."}, status=status.HTTP_401_UNAUTHORIZED)
        if not authenticated.is_active:
            return Response({"detail": "Акаунт деактивовано."}, status=status.HTTP_403_FORBIDDEN)

        django_login(request, authenticated)
        return Response(_build_login_payload(authenticated))


class LogoutView(APIView):
    """POST /api/auth/logout/ — завершує Django-сесію.
    JWT на клієнті стирається фронтом (localStorage)."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        django_logout(request)
        return Response({"detail": "Вихід виконано."})


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
