from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal
from django.db import models

from company_services.models import Service, ServiceRequest, Payment, RatingReview
from company_services.serializers import ServiceSerializer, ServiceRequestSerializer, PaymentSerializer, RatingReviewSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Avg

@method_decorator(csrf_exempt, name='dispatch')
class ClientDashboardView(APIView):
    def get(self, request):
        user = request.user

        try:
            # Get all work assigned to the provider
            work_assigned_qs = ServiceRequest.objects.filter(assigned_provider=user)
            work_assigned_data = ServiceRequestSerializer(work_assigned_qs, many=True).data
            work_assigned_count = work_assigned_qs.filter(status='PENDING').count()

            # Filter completed work from assigned work
            work_completed_qs = work_assigned_qs.filter(status='COMPLETED')
            work_completed_data = ServiceRequestSerializer(work_completed_qs, many=True).data
            work_completed_count = work_completed_qs.count()

            # Payments for completed requests
            payments_qs = Payment.objects.filter(service_request__in=work_completed_qs, payment_status='SUCCESS')
            money_earned = payments_qs.aggregate(total=Sum('amount'))['total'] or 0
            payments_data = PaymentSerializer(payments_qs, many=True).data

            # Ratings for completed requests
            ratings_qs = RatingReview.objects.filter(service_request__in=work_completed_qs)
            avg_rating = ratings_qs.aggregate(avg=Avg('rating'))['avg']
            avg_rating = round(avg_rating, 2) if avg_rating is not None else None
            ratings_data = RatingReviewSerializer(ratings_qs, many=True).data

            return Response({
                'average_rating': avg_rating,
                'work_assigned_count': work_assigned_count,
                'work_completed_count': work_completed_count,
                'money_earned': money_earned,
                
                'work_assigned': work_assigned_data,
                'work_completed': work_completed_data,
                'money_earned_records': payments_data,
            })

        except Exception as e:
            return Response({'error': 'Something went wrong', 'details': str(e)}, status=500)


class ClientWorkUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            service_id = request.data.get('request_id')
            print(service_id)
            service_obj = ServiceRequest.objects.get(id=service_id)

            if request.data.get('status') == 'CANCELLED':
                service_obj.status = 'PENDING'
                service_obj.assigned_provider  = None
                service_obj.save()
                return Response("Service Request Cancelled", status=status.HTTP_200_OK)
            elif request.data.get('status') == 'COMPLETED':
                service_obj.status = 'COMPLETED'
                service_obj.save()
                # Optionally, you can handle payment creation here if needed
                return Response("Service Request Completed", status=status.HTTP_200_OK)
            elif request.data.get('status') == 'IN_PROGRESS':
                service_obj.status = 'IN_PROGRESS'
                service_obj.save()
                return Response("Service Request Status Updated to IN_PROGRESS", status=status.HTTP_200_OK)

            return Response("Service Request Status Updated", status=status.HTTP_400_BAD_REQUEST)

        except ServiceRequest.DoesNotExist:
            return Response({"detail": "Work not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)