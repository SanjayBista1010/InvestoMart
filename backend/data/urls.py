from django.urls import path
from . import views
from . import upload_views

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.user_login, name='user_login'),
    path('auth/register/', views.user_register, name='user_register'),
    path('auth/logout/', views.user_logout, name='user_logout'),
    path('auth/profile/', views.user_profile, name='user_profile'),
    path('auth/google/', views.google_auth, name='google_auth'),
    path('auth/verify-email/', views.verify_email, name='verify_email'),
    
    # KYC Endpoints
    path('kyc/submit/', views.submit_kyc, name='submit_kyc'),
    
    # Uploads
    path('upload/', upload_views.upload_image, name='upload_image'),
    
    # Products
    path('products/create/', views.create_product_listing, name='create_product_listing'),
    path('products/my/', views.get_user_products, name='get_user_products'),
    path('products/update/<str:product_id>/', views.update_product_listing, name='update_product_listing'),
    path('products/delete/<str:product_id>/', views.delete_product_listing, name='delete_product_listing'),
    
    # Dashboard & Profile Analytics
    path('dashboard/summary/', views.get_dashboard_summary, name='get_dashboard_summary'),
    path('analytics/platform/', views.platform_analytics_summary, name='platform_analytics_summary'),
    path('profile/summary/', views.user_profile_summary, name='user_profile_summary'),
    
    # Notifications
    path('notifications/', views.get_user_notifications, name='get_user_notifications'),
    path('notifications/<str:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/broadcast/', views.broadcast_notification, name='broadcast_notification'),
    
    # Admin Approvals
    path('admin/approvals/pending/', views.get_pending_approvals, name='get_pending_approvals'),
    path('admin/approvals/', views.process_approval_action, name='process_approval_action'),
]
