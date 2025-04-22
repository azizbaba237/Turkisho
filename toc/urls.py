from django.urls import path
from django.conf import settings
from django.conf.urls.static import static 
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('cart/', views.cart, name='cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('update_item/', views.updateItem, name='update_item'),
    path('process_order', views.processOrder, name='process_order'),
    path('services/', views.services, name='services'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('product/', views.product, name='product'),
    path('test-email/', views.test_email, name='test_email'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)