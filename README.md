# Sip & Energize

Sip & Energize is a small multi-page yerba mate storefront built with static HTML, CSS, and JavaScript, with an optional Node.js + MongoDB backend for authentication and order APIs.

The frontend works as a normal static site, and the project also includes a backend folder for server-side auth and order storage when you want a full stack setup.

## What The Project Includes

- Product storefront with add-to-cart actions
- Cart panel with quantity controls and subtotal
- Checkout page with shipping form and order summary
- Login and registration page
- Local browser-based auth fallback when the backend is unavailable
- Informational pages like About, Benefits, Brewing Guide, Contact, Shipping, Refund, Privacy, and Terms
- Optional Express API with MongoDB models for users and orders

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- localStorage for cart, auth session, local users, and order history
- EmailJS for checkout email sending

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Project Structure

```text
mateshop.github.io/
├── index.html
├── login.html
├── checkout.html
├── about.html
├── benefits.html
├── brewing-guide.html
├── contact.html
├── shipping.html
├── refund.html
├── privacy.html
├── terms.html
├── style.css
├── script.js
├── images/
├── QUICK_START.md
├── AUTHENTICATION_SETUP.md
├── CANVA_DESIGN_PROMPT.md
├── README.md
└── server/
    ├── server.js
    ├── routes/
    ├── models/
    ├── middleware/
    ├── package.json
    └── README.md
```

## Frontend Pages

- `index.html`: main shop page with products, cart access, and protected shop entry
- `login.html`: login and registration forms
- `checkout.html`: order summary, shipping form, and success/empty states
- `about.html`, `benefits.html`, `brewing-guide.html`, `contact.html`: content and marketing pages
- `shipping.html`, `refund.html`, `privacy.html`, `terms.html`: support and policy pages

## How The Frontend Works

Most interactive behavior lives in `script.js`.

### Cart

- Products are defined in a JavaScript array
- Cart items are stored in `localStorage` under `sipCart`
- The cart panel supports adding items, changing quantities, and showing the subtotal
- Cart contents persist across page refreshes

### Authentication

- The app stores session data in `localStorage`
- `auth_token` stores the current token
- `user_data` stores the logged-in user object
- The frontend first tries the backend API at `http://localhost:5000/api`
- If the backend cannot be reached, login and registration fall back to local browser storage using `mateshop_local_users`

### Checkout

- The checkout form validates name, email, phone, and address
- Orders are stored locally in `orderHistory`
- If EmailJS is available, the app sends a confirmation email
- If EmailJS is unavailable, the order still completes in the UI

## Running The Frontend

Because the site is static, you can open the HTML files directly in a browser. Using a local server is better for testing.

### Option 1: Open Directly

Open `login.html` or `index.html` in your browser.

### Option 2: Run A Local Static Server

From the project root:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/login.html
```

## Running The Backend

The backend is optional, but if you want real API-based authentication and order storage:

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=change_this_to_a_strong_random_string
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000/api
```

## Backend API Overview

### Auth Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify`
- `POST /api/auth/logout`

### Order Routes

- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:orderId`

## Important Notes

- `index.html` currently checks for `auth_token` in `localStorage` and redirects unauthenticated users to `login.html`
- The frontend auth fallback is useful for static hosting, demos, and local testing without the backend
- The real backend still depends on MongoDB and a valid `JWT_SECRET`

## Related Docs

- `QUICK_START.md`: quick setup guide
- `AUTHENTICATION_SETUP.md`: auth and backend setup details
- `server/README.md`: backend-specific documentation

## Current Status

This project is best described as a hybrid storefront:

- usable as a static frontend demo
- partially connected to a real backend
- suitable for learning, prototyping, and iterative improvement

## License

This project is for educational and personal project use.
