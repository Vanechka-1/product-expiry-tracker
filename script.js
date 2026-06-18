// API URL - змініть на вашу Render URL коли розгорнете
const API_URL = 'https://product-expiry-tracker-y411.onrender.com'; // Для розробки
// const API_URL = 'https://your-render-url.onrender.com'; // Для production

let currentUser = null;
let authToken = localStorage.getItem('authToken');
let currentLanguage = localStorage.getItem('language') || 'uk';

if (authToken) {
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  showMainApp();
} else {
  showLoginForm();
}

// ============ AUTHENTICATION ============

function showLoginForm() {
  document.body.innerHTML = `
    <div class="container">
      <header>
        <h1 id="title">Product Expiry Tracker</h1>
        <div class="language-switcher">
          <button id="langUK" class="lang-btn active">🇺🇦 Українська</button>
          <button id="langDE" class="lang-btn">🇩🇪 Deutsch</button>
        </div>
      </header>
      <main style="display: flex; justify-content: center; align-items: center; min-height: 70vh;">
        <div class="auth-form" style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
          <h2 id="loginTitle" style="text-align: center; margin-bottom: 30px;">Register / Login</h2>
          <form id="authForm">
            <div class="form-group">
              <label for="email" id="emailLabel">Email:</label>
              <input type="email" id="email" placeholder="your@email.com" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
            </div>
            <button type="submit" id="loginBtn" style="width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-top: 20px;">Register / Login</button>
          </form>
          <p id="loginHint" style="text-align: center; margin-top: 15px; color: #666; font-size: 14px;">Just enter your email, no password needed!</p>
        </div>
      </main>
    </div>
  `;

  document.getElementById('authForm').addEventListener('submit', handleLogin);
  setupLanguageSwitcher();
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (data.success) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(currentUser));
      showMainApp();
    } else {
      alert('❌ ' + (data.error || 'Error'));
    }
  } catch (err) {
    alert('❌ Cannot connect to server. Make sure backend is running on ' + API_URL);
    console.error(err);
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  showLoginForm();
}

// ============ MAIN APP ============

function showMainApp() {
  document.body.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Expiry Tracker</title>
        <link rel="stylesheet" href="styles.css">
    </head>
    <body>
        <div class="container">
            <header>
                <h1 id="title">Product Expiry Tracker</h1>
                <div style="display: flex; gap: 15px; align-items: center;">
                  <div class="language-switcher">
                      <button id="langUK" class="lang-btn active">🇺🇦 Українська</button>
                      <button id="langDE" class="lang-btn">🇩🇪 Deutsch</button>
                  </div>
                  <div style="text-align: right;">
                    <p id="userEmail" style="margin: 0; font-size: 14px; color: #666;">${currentUser.email}</p>
                    <button id="logoutBtn" style="padding: 5px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Logout</button>
                  </div>
                </div>
            </header>

            <main>
                <!-- Add Product Form -->
                <section class="form-section">
                    <h2 id="addProductTitle">Add Product</h2>
                    <form id="productForm">
                        <div class="form-group">
                            <label for="productName" id="productNameLabel">Product Name:</label>
                            <input type="text" id="productName" placeholder="e.g., Milk" required>
                        </div>
                        <div class="form-group">
                            <label for="expiryDate" id="expiryDateLabel">Expiry Date:</label>
                            <input type="date" id="expiryDate" required>
                        </div>
                        <button type="submit" id="addBtn">Add Product</button>
                    </form>
                </section>

                <!-- Products List -->
                <section class="products-section">
                    <h2 id="productsListTitle">All Products</h2>
                    <div id="productsList" class="products-list">
                        <p id="noProductsMsg">No products added yet</p>
                    </div>
                </section>

                <!-- Expired Products Alert -->
                <section class="expired-section" id="expiredSection" style="display: none;">
                    <h2 id="expiredTitle">Expired Products</h2>
                    <div id="expiredList" class="expired-list"></div>
                </section>
            </main>

            <footer>
                <p id="footer">© 2024 Product Expiry Tracker. All rights reserved.</p>
            </footer>
        </div>

        <script src="translations.js"></script>
        <script src="script.js"></script>
    </body>
    </html>
  `;

  setupLanguageSwitcher();
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('productForm').addEventListener('submit', addProduct);
  loadProducts();
  setInterval(loadProducts, 5000); // Refresh every 5 seconds
}

// ============ PRODUCTS ============

async function addProduct(e) {
  e.preventDefault();
  const name = document.getElementById('productName').value;
  const expiryDate = document.getElementById('expiryDate').value;

  if (!name || !expiryDate) {
    alert('❌ Please fill all fields');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name,
        expiryDate,
        email: currentUser.email
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ Product added! You will receive notifications when it expires.');
      document.getElementById('productForm').reset();
      loadProducts();
    } else {
      alert('❌ ' + (data.error || 'Error'));
    }
  } catch (err) {
    alert('❌ Error adding product: ' + err.message);
    console.error(err);
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const products = await response.json();

    const productsList = document.getElementById('productsList');
    const expiredList = document.getElementById('expiredList');
    const expiredSection = document.getElementById('expiredSection');

    if (!products || products.length === 0) {
      productsList.innerHTML = '<p id="noProductsMsg">No products added yet</p>';
      expiredSection.style.display = 'none';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let activeProducts = '';
    let expiredProducts = '';
    let hasExpired = false;

    products.forEach(product => {
      const expiryDate = new Date(product.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      const formattedDate = expiryDate.toLocaleDateString();

      const productHTML = `
        <div class="product-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: ${daysLeft < 0 ? '#ffebee' : daysLeft === 0 ? '#fff3e0' : '#f5f5f5'}; margin: 10px 0; border-radius: 8px; border-left: 4px solid ${daysLeft < 0 ? '#dc3545' : daysLeft === 0 ? '#ff9800' : '#28a745'};">
          <div>
            <h4 style="margin: 0; ${daysLeft < 0 ? 'color: #dc3545;' : ''}">${product.name}</h4>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
              ${daysLeft < 0 ? '❌ EXPIRED ' + Math.abs(daysLeft) + ' days ago' : daysLeft === 0 ? '⚠️ Expires TODAY' : '✅ Expires in ' + daysLeft + ' days'}
            </p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${formattedDate}</p>
          </div>
          <button class="delete-btn" data-id="${product._id}" style="padding: 8px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
        </div>
      `;

      if (daysLeft < 0) {
        expiredProducts += productHTML;
        hasExpired = true;
      } else {
        activeProducts += productHTML;
      }
    });

    productsList.innerHTML = activeProducts || '<p id="noProductsMsg">No active products</p>';

    if (hasExpired) {
      expiredSection.style.display = 'block';
      expiredList.innerHTML = expiredProducts;
    } else {
      expiredSection.style.display = 'none';
    }

    // Add delete listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', deleteProduct);
    });

  } catch (err) {
    console.error('Error loading products:', err);
  }
}

async function deleteProduct(e) {
  const productId = e.target.dataset.id;

  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ Product deleted');
      loadProducts();
    }
  } catch (err) {
    alert('❌ Error deleting product');
    console.error(err);
  }
}

// ============ LANGUAGE SWITCHER ============

function setupLanguageSwitcher() {
  const langUK = document.getElementById('langUK');
  const langDE = document.getElementById('langDE');

  if (!langUK || !langDE) return;

  langUK.addEventListener('click', () => switchLanguage('uk'));
  langDE.addEventListener('click', () => switchLanguage('de'));

  if (currentLanguage === 'de') {
    langUK.classList.remove('active');
    langDE.classList.add('active');
    updateLanguage('de');
  }
}

function switchLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  updateLanguage(lang);

  const langUK = document.getElementById('langUK');
  const langDE = document.getElementById('langDE');
  if (langUK && langDE) {
    langUK.classList.toggle('active');
    langDE.classList.toggle('active');
  }
}

function updateLanguage(lang) {
  const translations = getTranslations(lang);

  Object.keys(translations).forEach(key => {
    const element = document.getElementById(key);
    if (element) {
      element.textContent = translations[key];
    }
  });
}

function getTranslations(lang) {
  const uk = {
    title: 'Product Expiry Tracker',
    addProductTitle: 'Додати товар',
    productNameLabel: 'Назва товару:',
    expiryDateLabel: 'Дата прострочення:',
    addBtn: 'Додати товар',
    productsListTitle: 'Усі товари',
    noProductsMsg: 'Товари не додані',
    expiredTitle: 'Прострочені товари',
    footer: '© 2024 Product Expiry Tracker. Усі права захищені.',
    loginTitle: 'Реєстрація / Вхід',
    emailLabel: 'Електронна пошта:',
    loginBtn: 'Реєстрація / Вхід',
    loginHint: 'Просто введіть свою електронну пошту, пароль не потрібен!'
  };

  const de = {
    title: 'Produkt-Ablaufdatum-Tracker',
    addProductTitle: 'Produkt hinzufügen',
    productNameLabel: 'Produktname:',
    expiryDateLabel: 'Ablaufdatum:',
    addBtn: 'Produkt hinzufügen',
    productsListTitle: 'Alle Produkte',
    noProductsMsg: 'Noch keine Produkte hinzugefügt',
    expiredTitle: 'Abgelaufene Produkte',
    footer: '© 2024 Produkt-Ablaufdatum-Tracker. Alle Rechte vorbehalten.',
    loginTitle: 'Registrieren / Anmelden',
    emailLabel: 'E-Mail:',
    loginBtn: 'Registrieren / Anmelden',
    loginHint: 'Geben Sie einfach Ihre E-Mail-Adresse ein, kein Passwort erforderlich!'
  };

  return lang === 'de' ? de : uk;
}
