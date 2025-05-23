
const productsContainer = document.getElementById('products-container');
const productForm = document.getElementById('product-form');
const submitBtn = document.getElementById('submit-btn');
const updateBtn = document.getElementById('update-btn');
const cancelBtn = document.getElementById('cancel-btn');
const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
let products = [];
let productToDelete = null;


const API_URL = 'http://localhost:3000/products';

function loadProduct(product) {
    const card = document.createElement('div');
    card.classList.add('col-md-4', 'mb-4');
    
    card.innerHTML = `
        <div class="card h-100">
            <img src="${product.image}" class="card-img-top product-image" alt="${product.name}">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="text-success fw-bold">$${product.price}</p>
                <div class="d-flex justify-content-between">
                    <a href="${product.buy_link}" class="btn btn-primary">Buy Now</a>
                    <div>
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    productsContainer.appendChild(card);
}


async function getProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        products = await response.json();
        productsContainer.innerHTML = '';
        products.forEach(product => loadProduct(product));
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Error loading products. Please try again.');
    }
}


async function addProduct(product) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) throw new Error('Failed to add product');
        
        const newProduct = await response.json();
        loadProduct(newProduct);
        productForm.reset();
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Please try again.');
    }
}


async function updateProduct(id, updatedProduct) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        });
        
        if (!response.ok) throw new Error('Failed to update product');
        
        const data = await response.json();
        getProducts(); // Refresh the list
        resetForm();
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product. Please try again.');
    }
}


async function deleteProduct(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        getProducts(); // Refresh the list
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
    }
}

function setFormForEdit(product) {
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-link').value = product.buy_link;
    
    submitBtn.classList.add('d-none');
    updateBtn.classList.remove('d-none');
    cancelBtn.classList.remove('d-none');
}


function resetForm() {
    productForm.reset();
    document.getElementById('product-id').value = '';
    
    submitBtn.classList.remove('d-none');
    updateBtn.classList.add('d-none');
    cancelBtn.classList.add('d-none');
}


productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const product = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        image: document.getElementById('product-image').value,
        price: document.getElementById('product-price').value,
        buy_link: document.getElementById('product-link').value
    };
    
    const productId = document.getElementById('product-id').value;
    
    if (productId) {
        await updateProduct(productId, product);
    } else {
        await addProduct(product);
    }
});

updateBtn.addEventListener('click', async () => {
    const productId = document.getElementById('product-id').value;
    const product = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        image: document.getElementById('product-image').value,
        price: document.getElementById('product-price').value,
        buy_link: document.getElementById('product-link').value
    };
    
    await updateProduct(productId, product);
});

cancelBtn.addEventListener('click', resetForm);


productsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn') || e.target.parentElement.classList.contains('edit-btn')) {
        const productId = e.target.classList.contains('edit-btn') 
            ? e.target.getAttribute('data-id') 
            : e.target.parentElement.getAttribute('data-id');
        
        const product = products.find(p => p.id == productId);
        if (product) setFormForEdit(product);
    }
    
    if (e.target.classList.contains('delete-btn') || e.target.parentElement.classList.contains('delete-btn')) {
        const productId = e.target.classList.contains('delete-btn') 
            ? e.target.getAttribute('data-id') 
            : e.target.parentElement.getAttribute('data-id');
        
        productToDelete = productId;
        confirmationModal.show();
    }
});

document.getElementById('confirm-delete').addEventListener('click', async () => {
    if (productToDelete) {
        await deleteProduct(productToDelete);
        confirmationModal.hide();
        productToDelete = null;
    }
});


document.addEventListener('DOMContentLoaded', () => {
    getProducts();
});