from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'plan', 'credits', 'onboarding_completed', 'is_active']
    list_filter = ['plan', 'onboarding_completed', 'is_active', 'business_type']
    search_fields = ['email', 'first_name', 'last_name', 'business_name']
    ordering = ['-created_at']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal', {'fields': ('first_name', 'last_name', 'avatar', 'timezone', 'language')}),
        ('Onboarding', {'fields': ('business_type', 'business_name', 'website_url', 'primary_goal', 'target_platforms', 'onboarding_completed')}),
        ('Plan & Credits', {'fields': ('plan', 'credits', 'monthly_credits', 'plan_expires_at')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'password1', 'password2'),
        }),
    )
