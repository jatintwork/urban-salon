from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal
from django.db import models

from company_services.models import Service, ServiceRequest, Payment, RatingReview, Notification
from company_services.serializers import ServiceSerializer, ServiceRequestSerializer, PaymentSerializer, RatingReviewSerializer, UserRoleMappingSerializer, UserSerializer, NotificationSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Avg
from rest_framework import serializers
from base.models import Users, UserRoleMapping, Role
from collections import defaultdict
from rest_framework.pagination import PageNumberPagination

from base.commonCRUD import requestDelete


def assigned_request(user):
    try:
        role_mapping = UserRoleMapping.objects.get(user=user, delete_flag=False)
        role_name = role_mapping.role.name.lower()

        if role_name == 'admin':
            service_obj = ServiceRequest.objects.filter(delete_flag=False).exclude(status='COMPLETED').order_by('-created_date')
        elif role_name == 'client':
            service_obj = ServiceRequest.objects.filter(delete_flag=False, assigned_provider=user).exclude(status='COMPLETED').order_by('-created_date')
        elif role_name == 'user':
            service_obj = ServiceRequest.objects.filter(delete_flag=False, client=user).exclude(status='COMPLETED').order_by('-created_date')
        else:
            service_obj = ServiceRequest.objects.none()

        serializer = ServiceRequestSerializer(service_obj, many=True)
        return serializer.data, len(serializer.data)

    except UserRoleMapping.DoesNotExist:
        return [], 0



@method_decorator(csrf_exempt, name='dispatch')
class AdminDashboardView(APIView):
    def get(self, request):
        user = request.user

        all_users = UserRoleMapping.objects.filter(delete_flag=False).exclude(role__name='admin').order_by('user__created_date')

        total_user_count = all_users.count()
        client_count = all_users.filter(role__name='client').count()
        user_count = all_users.filter(role__name='user').count()

        # Use role-based pending request logic
        pending_request_data, pending_request_count = assigned_request(user)

        response_data = {
            'total_user_count': total_user_count,   
            'client_count': client_count,
            'user_count': user_count,
            "completed_service_count" : len(ServiceRequest.objects.filter(delete_flag=False, status='COMPLETED')),
            'pending_request_count': pending_request_count,
            'pending_request_data': pending_request_data
        }

        return Response(response_data, status=status.HTTP_200_OK)
    
    def post(self, request):
        try:
            # Get all pending service requests
            pending_requests = ServiceRequest.objects.filter(delete_flag=False).exclude(status='COMPLETED').order_by('-created_date')
            pending_requests_serializer = ServiceRequestSerializer(pending_requests, many=True)

            # Get all users list, categorized by role
            user_roles = UserRoleMapping.objects.filter(delete_flag=False, role__name='client', user__availability_status = True)

            response_data = {
                'all_pending_requests': pending_requests_serializer.data,
                "client": UserRoleMappingSerializer(user_roles, many=True).data
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        try:
            # Get request_id and user_id from request data
            request_id = request.data.get('request_id')
            user_id = request.data.get('user_id')

            if not request_id or not user_id:
                return Response({"status": "error", "message": "request_id and user_id are required."}, status=status.HTTP_400_BAD_REQUEST)

            # Get the ServiceRequest object
            try:
                service_request = ServiceRequest.objects.get(id=request_id, delete_flag=False)
            except ServiceRequest.DoesNotExist:
                return Response({"status": "error", "message": "Service request not found."}, status=status.HTTP_404_NOT_FOUND)

            # Get the provider UserRoleMapping (role=user)
            try:
                provider_mapping = UserRoleMapping.objects.get(user__id=user_id, role__name='client', delete_flag=False)
                print(provider_mapping)
                provider = provider_mapping.user
            except UserRoleMapping.DoesNotExist:
                return Response({"status": "error", "message": "Service provider not found or not a valid user."}, status=status.HTTP_404_NOT_FOUND)

            # Assign the provider to the service request
            service_request.assigned_provider = provider
            service_request.save()

            return Response({"status": "success", }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class GetUSerProfile(APIView):
    def get(self, request):
        try:
            mapping_obj = UserRoleMapping.objects.get(user = request.user, delete_flag=False ).order_by('user__created_date')
            serializer = UserRoleMappingSerializer(mapping_obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"status": "error","message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



    def post(self, request):
        try:
            user_roles = UserRoleMapping.objects.filter(delete_flag=False)
            
            admin_data = user_roles.filter(role__name='admin')
            user_data = user_roles.filter(role__name='user')
            client_data = user_roles.filter(role__name='client')

            response = {
                "admin": UserRoleMappingSerializer(admin_data, many=True).data,
                "user": UserRoleMappingSerializer(user_data, many=True).data,
                "client": UserRoleMappingSerializer(client_data, many=True).data
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class AllServiceList(APIView):
    def get(self, request):
        try:
            completed_services = ServiceRequest.objects.filter(status='COMPLETED', delete_flag=False).order_by('-created_date')
            serializer = ServiceRequestSerializer(completed_services, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def delete(self, request):
        return requestDelete(request, ServiceRequest)

@method_decorator(csrf_exempt, name='dispatch')
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.GET.get('role', 'client')
        user_roles = UserRoleMapping.objects.filter(delete_flag=False, role__name__iexact=role)
        serializer = UserRoleMappingSerializer(user_roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class NotificationPagination(PageNumberPagination):
    page_size = 1
    page_size_query_param = 'page_size'
    max_page_size = 1

@method_decorator(csrf_exempt, name='dispatch')
class NotificationListView(APIView):

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        paginator = NotificationPagination()
        page = paginator.paginate_queryset(notifications, request)
        serializer = NotificationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
