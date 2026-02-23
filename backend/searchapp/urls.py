from django.urls import path
from . import views

urlpatterns = [
    path('', views.global_search, name='global_search'),
    path('explore/', views.explore_livestock, name='explore_livestock'),
    path('product/<str:product_id>/', views.get_product_by_id, name='get_product_by_id'),
    path('livestock/<str:animal_id>/', views.get_livestock_by_id, name='get_livestock_by_id'),
]
