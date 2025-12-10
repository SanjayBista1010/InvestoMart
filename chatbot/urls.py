# chatbot/urls.py - SIMPLE
from django.urls import path
from . import views

urlpatterns = [
    path('api/', views.chatbot_api, name='chatbot_api'),
    path('widget/', views.chatbot_widget, name='chatbot_widget'),
]