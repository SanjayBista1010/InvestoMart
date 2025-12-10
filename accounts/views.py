from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .forms import SignUpForm
from django.contrib.auth.decorators import login_required

def home(request):
    return render(request, 'accounts/home.html')

def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Account created successfully. Please log in.")
            return redirect('login')
    else:
        form = SignUpForm()
    return render(request, 'accounts/signup.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('profile')
        else:
            messages.error(request, "Invalid username or password.")
    return render(request, 'accounts/login.html')

@login_required
def profile_view(request):
    return render(request, 'accounts/profile.html')

def logout_view(request):
    logout(request)
    return redirect('home')
