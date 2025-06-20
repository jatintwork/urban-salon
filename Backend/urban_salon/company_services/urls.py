from django.urls import path
from company_services.views import (
    ServiceListAPIView,
    BookServiceAPIView,
    MyBookingsAPIView,
    AcceptBookingAPIView,
    PaymentAPIView
)

from company_services.services_views.ClientsView import ClientDashboardView
urlpatterns = [
    path('services/', ServiceListAPIView.as_view()),
    path('book/', BookServiceAPIView.as_view()),
    path('my-bookings/', MyBookingsAPIView.as_view()),
    path('accept-booking/', AcceptBookingAPIView.as_view()),
    path('pay/', PaymentAPIView.as_view()),
    path('client_dashboard/', ClientDashboardView.as_view()),
]