from django.contrib import admin
from django.urls import path

from mymap.views import MymapAPIView, MainAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/mymap/', MymapAPIView.as_view()),
    path('api/main_page/', MainAPIView.as_view())
]
