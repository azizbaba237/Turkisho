// Get all add-to-cart buttons
var updateBtns = document.getElementsByClassName('update-cart');

// Add click event listener to each button
for (var i = 0; i < updateBtns.length; i++) {
    updateBtns[i].addEventListener('click', function(e) {
        e.preventDefault(); // Prevent form submission and page reload
        
        var productId = this.dataset.product;
        var action = this.dataset.action;
        
        console.log('productId:', productId, 'Action:', action);
        
        // Check if user is authenticated
        if (user.is_authenticated === "true") {
            updateUserOrder(productId, action);
        } else {
            updateCookieCart(productId, action);
        }
    });
}

// Function to update order for authenticated users
function updateUserOrder(productId, action) {
    console.log('User is authenticated, sending data...');

    var url = '/update_item/';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({'productId': productId, 'action': action})
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log('Data:', data);
        // Update cart item count or visual feedback without reloading
        location.reload(); // Optional: remove this line to prevent page reload
        // Instead, update the cart UI dynamically
        updateCartUI(data);
    });
}

// Function to update cart for non-authenticated users using cookies
function updateCookieCart(productId, action) {
    console.log('User is not authenticated');
    
    if (action == 'add') {
        if (cart[productId] == undefined) {
            cart[productId] = {'quantity': 1};
        } else {
            cart[productId]['quantity'] += 1;
        }
    }
    
    if (action == 'remove') {
        cart[productId]['quantity'] -= 1;
        
        if (cart[productId]['quantity'] <= 0) {
            delete cart[productId];
        }
    }
    
    console.log('Cart:', cart);
    document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/";
    
    // Update the cart UI without refreshing the page
    updateCartUI();
}

// Function to update the cart UI without page reload
function updateCartUI(data) {
    // Update cart icon or counter
    var cartCount = document.getElementById('cart-count');
    if (cartCount) {
        // If you have data from the server, use it
        if (data && data.cartItems) {
            cartCount.textContent = data.cartItems;
        } else {
            // Otherwise calculate from cookie
            let itemCount = 0;
            for (const id in cart) {
                itemCount += cart[id]['quantity'];
            }
            cartCount.textContent = itemCount;
        }
    }
    
    // Add a visual feedback that the item was added to cart
    showNotification('Product added to cart!');
}

// Function to show a brief notification
function showNotification(message) {
    // Create notification element if it doesn't exist
    var notification = document.getElementById('cart-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg opacity-0 transition-opacity duration-300';
        document.body.appendChild(notification);
    }
    
    // Update and show notification
    notification.textContent = message;
    notification.classList.remove('opacity-0');
    notification.classList.add('opacity-100');
    
    // Hide notification after 3 seconds
    setTimeout(function() {
        notification.classList.remove('opacity-100');
        notification.classList.add('opacity-0');
    }, 3000);
}