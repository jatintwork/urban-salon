# base/urls.py
from django.urls import path
from base.base_views.SignUpView import SignupAPIView, DeleteUserAPIView, LoginAPIView

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('signup/', SignupAPIView.as_view(), name='signup'),
    path('delete-user/', DeleteUserAPIView.as_view(), name='delete-user'),
]
