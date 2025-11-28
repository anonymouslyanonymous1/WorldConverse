from django.http import JsonResponse
from django.db import IntegrityError
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.models import User
from .models import *

@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        if username is None or username == "" or password is None or password == "":
            return JsonResponse({"error": "Invalid username and/or password"}, status=422)
        try:
            user = User.objects.create_user(username=username, password=password)
            user.save()
        except IntegrityError:
            return JsonResponse({"error": "User exists"}, status=422)
        login(request, user)
        return JsonResponse({"response": {"id": user.id, "username":user.username}}, status=200)
    return JsonResponse({"error": "Use a proper method"}, status=422)

@csrf_exempt
def LogIn(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        if username is None or username == "" or password is None or password == "":
            return JsonResponse({"error": "Invalid username and/or password"}, status=422)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"response": {"id": user.id, "username":user.username}}, status=200)
        else:
            return JsonResponse({"error": "Invalid username and/or password"}, status=403)
    return JsonResponse({"error": "Use a proper method"}, status=422)

@csrf_exempt
@login_required
def LogOut(request):
    if request.method == "POST":
        try:
            logout(request)
        except:
            return JsonResponse({"error": "Not logged in"}, status=422)
        return JsonResponse({"response": "Logged Out"}, status=200)
    return JsonResponse({"error": "Use a proper method"}, status=422)


@csrf_exempt
def messages(request):
    if request.method == "GET":
        specific_core = request.GET.get("coreID")
        specific_core = Core.objects.get(id=specific_core)
        all_messages = specific_core.core_all_messages.all().order_by("sent_time")
        return JsonResponse([message.serialize() for message in all_messages], safe=False, status=200)
    elif request.method == "POST":
        sender = request.user
        data = json.loads(request.body)
        message = data.get("message")
        mentions = data.get("mentions")
        core_id = data.get("core_id")
        core = Core.objects.get(id=core_id)
        INCREASE_FACTOR = 10 # In meters
        # Increasing radius for every user that joins a core
        if not Message.objects.filter(sender=sender, core=core).exists():
            core.radius += INCREASE_FACTOR
            core.save()            
        toUpload = Message(sender=sender, message=message, core=core, mentions=mentions)
        toUpload.save()
        return JsonResponse({"response": "Message Sent"}, status=200)
    return JsonResponse({"error": "Use a proper method"}, status=422)

@csrf_exempt
def cores(request):
    if request.method == "POST":
        data = json.loads(request.body)
        title = data.get("title")
        img_url = data.get("img_url")
        description = data.get("description")
        archived = data.get("archived")
        radius = data.get("radius")
        coord = data.get("coord")
        location = data.get("location")
        color = data.get("color")
        print(request.user.id)
        creator = User.objects.get(id=request.user.id)
        core = Core(creator=creator,title=title,img_url=img_url,description=description,archived=archived,radius=radius,coord=coord,location=location,color=color)
        core.save()
        return JsonResponse({"response": core.id}, status=200)    
    elif request.method == "GET":
        choice = request.GET.get("choice")
        if choice == "all":
            all = Core.objects.filter(archived=False).order_by("-radius")
            return JsonResponse([one.serialize() for one in all], safe=False, status=200)
        elif choice.isdigit():
            try:
                specific_core = Core.objects.get(archived=False, id=choice)
                return JsonResponse(specific_core.serialize(), status=200)
            except Core.DoesNotExist:
                return JsonResponse({"error": "No such core available"}, status=404)                    
        else:
            return JsonResponse({"error": "No such core available"}, status=404)                    
    return JsonResponse({"error": "Use a proper method"}, status=422)