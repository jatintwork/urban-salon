from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from base.commonCRUD import requestDelete
from rest_framework.permissions import IsAuthenticated

from base.models import Users, Role, UserRoleMapping
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(username=email, password=password)  # Django's default authenticate uses username field
        if user:
            if not user.is_active:
                return Response({"detail": "User is inactive"}, status=status.HTTP_403_FORBIDDEN)
            
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            # Fetch role from UserRoleMapping
            user_role = UserRoleMapping.objects.filter(user=user, delete_flag=False).first()
            role_name = user_role.role.name if user_role else "Not Assigned"

            return Response({
                'refresh': str(refresh),
                'access': str(access_token),
                "user_id": str(user.id),
                "email": user.email,
                "role": role_name
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)



class SignupAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        role_name = request.data.get("role")

        if not role_name or not password or not email:
            return Response({"detail": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = Users.objects.filter(email=email).first()

        role = Role.objects.filter(name__iexact=role_name).first()
        if not role:
            return Response({"detail": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        # If user exists
        if user:
            # Check if role mapping exists (even soft-deleted)
            mapping = UserRoleMapping.objects.filter(user=user, role=role).first()

            if mapping:
                if getattr(mapping, 'delete_flag', False):  # Reactivate if soft-deleted
                    mapping.delete_flag = False
                    mapping.save()
                    token, _ = Token.objects.get_or_create(user=user)
                    return Response({
                        "message": "User role mapping reactivated",
                        "token": token.key,
                        "user_id": str(user.id),
                        "role": role.name
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response({"detail": "User already exists with this role"}, status=status.HTTP_400_BAD_REQUEST)

            # If mapping does not exist, create it
            UserRoleMapping.objects.create(user=user, role=role)
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            return Response({
                "message": "Role assigned to existing user",
                'refresh': str(refresh),
                'access': str(access_token),
                "user_id": str(user.id),
                "email": user.email,
                "role": role.name
            }, status=status.HTTP_201_CREATED)
            

        # If user does not exist, create new user
        user = Users.objects.create(
            username=email,
            password=make_password(password),
            email=email
        )

        UserRoleMapping.objects.create(user=user, role=role)
        # Generate a new access token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "message": "Signup successful",
            'refresh': str(refresh),
            'access': str(access_token),
            "user_id": str(user.id),
            "email": user.email,
            "role": role.name
        }, status=status.HTTP_201_CREATED)


class DeleteUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        return requestDelete(request, UserRoleMapping)
