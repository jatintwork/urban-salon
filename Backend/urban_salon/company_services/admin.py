from django.contrib import admin
from .models import Notification, Service, ServiceCategory, ServiceRequest, Payment, RatingReview

# Register your models here.

admin.site.register(Service)
admin.site.register(ServiceCategory)
admin.site.register(ServiceRequest)
admin.site.register(Payment)    
admin.site.register(RatingReview)
admin.site.register(Notification)




