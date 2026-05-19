from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # Onboarding fields (screen 3)
    BUSINESS_TYPE_CHOICES = [
        ('ecommerce', 'E-commerce'),
        ('saas', 'SaaS'),
        ('agency', 'Agency'),
        ('content_creator', 'Content Creator'),
        ('local_business', 'Local Business'),
        ('other', 'Other'),
    ]
    business_type = models.CharField(max_length=30, choices=BUSINESS_TYPE_CHOICES, blank=True)
    business_name = models.CharField(max_length=100, blank=True)
    website_url = models.URLField(blank=True)

    GOAL_CHOICES = [
        ('product_ads', 'Product Ads'),
        ('social_content', 'Social Content'),
        ('brand_awareness', 'Brand Awareness'),
        ('tutorials', 'Tutorials'),
        ('testimonials', 'Testimonials'),
        ('promotions', 'Promotions'),
    ]
    primary_goal = models.CharField(max_length=30, choices=GOAL_CHOICES, blank=True)

    PLATFORM_CHOICES = [
        ('tiktok', 'TikTok'),
        ('youtube', 'YouTube'),
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
    ]
    target_platforms = models.JSONField(default=list, blank=True)

    onboarding_completed = models.BooleanField(default=False)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')

    # Credits
    credits = models.IntegerField(default=10)
    monthly_credits = models.IntegerField(default=200)

    # Plan
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('starter', 'Starter'),
        ('pro', 'Pro'),
        ('agency', 'Agency'),
    ]
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='free')
    plan_expires_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def initials(self):
        parts = [self.first_name, self.last_name]
        return ''.join(p[0].upper() for p in parts if p)
