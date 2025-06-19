
from django.urls import path
from company_services.views import (
    ServiceListAPIView,
    BookServiceAPIView,
    MyBookingsAPIView,
    AcceptBookingAPIView,
    PaymentAPIView
)

urlpatterns = [
    path('services/', ServiceListAPIView.as_view()),
    path('book/', BookServiceAPIView.as_view()),
    path('my-bookings/', MyBookingsAPIView.as_view()),
    path('accept-booking/', AcceptBookingAPIView.as_view()),
    path('pay/', PaymentAPIView.as_view()),
]