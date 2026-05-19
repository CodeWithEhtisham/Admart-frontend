from rest_framework import status, generics, permissions
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    OnboardingSerializer,
    ChangePasswordSerializer,
)


class RegisterView(generics.CreateAPIView):
    """POST /api/accounts/register/"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/accounts/login/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })


class LogoutView(APIView):
    """POST /api/accounts/logout/"""
    def post(self, request):
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/accounts/profile/"""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class OnboardingView(generics.UpdateAPIView):
    """PATCH /api/accounts/onboarding/"""
    serializer_class = OnboardingSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/accounts/change-password/"""
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        # Rotate token
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        token = Token.objects.create(user=request.user)
        return Response({
            'detail': 'Password changed.',
            'token': token.key,
        })
