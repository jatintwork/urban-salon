from django.urls import path
from company_services.services_views.userView import AllServicesView, CreateServiceRequest, SubServicesView
from company_services.views import (
    ServiceListAPIView,
    BookServiceAPIView,
    MyBookingsAPIView,
    AcceptBookingAPIView,
    PaymentAPIView
)

from company_services.services_views.ClientsView import ClientDashboardView
from company_services.services_views.adminView import AdminDashboardView, AllServiceList, GetUSerProfile, UserListView, NotificationListView

urlpatterns = [
    path('services/', ServiceListAPIView.as_view()),
    path('book/', BookServiceAPIView.as_view()),
    path('my-bookings/', MyBookingsAPIView.as_view()),
    path('accept-booking/', AcceptBookingAPIView.as_view()),
    path('pay/', PaymentAPIView.as_view()),
    path('client_dashboard/', ClientDashboardView.as_view()),
    path('user_profile/', GetUSerProfile.as_view()),
    path('admin_dashboard/', AdminDashboardView.as_view()),
    path('assign_work/', AdminDashboardView.as_view()),
    path('users/', UserListView.as_view()),
    path('completed_service/', AllServiceList.as_view()),
    path('notifications/', NotificationListView.as_view()),
    
    
    path('all-services/', AllServicesView.as_view()),
    path('sub-services/', SubServicesView.as_view()),
    path('create-service-request/', CreateServiceRequest.as_view(), name='create_service_request'),
    
]