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

    // Cerrar automáticamente después de 3 segundos si es un mensaje de éxito o info
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            modal.remove();
        }, 3000);
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


    if (!window.allProducts || window.allProducts.length === 0) {

        await cargarProdudcto(); 
    }

    const product = window.allProducts.find(p => p.id === productId);

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
    await loadProductDetails();
});
