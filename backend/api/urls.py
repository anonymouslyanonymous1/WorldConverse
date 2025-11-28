from . import views
from django.urls import path

urlpatterns = [
    path("users/register", views.register, name="Register"),
    path("users/login", views.LogIn, name="Login"),
    path("users/logout", views.LogOut, name="Logout"),
    path("messages", views.messages, name="Messages"),
    path("cores", views.cores, name="Cores")
]
## views.index means pick out the index function in views.py