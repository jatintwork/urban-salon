import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin

# ================= Base Model ===================
class BaseModelClass(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    updated_by = models.CharField(max_length=100, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    delete_flag = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True

# ================= User Model ===================
class Users(BaseModelClass, AbstractUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=150)
    email = models.EmailField(unique=True, max_length=255)

    # Common Fields
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    # Service Provider Fields
    skills = models.ManyToManyField('company_services.Service', blank=True)
    rating = models.FloatField(default=0.0)
    total_jobs_completed = models.IntegerField(default=0)
    availability_status = models.BooleanField(default=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.username

# ================= Role and Permission Tables ===================


class Screen(BaseModelClass):
    screen_name = models.CharField(max_length=255)

    def __str__(self):
        return self.screen_name

class CustomPermission(BaseModelClass):
    name = models.CharField(max_length=255)
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Role(BaseModelClass):
    name = models.CharField(max_length=100, unique=True)
    role_desc = models.TextField(max_length=1000, null=True, blank=True)

    def __str__(self):
        return self.name

class UserRoleMapping(BaseModelClass):
    user = models.ForeignKey(Users, on_delete=models.DO_NOTHING, null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role.name}"