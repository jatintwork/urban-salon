
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal

from company_services.models import Service, ServiceCategory, ServiceRequest, Payment
from company_services.serializers import ServiceCategorySerializer, ServiceSerializer, ServiceRequestSerializer, PaymentSerializer
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


class AllServicesView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            services = ServiceCategory.objects.filter(delete_flag=False)
            serializer = ServiceCategorySerializer(services, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        try:
            categories = ServiceCategory.objects.all()
            services = Service.objects.select_related('category')

            result = {}

            for category in categories:
                result[str(category.id)] = {
                    "category_name": category.name,
                    "services": []
                }

            for service in services:
                result[str(service.category.id)]["services"].append({
                    "id": service.id,
                    "name": service.name,
                    "description": service.description,
                    "price": str(service.price),
                })

            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST )
    
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
        

@method_decorator(csrf_exempt, name='dispatch')
class CreateServiceRequest(APIView):
    permission_classes = [IsAuthenticated]


    def post(self, request):
        try:
            user = request.user
            service_id = request.data.get('sub_service_id')
            service = Service.objects.get(id=service_id, delete_flag=False)
            service_request = ServiceRequest.objects.create(
                service=service,
                client=user,
                scheduled_datetime=request.data.get('scheduled_datetime'),
                location=request.data.get('location')
            )
            return Response("Service Request Has Been Accepted", status=status.HTTP_201_CREATED)
        except Service.DoesNotExist:
            return Response({"detail": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
