
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from company_services.models import Service, ServiceCategory, ServiceRequest
from company_services.serializers import ServiceCategorySerializer, ServiceRequestSerializer, ServiceSerializer, UserSerializer
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
            services = Service.objects.select_related('category').order_by('category__name')

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

    def get(self, request):
        try:
            user = request.user
            service_requests = ServiceRequest.objects.filter(client=user, delete_flag=False).order_by('-created_date')
            serializer = ServiceRequestSerializer(service_requests, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            bulk_create_flag = request.data.get('bulk_create_flag', False)
            if bulk_create_flag:
                service_requests = request.data.get('service_requests', [])
                for data in service_requests:
                    service_id = data.get('sub_service_id')
                    service = Service.objects.get(id=service_id, delete_flag=False)
                    service_request = ServiceRequest.objects.create(
                        service=service,
                        client=request.user,
                        scheduled_datetime=data.get('scheduled_datetime'),
                        location=data.get('location')
                    )
            else:
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


class UserCRUD(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:
            user = request.user
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)