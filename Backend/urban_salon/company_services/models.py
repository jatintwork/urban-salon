import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from base.models import BaseModelClass, Users

# ================= Service & Category ===================
class ServiceCategory(BaseModelClass):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Service(BaseModelClass):
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE)
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField(default=30)

    def __str__(self):
        return self.name

# ================= Booking Flow ===================
class ServiceRequest(BaseModelClass):
    client = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="client_requests")
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    scheduled_datetime = models.DateTimeField()
    location = models.TextField()
    status = models.CharField(max_length=30, choices=[
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ], default='PENDING')

    assigned_provider = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_jobs")

    def __str__(self):
        return f"{self.service.name} for {self.client.username}"


# ================= Payment ===================
class Payment(BaseModelClass):
    service_request = models.OneToOneField(ServiceRequest, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ], default='PENDING')
    payment_mode = models.CharField(max_length=50)
    payment_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} - {self.payment_status}"


# ================= Ratings ===================
class RatingReview(BaseModelClass):
    service_request = models.OneToOneField(ServiceRequest, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    review = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.rating} by {self.service_request.client.username}"


