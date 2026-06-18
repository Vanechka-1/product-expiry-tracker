# Product Expiry Tracker - Backend

## Setup Instructions

### 1. Environment Variables
Create a `.env` file based on `.env.example`:
```
MONGODB_URI=your_mongodb_connection_string
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASSWORD=your_app_password
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Deploy to Render
1. Push to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect your GitHub repo
5. Set environment variables in Render dashboard
6. Deploy!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register/Login with email

### Products
- `GET /api/products` - Get all user's products
- `POST /api/products` - Add new product
- `DELETE /api/products/:id` - Delete product

### Notifications
- `POST /api/check-expiry` - Check and send expiry notifications
