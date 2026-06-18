// Initialize language
let currentLanguage = localStorage.getItem('language') || 'uk';

// DOM Elements
const productForm = document.getElementById('productForm');
const productNameInput = document.getElementById('productName');
const expiryDateInput = document.getElementById('expiryDate');
const emailInput = document.getElementById('emailNotification');
const productsList = document.getElementById('productsList');
const langUKBtn = document.getElementById('langUK');
const langDEBtn = document.getElementById('langDE');
const expiredSection = document.getElementById('expiredSection');
const expiredList = document.getElementById('expiredList');

// Load products from localStorage
function loadProducts() {
    const stored = localStorage.getItem('products');
    return stored ? JSON.parse(stored) : [];
}

// Save products to localStorage
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'uk' ? 'uk-UA' : 'de-DE');
}

// Calculate days until expiry
function getDaysUntilExpiry(dateString) {
    const expiryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const timeDifference = expiryDate - today;
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
}

// Get status badge and class
function getProductStatus(daysUntilExpiry) {
    if (daysUntilExpiry < 0) {
        return {
            class: 'expired',
            badge: 'expired',
            text: `${getTranslation('statusExpired')} ${Math.abs(daysUntilExpiry)} ${getTranslation('daysLeft')}`
        };
    } else if (daysUntilExpiry <= 3) {
        return {
            class: 'expiring-soon',
            badge: 'warning',
            text: `${getTranslation('statusExpiring')} ${daysUntilExpiry} ${getTranslation('daysLeft')}`
        };
    } else {
        return {
            class: 'ok',
            badge: 'ok',
            text: `${getTranslation('statusOk')}`
        };
    }
}

// Render products
function renderProducts() {
    const products = loadProducts();
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = `<p>${getTranslation('noProductsMsg')}</p>`;
        expiredSection.style.display = 'none';
        return;
    }

    let hasExpired = false;

    products.forEach((product, index) => {
        const daysLeft = getDaysUntilExpiry(product.expiryDate);
        const status = getProductStatus(daysLeft);

        if (daysLeft < 0) {
            hasExpired = true;
        }

        const card = document.createElement('div');
        card.className = `product-card ${status.class}`;
        card.innerHTML = `
            <div class="product-name">${product.name}</div>
            <span class="status-badge ${status.badge}">${status.text}</span>
            <div class="product-info">
                <span>📅 ${getTranslation('expiryDateLabel')}</span>
                <span>${formatDate(product.expiryDate)}</span>
            </div>
            <div class="product-info">
                <span>📧 ${getTranslation('emailLabel')}</span>
                <span>${product.email}</span>
            </div>
            <div class="product-actions">
                <button class="delete-btn" onclick="deleteProduct(${index})">${getTranslation('delete')}</button>
            </div>
        `;
        productsList.appendChild(card);
    });

    // Show expired products section
    if (hasExpired) {
        expiredSection.style.display = 'block';
        renderExpiredProducts();
    } else {
        expiredSection.style.display = 'none';
    }
}

// Render expired products
function renderExpiredProducts() {
    const products = loadProducts();
    expiredList.innerHTML = '';

    const expiredProducts = products.filter(p => getDaysUntilExpiry(p.expiryDate) < 0);

    expiredProducts.forEach((product, index) => {
        const daysExpired = Math.abs(getDaysUntilExpiry(product.expiryDate));
        const card = document.createElement('div');
        card.className = 'expired-card';
        card.innerHTML = `
            <div class="product-name" style="color: #e74c3c;">${product.name}</div>
            <div class="product-info">
                <span>⚠️ ${getTranslation('statusExpired')}</span>
                <span style="color: #e74c3c; font-weight: bold;">${daysExpired} ${getTranslation('daysLeft')}</span>
            </div>
            <div class="product-info">
                <span>📅 ${getTranslation('expiryDateLabel')}</span>
                <span>${formatDate(product.expiryDate)}</span>
            </div>
        `;
        expiredList.appendChild(card);
    });
}

// Delete product
function deleteProduct(index) {
    if (confirm(getTranslation('deleteConfirm'))) {
        const products = loadProducts();
        products.splice(index, 1);
        saveProducts(products);
        renderProducts();
    }
}

// Add product
productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newProduct = {
        name: productNameInput.value,
        expiryDate: expiryDateInput.value,
        email: emailInput.value,
        dateAdded: new Date().toISOString()
    };

    const products = loadProducts();
    products.push(newProduct);
    saveProducts(products);

    // Send notification email (simplified - in production use a backend service)
    sendNotificationEmail(newProduct.email, `New product added: ${newProduct.name}`, `Product "${newProduct.name}" will expire on ${formatDate(newProduct.expiryDate)}`);

    alert(getTranslation('successMessage'));
    productForm.reset();
    renderProducts();
});

// Language switching
langUKBtn.addEventListener('click', () => {
    currentLanguage = 'uk';
    localStorage.setItem('language', 'uk');
    updateLanguage();
});

langDEBtn.addEventListener('click', () => {
    currentLanguage = 'de';
    localStorage.setItem('language', 'de');
    updateLanguage();
});

// Update all language texts
function updateLanguage() {
    document.getElementById('title').textContent = getTranslation('title');
    document.getElementById('addProductTitle').textContent = getTranslation('addProductTitle');
    document.getElementById('productsListTitle').textContent = getTranslation('productsListTitle');
    document.getElementById('expiredTitle').textContent = getTranslation('expiredTitle');
    document.getElementById('productNameLabel').textContent = getTranslation('productNameLabel');
    document.getElementById('expiryDateLabel').textContent = getTranslation('expiryDateLabel');
    document.getElementById('emailLabel').textContent = getTranslation('emailLabel');
    document.getElementById('addBtn').textContent = getTranslation('addBtn');
    document.getElementById('noProductsMsg').textContent = getTranslation('noProductsMsg');
    document.getElementById('footer').textContent = getTranslation('footer');

    // Update language buttons
    langUKBtn.classList.toggle('active', currentLanguage === 'uk');
    langDEBtn.classList.toggle('active', currentLanguage === 'de');

    renderProducts();
}

// Send email notification (using FormSubmit service)
function sendNotificationEmail(email, subject, message) {
    // This is a simplified version. For production, use a backend service like:
    // - EmailJS
    // - SendGrid
    // - AWS SES
    // - Or your own backend
    
    console.log(`Email notification would be sent to ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
}

// Check for expired products periodically
function checkExpiredProducts() {
    const products = loadProducts();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    products.forEach(product => {
        const expiryDate = new Date(product.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        // Send notification if product expired or expiring in 1 day
        if (daysLeft <= 1 && daysLeft > -1) {
            sendExpiryNotification(product);
        } else if (daysLeft < 0) {
            sendExpiryNotification(product);
        }
    });
}

function sendExpiryNotification(product) {
    const subject = `⚠️ Product Expiry Alert: ${product.name}`;
    const daysLeft = getDaysUntilExpiry(product.expiryDate);
    let message = '';

    if (daysLeft < 0) {
        message = `The product "${product.name}" has expired ${Math.abs(daysLeft)} days ago on ${formatDate(product.expiryDate)}. Please dispose of it.`;
    } else {
        message = `The product "${product.name}" will expire on ${formatDate(product.expiryDate)}. Please check it!`;
    }

    sendNotificationEmail(product.email, subject, message);
}

// Check every hour
setInterval(checkExpiredProducts, 60 * 60 * 1000);

// Initial render
updateLanguage();
renderProducts();