from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

class SignUpForm(UserCreationForm):
    first_name = forms.CharField(max_length=30)
    middle_name = forms.CharField(max_length=30, required=False)
    last_name = forms.CharField(max_length=30)
    phone_number = forms.CharField(max_length=15)

    class Meta:
        model = User
        fields = ('username', 'first_name', 'middle_name', 'last_name', 'phone_number', 'email', 'password1', 'password2')
