from django.contrib import admin
from django.urls import path
from accounts import views as accounts_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', accounts_views.home, name='home'),
    path('login/', accounts_views.login_view, name='login'),
    path('signup/', accounts_views.signup_view, name='signup'),
    path('profile/', accounts_views.profile_view, name='profile'),
    path('logout/', accounts_views.logout_view, name='logout'),
]
