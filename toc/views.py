from django.shortcuts import render, redirect
from django.http import JsonResponse,HttpResponse
from .models import *
from .utils import cartData, guestOrder
from django.views.generic import ListView
from .models import CarouselItem
import datetime
import json
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from django import forms
from .models import Product, Categorie
from django.core.serializers.json import DjangoJSONEncoder


# Index for all like store 
def index(request):
    data = cartData(request)
    cartItems = data['cartItems']
    # order = data['order']
    # items = data['items']
    
    # Récupérer les items du carousel
    carousel_items = CarouselItem.objects.filter(is_active=True).order_by('order')
        
    products = Product.objects.all()
    context = {'products':products, 'cartItems':cartItems, 'carousel_items':carousel_items}
    return render(request, 'index.html', context)



#  Cart view 
def cart(request):
    data = cartData(request)
    cartItems = data['cartItems']
    order = data['order']
    items = data['items']
    
    # Log pour vérifier les données
    print("Order:", order)
    print("Items:", items)
    print("Cart Items:", cartItems)
        
    context = {'items':items, 'order':order, 'cartItems':cartItems}
    return render(request, 'cart.html', context)


# Checkout view 
def checkout(request):
    data = cartData(request)
    cartItems = data['cartItems']
    order = data['order']
    items = data['items']
        
    context = {'items':items, 'order':order, 'cartItems':cartItems}
    return render(request, 'checkout.html', context)


# Update items 
def update_item(request):
    data = json.loads(request.body)
    product_id = data['productId']
    action = data['action']
    
    customer = request.user.customer
    product = Product.objects.get(id=product_id)
    order, created = Order.objects.get_or_create(customer=customer, complete=False)
    
    order_item, created = OrderItem.objects.get_or_create(order=order, product=product)
    
    if action == 'add':
        order_item.quantity += 1
    elif action == 'remove':
        order_item.quantity -= 1
    
    order_item.save()
    
    if order_item.quantity <= 0:
        order_item.delete()
    
    # Retourne le nombre total d'articles dans le panier
    cart_items = sum([item.quantity for item in order.orderitem_set.all()])
    
    return JsonResponse({'cartItems': cart_items}, safe=False)


# Viw for POST request to send data too.
def processOrder(request):
    transaction_id = datetime.datetime.now().timestamp()
    data = json.load(request.body)
    
    if request.user.is_authenticated:
        customer = request.user.customer 
        order, created = Order.objects.get_or_create(customer=customer, complete=False)
        total = float(data['form']['total'])
        order.transaction_id = transaction_id
    
    else:
        customer, order = guestOrder(request, data)
            
    total = float(data['form']['total'])
    order.transaction_id = transaction_id
        
    # to make sure that the total sent matches what the cart total is actually supposed to be.
    if total == order.get_cart_total:
        order.complete = True
    order.save()
    
    #create an instance of the shipping address if an address was sent.
    if order.shipping == True:
        ShippingAddress.objects.create(
            customer = customer,
            order    = order,
            address  = data['shipping']['address'],
            city     = data['shipping']['city'],
            state    = data['shipping']['state'],
            zipcode  = data['shipping']['zipcode'],
        )
    
    return JsonResponse('Payement subimted', safe=False)

#View for caroussel 
class HomeView(ListView):
    model = CarouselItem
    template_name = "home.html"
    context_object_name = "carousel_items"
    
    def get_queryset(self):
        return CarouselItem.objects.filter(is_active=True).order_by("order")
    

#Services View
def services(request):
    """
    Vue pour afficher tous les services actifs
    """
    # Les elements de la carte 
    data = cartData(request)
    cartItems = data['cartItems']
    # Récupère tous les services actifs, triés par catégorie
    services = Services.objects.filter(actif=True).order_by('categorie')
    context = {
        'services': services,
        'cartItems': cartItems
    }
    
    return render(request, 'services.html', context)

# About view
def about(request):
    """
    Vue pour la page À Propos
    """
    # Les elements de la carte 
    data = cartData(request)
    cartItems = data['cartItems']
    context = {
        'title': 'À Propos de Nous',
        'cartItems': cartItems
    }
    return render(request, 'about.html', context)

# Contact form
class ContactForm(forms.Form):
    """
    Formulaire de contact personnalisé
    """
    nom = forms.CharField(
        label='Votre Nom', 
        max_length=100, 
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border rounded-md',
            'placeholder': 'Votre nom complet'
        })
    )
    email = forms.EmailField(
        label='Votre Email', 
        widget=forms.EmailInput(attrs={
            'class': 'w-full px-3 py-2 border rounded-md',
            'placeholder': 'votre.email@exemple.com'
        })
    )
    sujet = forms.CharField(
        label='Sujet', 
        max_length=200, 
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border rounded-md',
            'placeholder': 'Objet de votre message'
        })
    )
    message = forms.CharField(
        label='Votre Message', 
        widget=forms.Textarea(attrs={
            'class': 'w-full px-3 py-2 border rounded-md h-32',
            'placeholder': 'Détaillez votre demande...'
        })
    )


# Contact viw
def contact(request):
    # Les elements de la carte 
    data = cartData(request)
    cartItems = data['cartItems']
    
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Récupérer les données du formulaire
            nom = form.cleaned_data['nom']
            email = form.cleaned_data['email']
            sujet = form.cleaned_data['sujet']
            message = form.cleaned_data['message']
            
            # Construire le message complet
            email_message = f"Message de: {nom} <{email}>\n\n{message}"
            
            # Envoyer l'email
            send_mail(
                subject=sujet,
                message=email_message,
                from_email=settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') else None,
                recipient_list=['destinataire@example.com'],  # Remplacez par votre email
                fail_silently=False,
            )
            
            # Afficher un message de succès
            messages.success(request, "Votre message a été envoyé avec succès!")
            return redirect('contact')  # Rediriger vers la même page
    else:
        form = ContactForm()
        
    context = {
        'form':form,
        'cartItems':cartItems
    }
    
    return render(request, 'contact.html', context)

# Product view
def product(request):
    # Les elements de la carte 
    data = cartData(request)
    cartItems = data['cartItems']
    
    categories = Categorie.objects.all()
    products = Product.objects.all()
    
    # Convertir les produits en JSON pour Alpine.js
    product_list = list(products.values(
        'id', 'name', 'price', 'categorie__name', 
        'image', 'description'
    ))
    product_json = json.dumps(product_list, cls=DjangoJSONEncoder)
    
    # Convertir les catégories en liste pour Alpine.js
    categories_list = list(categories.values_list('name', flat=True))
    categories_json = json.dumps(categories_list, cls=DjangoJSONEncoder)
    
    context = {
        'categories': categories,
        'produits_json': product_json,  # Nom utilisé dans le template
        'categories_list': categories_json,  # Nom utilisé dans le template
        'cartItems': cartItems
    }
    return render(request, 'product.html', context)


# test d evnvoie de mail 
def test_email(request):
    send_mail(
        'Test depuis Django',
        'Voici un email de test envoyé depuis mon application Django.',
        'from@example.com',
        ['to@example.com'],
        fail_silently=False,
    )
    return HttpResponse("Email envoyé avec succès!")