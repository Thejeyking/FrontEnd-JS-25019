// Función para mostrar mensajes en un modal personalizado en lugar de alert()
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

// Simulación de carrito de compras y usuarios (se re-importan o asumen disponibles globalmente si script.js se carga antes)
// Para que esto funcione, `script.js` debe cargarse ANTES que `producto.js`
// Y las funciones `addToCart`, `getCurrentUser`, `allProducts` deben ser accesibles globalmente.
// Si no están globalmente disponibles, habría que pasarles como argumentos o importarlas de otra forma.
// Para este ejemplo, asumiremos que `allProducts`, `addToCart`, y `getCurrentUser` son globales.


// Función para cargar los detalles del producto en producto.html
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

    // `allProducts` se asume que ha sido cargado por script.js
    // Si no está disponible, habría que cargarlo aquí también (duplicación o reestructuración)
    if (!window.allProducts || window.allProducts.length === 0) {
        // Fallback: si por alguna razón allProducts no se cargó en script.js, lo cargamos aquí.
        // En una aplicación real, se manejaría con promesas o un sistema de módulos.
        await loadProducts(); // Llama a la función de carga de productos si no existen
    }

    const product = window.allProducts.find(p => p.id === productId);

    if (product) {
        productTitleElement.textContent = product.name; // Actualizar el título de la página
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

        // Añadir event listener al botón "Añadir al Carrito" después de que se ha creado
        const addToCartButton = productDetailsSection.querySelector('.add-to-cart');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', (e) => {
                const currentUser = getCurrentUser(); // Asume que getCurrentUser es global
                if (!currentUser) {
                    showModalMessage('Debes iniciar sesión para agregar productos al carrito.', 'info');
                    window.location.href = '../pages/login.html'; // Redirigir al login
                    return;
                }
                addToCart(product); // Asume que addToCart es global
            });
        }

    } else {
        productDetailsSection.innerHTML = '<p style="color:white; text-align:center;">Producto no encontrado.</p>';
        productTitleElement.textContent = 'Producto no encontrado';
    }
}

// Inicialización de la página de producto cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async () => {
    // Es crucial que `script.js` se cargue antes y defina `allProducts` y las funciones compartidas.
    // Aquí simplemente llamamos a la función de carga de detalles del producto.
    await loadProductDetails();
});
