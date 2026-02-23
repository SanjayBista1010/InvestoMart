from rest_framework import serializers  # pyright: ignore[reportMissingImports]
from .models import User, Livestock, Product
# Add more enterprise model serializers here as needed

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'user_id', 'username', 'email', 'first_name', 'last_name', 'kyc_status', 'account_status', 'is_superuser', 'is_staff']

class LivestockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livestock
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'