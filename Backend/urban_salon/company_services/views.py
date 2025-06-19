
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal

from company_services.models import Service, ServiceRequest, Payment
from .serializers import ServiceSerializer, ServiceRequestSerializer, PaymentSerializer

class ServiceListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        services = Service.objects.filter(is_active=True, delete_flag=False)
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

class BookServiceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        service_id = request.data.get('service_id')
        scheduled_datetime = request.data.get('scheduled_datetime')
        location = request.data.get('location')

        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            return Response({"detail": "Invalid service"}, status=status.HTTP_400_BAD_REQUEST)

        booking = ServiceRequest.objects.create(
            client=request.user,
            service=service,
            scheduled_datetime=scheduled_datetime,
            location=location,
            status='PENDING',
            created_by=request.user.username
        )
        return Response({"message": "Booking created", "booking_id": str(booking.id)})

class MyBookingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = ServiceRequest.objects.filter(client=request.user)
        serializer = ServiceRequestSerializer(bookings, many=True)
        return Response(serializer.data)

class AcceptBookingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')

        try:
            booking = ServiceRequest.objects.get(id=booking_id)
        except ServiceRequest.DoesNotExist:
            return Response({"detail": "Invalid booking ID"}, status=status.HTTP_400_BAD_REQUEST)

        booking.assigned_provider = request.user
        booking.status = 'ASSIGNED'
        booking.updated_by = request.user.username
        booking.save()

        return Response({"message": "Booking assigned to you"})

class PaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        service_request_id = request.data.get('service_request_id')
        payment_mode = request.data.get('payment_mode')

        try:
            service_request = ServiceRequest.objects.get(id=service_request_id, client=request.user)
        except ServiceRequest.DoesNotExist:
            return Response({"detail": "Invalid request or unauthorized"}, status=403)

        if Payment.objects.filter(service_request=service_request).exists():
            return Response({"detail": "Payment already made"}, status=400)

        amount = service_request.service.price

        payment = Payment.objects.create(
            service_request=service_request,
            amount=Decimal(amount),
            payment_mode=payment_mode,
            payment_status="SUCCESS",
            created_by=request.user.username
        )
        return Response({"message": "Payment successful", "payment_id": str(payment.id)})

