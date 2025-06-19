from django.contrib import admin
from .models import Users, Role, UserRoleMapping, Screen, CustomPermission
# Register your models here.
admin.site.register(Users)
admin.site.register(Role)
admin.site.register(UserRoleMapping)
admin.site.register(Screen)
admin.site.register(CustomPermission)
