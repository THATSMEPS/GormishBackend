# Gormish Food Delivery Backend

A robust backend system for a food delivery application built with Node.js, Express, Prisma, and Supabase.

## Tech Stack

- Node.js & Express.js
- Prisma (ORM)
- PostgreSQL (via Supabase)
- Supabase (Auth & Storage)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   DATABASE_URL="your-supabase-postgres-url"
   SUPABASE_URL="your-supabase-project-url"
   SUPABASE_KEY="your-supabase-anon-key"
   PORT=3000
   ```
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

#### `POST /api/auth/register`
Register a new user (customer/restaurant/delivery partner)
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password",
    "name": "User Name",
    "phone": "+911234567890",
    "role": "customer" // Optional, defaults to customer
  }
  ```

#### `POST /api/auth/login`
Login with email and password
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```

#### `POST /api/auth/google`
Sign in with Google
- Body:
  ```json
  {
    "access_token": "google-oauth-token"
  }
  ```

#### `POST /api/auth/refresh-token`
Refresh access token
- Body:
  ```json
  {
    "refresh_token": "your-refresh-token"
  }
  ```

#### `GET /api/auth/me`
Get current user profile
- Headers: Authorization Bearer Token required

#### `POST /api/auth/logout`
Logout user
- Headers: Authorization Bearer Token required

### Areas

#### `GET /api/areas`
Get all areas

#### `GET /api/areas/:id`
Get area by ID

#### `POST /api/areas`
Create new area
- Body:
  ```json
  {
    "pincode": 380015,
    "areaName": "Satellite",
    "cityName": "Ahmedabad",
    "stateName": "Gujarat",
    "latitude": 23.0225,
    "longitude": 72.5714
  }
  ```

#### `PUT /api/areas/:id`
Update area
- Body: Same as POST

### Restaurants

#### `GET /api/restaurants`
Get all restaurants

#### `GET /api/restaurants/area/:areaId`
Get restaurants in a specific area

#### `GET /api/restaurants/:id`
Get restaurant by ID

#### `POST /api/restaurants`
Create new restaurant
- Headers: Authorization Bearer Token required
- Body:
  ```json
  {
    "name": "Restaurant Name",
    "mobile": "1234567890",
    "email": "restaurant@example.com",
    "cuisines": ["Indian", "Chinese"],
    "vegNonveg": "both",
    "hours": {},
    "address": {},
    "areaId": "area-uuid",
    "banners": []
  }
  ```

#### `PUT /api/restaurants/:id`
Update restaurant details
- Headers: Authorization Bearer Token required
- Body: Same as POST

#### `PATCH /api/restaurants/:id/approval`
Update restaurant approval status
- Headers: Authorization Bearer Token required
- Body:
  ```json
  {
    "approval": true
  }
  ```

#### `DELETE /api/restaurants/:id`
Delete restaurant
- Headers: Authorization Bearer Token required

### Menu Items

#### `GET /api/menu/restaurant/:restaurantId`
Get restaurant's menu items

#### `GET /api/menu/:id`
Get specific menu item

#### `POST /api/menu`
Add menu item
- Headers: Authorization Bearer Token required
- Body:
  ```json
  {
    "name": "Item Name",
    "description": "Item Description",
    "price": 199.99,
    "discountedPrice": 149.99,
    "isVeg": true,
    "packagingCharges": 20,
    "cuisine": "Indian",
    "restaurantId": "restaurant-uuid",
    "addons": []
  }
  ```

#### `PUT /api/menu/:id`
Update menu item
- Headers: Authorization Bearer Token required
- Body: Same as POST

#### `DELETE /api/menu/:id`
Delete menu item
- Headers: Authorization Bearer Token required

### Orders

#### `GET /api/orders`
Get all orders
- Headers: Authorization Bearer Token required

#### `GET /api/orders/:id`
Get order by ID
- Headers: Authorization Bearer Token required

#### `POST /api/orders`
Create new order
- Headers: Authorization Bearer Token required
- Body:
  ```json
  {
    "restaurantId": "restaurant-uuid",
    "items": [
      {
        "menuItemId": "menu-item-uuid",
        "quantity": 2,
        "addons": []
      }
    ],
    "paymentType": "ONLINE",
    "customerNotes": "Delivery instructions",
    "distance": 5.2
  }
  ```

#### `PATCH /api/orders/:id/status`
Update order status
- Headers: Authorization Bearer Token required
- Body:
  ```json
  {
    "status": "preparing" // preparing/ready/dispatch/delivered/cancelled/rejected
  }
  ```

#### `GET /api/orders/customer/:customerId`
Get customer's orders
- Headers: Authorization Bearer Token required

#### `GET /api/orders/restaurant/:restaurantId`
Get restaurant's orders
- Headers: Authorization Bearer Token required

#### `GET /api/orders/delivery-partner/:dpId`
Get delivery partner's orders
- Headers: Authorization Bearer Token required

### Delivery Partners

#### `GET /api/delivery-partners`
Get all delivery partners
- Headers: Authorization Bearer Token required

#### `GET /api/delivery-partners/:id`
Get delivery partner by ID
- Headers: Authorization Bearer Token required

#### `POST /api/delivery-partners`
Register new delivery partner
- Body:
  ```json
  {
    "mobile": "1234567890",
    "name": "Partner Name",
    "gender": "male",
    "dateOfBirth": "1990-01-01",
    "vehicleType": "bike",
    "homeAddress": "Address"
  }
  ```

#### `PATCH /api/delivery-partners/:id/status`
Update delivery partner status
- Headers: Authorization Bearer Token required
- Body:
  ```json
  {
    "status": "approved" // approved/pending/rejected/suspended
  }
  ```

#### `PATCH /api/delivery-partners/:id/location`
Update delivery partner live location
- Headers: Authorization Bearer Token required
- Body:
  ```json
  {
    "latitude": 23.0225,
    "longitude": 72.5714
  }
  ```

### Reviews

#### `GET /api/reviews`
Get all reviews
- Headers: Authorization Bearer Token required

#### `POST /api/reviews`
Create new review
- Headers: Authorization Bearer Token required
- Body:
  ```json
  {
    "orderId": "order-uuid",
    "reviewText": "Great food and service!"
  }
  ```

#### `PUT /api/reviews/:id`
Update review
- Headers: Authorization Bearer Token required
- Body:
  ```json
  {
    "reviewText": "Updated review text"
  }
  ```

#### `DELETE /api/reviews/:id`
Delete review
- Headers: Authorization Bearer Token required

## Authentication

The API uses JWT-based authentication. For protected endpoints:
1. Get the access token from login/register response
2. Add it to the request header:
   ```
   Authorization: Bearer your-access-token
   ```

## Error Responses

All endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (only in development)"
}
```

## Success Responses

All endpoints return success responses in the following format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {} // Response data
}
```
