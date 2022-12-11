from django.db import models


class Incident(models.Model):
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=250, null=True)
    src = models.CharField(max_length=300)
    cataclysmic_type = models.CharField(max_length=250)

    def __str__(self):
        return self.title