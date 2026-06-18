# Product Expiry Tracker 🛒

A web application to track product expiry dates with email notifications in Ukrainian and German.

## Features

✅ **Add Products** - Easily add products with expiry dates  
✅ **Track Expiry** - See all products and their expiry status  
✅ **Email Notifications** - Get notified when products are about to expire or have expired  
✅ **Multi-language** - Support for Ukrainian (🇺🇦) and German (🇩🇪)  
✅ **Local Storage** - Your data is saved in your browser  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

## How to Use

### 1. Visit the Website
The app is hosted on GitHub Pages at: `https://Vanechka-1.github.io/product-expiry-tracker/`

### 2. Add a Product
- Enter the product name (e.g., "Milk", "Cheese")
- Select the expiry date
- Enter your email for notifications
- Click "Add Product"

### 3. View All Products
- See all your products in the list
- Products show their status:
  - 🟢 **Valid** - More than 3 days until expiry
  - 🟡 **Expiring Soon** - 3 days or less until expiry
  - 🔴 **Expired** - Product has passed its expiry date

### 4. Switch Language
- Click the language button (🇺🇦 Українська or 🇩🇪 Deutsch) at the top right
- Your preference will be saved

### 5. Delete Products
- Click the "Delete" button on any product card
- Confirm the deletion

## Email Notifications

### How It Works
The app checks every hour for products that are expiring or have expired:
- If a product will expire within 1 day
- If a product has already expired

You will receive an email notification at the address you provided.

### Setting Up Email Notifications (Production)
To enable automatic email notifications, you need to set up a backend service. Here are some options:

#### Option 1: Using EmailJS (Recommended for GitHub Pages)

1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Create an email service and template
3. Update the `sendNotificationEmail()` function in `script.js`:

```javascript
function sendNotificationEmail(email, subject, message) {
    emailjs.init('YOUR_PUBLIC_KEY'); // Get this from EmailJS
    emailjs.send('SERVICE_ID', 'TEMPLATE_ID', {
        to_email: email,
        subject: subject,
        message: message
    });
}
```

#### Option 2: Using a Backend Server

Create a simple backend (Node.js, Python, etc.) to handle emails:

```javascript
function sendNotificationEmail(email, subject, message) {
    fetch('https://your-backend.com/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message })
    });
}
```

#### Option 3: Using Formspree or Similar Services

Use free form-to-email services to send notifications.

## File Structure

```
product-expiry-tracker/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── script.js           # Main JavaScript logic
├── translations.js     # Language translations
├── package.json        # Project metadata
└── README.md           # This file
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Data Privacy

Your data is stored locally in your browser using **localStorage**. Nothing is sent to external servers (except email notifications).

## Future Improvements

- [ ] Sync data across devices
- [ ] Export/import products as CSV
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Dark mode
- [ ] More languages

## License

MIT License - feel free to use this project for your needs!

## Support

If you have any questions or issues, please open an issue on GitHub.