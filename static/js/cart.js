// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner tous les boutons avec la classe update-cart
    let updateBtns = document.getElementsByClassName('update-cart');
    
    // Ajouter un écouteur d'événements à chaque bouton
    for (let i = 0; i < updateBtns.length; i++) {
        updateBtns[i].addEventListener('click', function() {
            let productId = this.dataset.product;
            let action = this.dataset.action;
            
            console.log('productId:', productId, 'action:', action);
            
            // Vérifier si l'utilisateur est connecté
            if (user === 'AnonymousUser') {
                console.log('Utilisateur non connecté');
                // Ici, vous pouvez gérer le panier pour les utilisateurs non connectés
                // Par exemple, en utilisant localStorage
                
                // À implémenter selon vos besoins
                addCookieItem(productId, action);
            } else {
                // Si l'utilisateur est connecté, envoyer les données au backend
                updateUserOrder(productId, action);
            }
        });
    }
    
    // Fonction pour mettre à jour la commande d'un utilisateur connecté
    function updateUserOrder(productId, action) {
        console.log('Utilisateur connecté, envoi des données...');
        
        // URL de l'endpoint pour mettre à jour le panier
        let url = '/update_item/';
        
        // Envoyer les données au backend via une requête fetch
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                'productId': productId,
                'action': action
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Données:', data);
            // Mettre à jour l'affichage du nombre d'articles dans le panier
            document.getElementById('cart-total').textContent = data.cartItems;
            
            // Optionnel: Actualiser la page pour afficher les mises à jour
            location.reload();
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
    }
    
    // Fonction pour ajouter des articles au panier pour les utilisateurs non connectés (via cookies)
    function addCookieItem(productId, action) {
        console.log('Utilisateur non connecté, ajout au cookie...');
        
        // À implémenter selon vos besoins
        // Cette fonction devrait mettre à jour le panier stocké dans les cookies
        
        // Exemple simple (à adapter à votre logique):
        if (action === 'add') {
            if (cart[productId] === undefined) {
                cart[productId] = {'quantity': 1};
            } else {
                cart[productId]['quantity'] += 1;
            }
        }
        
        if (action === 'remove') {
            cart[productId]['quantity'] -= 1;
            
            if (cart[productId]['quantity'] <= 0) {
                delete cart[productId];
            }
        }
        
        // Sauvegarder le panier mis à jour dans les cookies
        document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/";
        
        // Actualiser la page pour voir les changements
        location.reload();
    }
    
    // Fonction pour récupérer un cookie par son nom
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});