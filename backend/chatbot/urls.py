# chatbot/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/', views.chatbot_api, name='chatbot_api'),
    path('health/', views.health_check, name='health_check'),
    path('sessions/', views.list_sessions, name='list_sessions'),
    path('sessions/<str:session_id>/messages/', views.get_session_messages, name='get_session_messages'),
    path('sessions/<str:session_id>/title/', views.update_session_title, name='update_session_title'),
]
