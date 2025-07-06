from rest_framework import serializers
from company_services.models import Service, ServiceCategory, ServiceRequest, Payment, RatingReview, Notification

from company_services.models import Service, ServiceRequest, Payment, RatingReview
from base.models import UserRoleMapping, Users



        
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
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Add the client's name (if available)
        representation['client_name'] = getattr(instance.client, 'first_name', None)
        # Add the assigned provider's name (if available)
        representation['provider_name'] = getattr(instance.assigned_provider, 'first_name', None) if instance.assigned_provider else None
        return representation

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_status', 'payment_mode', 'payment_time']

class RatingReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingReview
        fields = ['id', 'rating', 'review', 'service_request']


class UserSerializer(serializers.ModelSerializer):
    skills = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 
                 'address', 'skills', 'rating', 'total_jobs_completed', 
                 'availability_status', 'is_active', 'created_date', 'last_logged_in']
        

class UserRoleMappingSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserRoleMapping
        fields = ['id', 'delete_flag']
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Add the client's name (if available)
        representation['role_name'] = instance.role.name
        # Add the assigned provider's name (if available)
        representation['user'] = (UserSerializer(instance.user)).data
        
        return representation

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at', 'is_read', 'service_request']


