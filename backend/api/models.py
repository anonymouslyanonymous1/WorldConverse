from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

class Core(models.Model):
    title = models.CharField()
    img_url = models.URLField(max_length=None)
    description = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)
    archived = models.BooleanField()
    radius = models.IntegerField()
    coord = models.JSONField()
    location = models.TextField(null=True, blank=True)
    color = models.CharField(max_length=7)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_all_cores")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "img_url": self.img_url,
            "description": self.description,
            "radius": self.radius,
            "coord": self.coord,
            "location": self.location,
            "color": self.color,
            "creator": self.creator.id
        }

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_all_messages")
    core = models.ForeignKey(Core, on_delete=models.CASCADE, related_name="core_all_messages")
    message = models.TextField(max_length=None)
    mentions = models.JSONField()
    sent_time = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "sender": {"id": self.sender.id, "username": self.sender.username},
            "message": self.message,
            "mentions": self.mentions,
            "sent_time": self.sent_time
        }
    def cores_only(self):
        return {"core_id": self.core.id}
