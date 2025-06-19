from rest_framework import serializers
from company_services.models import Service, ServiceCategory, ServiceRequest, Payment

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description']

class ServiceSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'price', 'duration_minutes', 'category']

class ServiceRequestSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)

    class Meta:
        model = ServiceRequest
        fields = ['id', 'service', 'scheduled_datetime', 'location', 'status']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_status', 'payment_mode', 'payment_time']
