from rest_framework import serializers
from .models import Incident

# inc = Incident(title='title',
#                description='descr',
#                location='town',
#                src=None,
#                cataclysmic_type='war')


class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = '__all__'

    # title = serializers.CharField(max_length=1000)
    # description = serializers.CharField(max_length=10000)
    # location = serializers.CharField(max_length=250)
    # src = serializers.CharField(max_length=250)
    # # src = serializers.URLField()
    # cataclysmic_type = serializers.CharField(max_length=250)


# serializer = IncidentSerializer(inc)
# serializer.data

