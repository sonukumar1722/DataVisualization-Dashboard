from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),  # Root URL loads the dashboard
    path('api/data/', views.get_data, name='get_data'),  # Fetch all data
    path('api/data/filtered/', views.get_filtered_data, name='get_filtered_data'),  # Fetch filtered data
]
