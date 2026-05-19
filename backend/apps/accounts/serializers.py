from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name",
            "phone", "city", "address", "tier", "is_staff",
        )
        read_only_fields = ("id", "username", "tier", "is_staff")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    # Username — необов'язковий, ми згенеруємо з email або телефону
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name", "phone", "name")

    def validate(self, attrs):
        if not attrs.get("email") and not attrs.get("phone"):
            raise serializers.ValidationError("Вкажіть email або телефон.")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        full_name = validated_data.pop("name", "").strip()
        # Розбиваємо повне ім'я на first_name / last_name, якщо немає окремих полів
        if full_name and not validated_data.get("first_name"):
            parts = full_name.split(" ", 1)
            validated_data["first_name"] = parts[0]
            if len(parts) > 1:
                validated_data["last_name"] = parts[1]

        # Username: явний → email → phone, з очищенням до унікального значення
        username = validated_data.get("username") or ""
        if not username:
            email = validated_data.get("email") or ""
            phone = validated_data.get("phone") or ""
            base = email.split("@")[0] if email else phone.lstrip("+")
            username = base or "user"
        # Гарантуємо унікальність
        candidate = username
        n = 2
        while User.objects.filter(username=candidate).exists():
            candidate = f"{username}{n}"
            n += 1
        validated_data["username"] = candidate

        # Якщо email порожній, але phone є, генеруємо технічний email
        if not validated_data.get("email"):
            validated_data["email"] = ""

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
