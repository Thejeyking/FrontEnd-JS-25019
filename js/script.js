let allProducts = [];

function showModalMessage(message, type = 'info') {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="custom-modal-content custom-modal-${type}">
            <span class="custom-modal-close-button">&times;</span>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.custom-modal-close-button');
    closeButton.onclick = () => {
        modal.remove();
    };

    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    };

    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            modal.remove();
        }, 3000);
    }
}

let users = JSON.parse(localStorage.getItem('users')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

async function cargarProdudcto() {
    try {
        const response = await fetch('../products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
    } catch (error) {
        console.error('Error cargando los productos:', error);
        showModalMessage('Error al cargar los productos. Intenta de nuevo más tarde.', 'error');
    }
}

function registrarUser(username, password) {
    if (users.find(user => user.username === username)) {
        showModalMessage('El usuario ya existe.', 'error');
        return false;
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    showModalMessage('¡Registro exitoso! Ya puedes iniciar sesión.', 'success');
    return true;
}

function loginUser(username, password) {
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showModalMessage('¡Inicio de sesión exitoso!', 'success');
        return true;
    } else {
        showModalMessage('Nombre de usuario o contraseña incorrectos.', 'error');
        return false;
    }
}

function cerrarSesionUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    cart = [];
    updateCartDisplay();
    showModalMessage('Sesión cerrada.', 'info');
    updateAuthLinks();
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function updateAuthLinks() {
    const currentUser = getCurrentUser();
    const authLinksContainer = document.getElementById('auth-links');
    if (authLinksContainer) {
        authLinksContainer.innerHTML = '';

        if (currentUser) {
            const welcomeItem = document.createElement('li');
            welcomeItem.innerHTML = `<span style="color: #FFDE00;">Hola, ${currentUser.username}</span>`;
            authLinksContainer.appendChild(welcomeItem);

            const logoutItem = document.createElement('li');
            logoutItem.innerHTML = `<a href="#" id="logout-link">Cerrar Sesión</a>`;
            authLinksContainer.appendChild(logoutItem);
            
            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    cerrarSesionUser();
                    window.location.href = '../index.html'; 
                });
            }
        } else {
            const loginItem = document.createElement('li');
            loginItem.innerHTML = `<a href="../pages/login.html">Iniciar Sesión</a>`;
            authLinksContainer.appendChild(loginItem);
        }
    }
}

function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    showModalMessage(`"${item.name}" agregado al carrito. Cantidad: ${existingItem ? existingItem.quantity : 1}`, 'success');
    updateCartDisplay();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    showModalMessage('Producto eliminado del carrito.', 'info');
    updateCartDisplay();
}

function updateCartQuantity(itemId, newQuantity) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity = newQuantity;
        if (cart[itemIndex].quantity <= 0) {
            removeFromCart(itemId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function renderCartPage() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    if (!cartItemsContainer || !cartTotalElement) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        cartTotalElement.textContent = '$0.00';
        return;
    }

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item-card';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Precio: $${item.price.toFixed(2)}</p>
                <div class="cart-quantity-control">
                    <button class="quantity-minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-plus" data-id="${item.id}">+</button>
                </div>
                <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-from-cart" data-id="${item.id}">Eliminar</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    cartTotalElement.textContent = `$${getCartTotal().toFixed(2)}`;

    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.id;
            removeFromCart(itemId);
        });
    });

    document.querySelectorAll('.quantity-minus').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.id;
            const item = cart.find(i => i.id === itemId);
            if (item) {
                updateCartQuantity(itemId, item.quantity - 1);
            }
        });
    });

    document.querySelectorAll('.quantity-plus').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.id;
            const item = cart.find(i => i.id === itemId);
            if (item) {
                updateCartQuantity(itemId, item.quantity + 1);
            }
        });
    });
}

function updateCartDisplay() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
}

async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const productDetailsSection = document.getElementById('product-details-section');
    const productTitleElement = document.getElementById('product-title');

    if (!productId || !productDetailsSection) {
        if(productDetailsSection) productDetailsSection.innerHTML = '<p style="color:white; text-align:center;">Producto no encontrado.</p>';
        if(productTitleElement) productTitleElement.textContent = 'Producto no encontrado';
        return;
    }

    if (allProducts.length === 0) {
        await cargarProdudcto();
    }

    const product = allProducts.find(p => p.id === productId);

    if (product) {
        productTitleElement.textContent = product.name;
        productDetailsSection.setAttribute('data-id', product.id);
        productDetailsSection.setAttribute('data-name', product.name);
        productDetailsSection.setAttribute('data-price', product.price);
        productDetailsSection.setAttribute('data-image', product.image);

        productDetailsSection.innerHTML = `
            <div class="class_item_img">
                <img src="${product.image}" alt="${product.name}" class="css_items_img">
            </div>
            <div class="class_item">
                <p class="p_title_item">${product.name}</p>
                <p class="p_descripcion_item">${product.description}</p>
                <div class="div_buy_item">
                    <p class="p_price_item">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart p_buy_item">Añadir al Carrito</button>
                </div>
            </div>
        `;

        const addToCartButton = productDetailsSection.querySelector('.add-to-cart');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', (e) => {
                const currentUser = getCurrentUser();
                if (!currentUser) {
                    showModalMessage('Debes iniciar sesión para agregar productos al carrito.', 'info');
                    window.location.href = '../pages/login.html';
                    return;
                }
                addToCart(product);
            });
        }

    } else {
        productDetailsSection.innerHTML = '<p style="color:white; text-align:center;">Producto no encontrado.</p>';
        productTitleElement.textContent = 'Producto no encontrado';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProdudcto();
    
    updateAuthLinks();
    updateCartDisplay();

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;
            if (loginUser(username, password)) {
                window.location.href = '../index.html'; 
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm['confirm-password'].value;

            if (password !== confirmPassword) {
                showModalMessage('Las contraseñas no coinciden.', 'error');
                return;
            }
            if (registrarUser(username, password)) {
                registerForm.reset();
            }
        });
    }

    document.querySelectorAll('.div_items_shop .add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showModalMessage('Debes iniciar sesión para agregar productos al carrito.', 'info');
                window.location.href = '../pages/login.html';
                return;
            }

            const itemElement = e.target.closest('.div_items_shop');
            if (itemElement) {
                const itemId = itemElement.dataset.id;
                const productToAdd = allProducts.find(p => p.id === itemId);

                if (productToAdd) {
                    addToCart(productToAdd);
                } else {
                    console.error('Producto no encontrado en la lista de productos para añadir al carrito:', itemId);
                    showModalMessage('No se pudo añadir el producto al carrito. Producto no encontrado.', 'error');
                }
            }
        });
    });

    if (window.location.pathname.includes('producto.html')) {
        await loadProductDetails();
    }
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
});
