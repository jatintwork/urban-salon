
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal

from company_services.models import Service, ServiceCategory, ServiceRequest, Payment
from company_services.serializers import ServiceCategorySerializer, ServiceSerializer, ServiceRequestSerializer, PaymentSerializer
from rest_framework.permissions import AllowAny

class AllServicesView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            services = ServiceCategory.objects.filter(delete_flag=False)
            serializer = ServiceCategorySerializer(services, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class SubServicesView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            category_id = request.query_params.get('category_id')
            services = Service.objects.filter(delete_flag=False, category=category_id)
            serializer = ServiceSerializer(services, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST) 
