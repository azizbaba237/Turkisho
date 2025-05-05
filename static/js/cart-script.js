// // Fichier à enregistrer comme cart-script.js dans votre dossier static/js/
// document.addEventListener('DOMContentLoaded', function() {
//     // 1. Initialisation
//     console.log("Initialisation du gestionnaire de panier");
    
//     // 2. Sélectionner tous les boutons d'ajout/suppression
//     setupUpdateCartButtons();

//     // Configuration des boutons de mise à jour du panier
//     function setupUpdateCartButtons() {
//         const updateButtons = document.querySelectorAll('.update-cart');
        
//         updateButtons.forEach(button => {
//             button.addEventListener('click', function(e) {
//                 e.preventDefault();
//                 console.log("Bouton panier cliqué");
                
//                 const productId = this.dataset.product;
//                 const action = this.dataset.action;
                
//                 console.log('productId:', productId, 'action:', action);
                
//                 if (user === 'AnonymousUser') {
//                     console.log('Utilisateur non connecté');
//                     // Gérer le panier pour un utilisateur anonyme
//                     // addCookieItem(productId, action);
//                 } else {
//                     updateUserOrder(productId, action);
//                 }
//             });
//         });
//     }

//     // Fonction pour mettre à jour la commande utilisateur
//     function updateUserOrder(productId, action) {
//         console.log('Utilisateur connecté, envoi des données...');
        
//         // URL du point de terminaison (vérifiez que c'est correct selon votre urls.py)
//         const url = '/update_item/';
        
//         fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': getCookie('csrftoken'),
//             },
//             body: JSON.stringify({
//                 'productId': productId,
//                 'action': action
//             })
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Données:', data);
//             // Mise à jour du panier sans rechargement
//             updateCartUI();
//         })
//         .catch(error => {
//             console.error('Erreur:', error);
//         });
//     }
    
//     // Fonction pour mettre à jour l'interface utilisateur
//     function updateCartUI() {
//         // Rechargement partiel via fetch pour obtenir les données à jour
//         fetch(window.location.href)
//             .then(response => response.text())
//             .then(html => {
//                 const parser = new DOMParser();
//                 const doc = parser.parseFromString(html, 'text/html');
                
//                 // Mise à jour du nombre d'articles dans le panier (navbar)
//                 const cartCount = doc.getElementById('cart-total');
//                 if (cartCount) {
//                     const currentCartCount = document.getElementById('cart-total');
//                     if (currentCartCount) {
//                         currentCartCount.textContent = cartCount.textContent;
//                     }
//                 }
                
//                 // Si on est sur la page panier, mettre à jour les éléments du panier
//                 if (window.location.pathname.includes('cart')) {
//                     // Mise à jour du total et du nombre d'articles
//                     const cartItems = doc.querySelectorAll('.cart-item');
//                     const currentCartItems = document.querySelectorAll('.cart-item');
                    
//                     if (cartItems.length > 0 && currentCartItems.length > 0) {
//                         // Mise à jour des quantités et des totaux pour chaque article
//                         cartItems.forEach((item, index) => {
//                             const quantity = item.querySelector('.cart-quantity');
//                             const total = item.querySelector('.cart-total');
                            
//                             if (quantity && total && currentCartItems[index]) {
//                                 const currentQuantity = currentCartItems[index].querySelector('.cart-quantity');
//                                 const currentTotal = currentCartItems[index].querySelector('.cart-total');
                                
//                                 if (currentQuantity && currentTotal) {
//                                     currentQuantity.textContent = quantity.textContent;
//                                     currentTotal.textContent = total.textContent;
//                                 }
//                             }
//                         });
//                     }
                    
//                     // Mise à jour du total global
//                     const orderTotal = doc.querySelector('.order-total');
//                     const currentOrderTotal = document.querySelector('.order-total');
//                     if (orderTotal && currentOrderTotal) {
//                         currentOrderTotal.textContent = orderTotal.textContent;
//                     }
                    
//                     // Mise à jour du nombre d'articles global
//                     const orderItems = doc.querySelector('.order-items');
//                     const currentOrderItems = document.querySelector('.order-items');
//                     if (orderItems && currentOrderItems) {
//                         currentOrderItems.textContent = orderItems.textContent;
//                     }
//                 }
                
//                 // Afficher une notification
//                 showNotification('Panier mis à jour', 'success');
//             })
//             .catch(error => {
//                 console.error('Erreur lors de la mise à jour de l\'interface:', error);
//                 showNotification('Erreur lors de la mise à jour du panier', 'error');
//             });
//     }
    
//     // Fonction pour afficher une notification
//     function showNotification(message, type = 'success') {
//         // Créer l'élément de notification
//         const notification = document.createElement('div');
//         notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
//             type === 'success' ? 'bg-green-500' : 'bg-red-500'
//         } text-white`;
//         notification.style.transition = 'opacity 0.3s ease-in-out';
//         notification.style.opacity = '0';
//         notification.textContent = message;
        
//         // Ajouter au document
//         document.body.appendChild(notification);
        
//         // Animation d'entrée
//         setTimeout(() => {
//             notification.style.opacity = '1';
//         }, 10);
        
//         // Animation de sortie
//         setTimeout(() => {
//             notification.style.opacity = '0';
//             setTimeout(() => {
//                 notification.remove();
//             }, 300);
//         }, 3000);
//     }
    
//     // Fonction utilitaire pour récupérer les cookies (pour CSRF)
//     function getCookie(name) {
//         let cookieValue = null;
//         if (document.cookie && document.cookie !== '') {
//             const cookies = document.cookie.split(';');
//             for (let i = 0; i < cookies.length; i++) {
//                 const cookie = cookies[i].trim();
//                 if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                     break;
//                 }
//             }
//         }
//         return cookieValue;
//     }
// });