# FixItNow Backend API 🛠️

**FixItNow** is an on-demand technician service booking platform's backend API. It allows customers to book various services across different categories, technicians to manage their profiles and availability, and administrators to oversee the entire platform. It integrates **SSLCommerz** as the payment gateway.

---

## 🚀 Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js (TypeScript)
- **Database ORM:** Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT) & HTTP-Only Cookies
- **Payment Gateway:** SSLCommerz

---

## 🛠️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/nafi0123/FixItNow_Backend.git
cd FixItNow_Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory and add the following variables:

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
PORT=5001
APP_URL=http://localhost:3000

JWT_ACCESS_SECRET="your_jwt_access_secret"
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET="your_jwt_refresh_secret"
JWT_REFRESH_EXPIRES_IN=30d

# SSLCommerz Sandbox Credentials
SSL_STORE_ID="your_store_id"
SSL_STORE_PASSWORD="your_store_password"
SSL_IS_SANDBOX=true

SSL_SUCCESS_URL="http://localhost:5001/api/payments/confirm?status=success"
SSL_FAIL_URL="http://localhost:5001/api/payments/confirm?status=fail"
SSL_CANCEL_URL="http://localhost:5001/api/payments/cancel"
```

### 4. Database Migrations & Client Generation
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Run the Server
**Development Mode:**
```bash
npm run dev
```

**Production Build & Start:**
```bash
npm run build
npm start
```

---

## 🔑 Base URL
- **Local:** `http://localhost:5001`
- **Production (Vercel):** `https://fix-it-now-brown.vercel.app` (or your live link)

---

## 📖 API Reference

> [!NOTE]
> All authenticated routes require the `Authorization` header with the format: `Authorization: Bearer <your_access_token>`.

---

### 1. Authentication API (`/api/auth`)

#### A. User Registration
Registers a new customer, technician, or administrator.
- **Endpoint:** `POST /api/auth/register`
- **Auth:** Public
- **Request Body (JSON):**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "CUSTOMER" // Options: "CUSTOMER", "TECHNICIAN", "ADMIN"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully!",
  "data": {
    "id": "e0b04e6c-c9c0-42ff-89d4-1a9be64cfbd2",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER",
    "isBanned": false,
    "createdAt": "2026-07-07T15:00:00.000Z",
    "updatedAt": "2026-07-07T15:00:00.000Z"
  }
}
```

#### B. User Login
Authenticates user, returns an `accessToken` in the response, and sets a `refreshToken` in a secure HTTP-Only cookie.
- **Endpoint:** `POST /api/auth/login`
- **Auth:** Public
- **Request Body (JSON):**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "e0b04e6c-c9c0-42ff-89d4-1a9be64cfbd2",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "CUSTOMER"
    }
  }
}
```

#### C. Get Profile
Fetches the profile details of the currently logged-in user.
- **Endpoint:** `GET /api/auth/me`
- **Auth:** Bearer Token (CUSTOMER, TECHNICIAN, ADMIN)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile fetched successfully!",
  "data": {
    "id": "e0b04e6c-c9c0-42ff-89d4-1a9be64cfbd2",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER",
    "isBanned": false,
    "createdAt": "2026-07-07T15:00:00.000Z",
    "updatedAt": "2026-07-07T15:00:00.000Z"
  }
}
```

---

### 2. Admin API (`/api/admin`)

#### A. Create Category
Creates a service category (e.g., Plumbing, Electrical Support).
- **Endpoint:** `POST /api/admin/categories`
- **Auth:** Bearer Token (ADMIN)
- **Request Body (JSON):**
```json
{
  "name": "Electrical Support",
  "description": "All kinds of fan, light, and home wiring solutions."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Category created successfully!",
  "data": {
    "id": "7bdfa67b-1188-466d-88b9-8e2b8df1a2ba",
    "name": "Electrical Support",
    "slug": "electrical-support",
    "description": "All kinds of fan, light, and home wiring solutions.",
    "createdAt": "2026-07-07T15:10:00.000Z",
    "updatedAt": "2026-07-07T15:10:00.000Z"
  }
}
```

#### B. Get All Categories (Admin View)
- **Endpoint:** `GET /api/admin/categories`
- **Auth:** Bearer Token (ADMIN)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories fetched successfully!",
  "data": [
    {
      "id": "7bdfa67b-1188-466d-88b9-8e2b8df1a2ba",
      "name": "Electrical Support",
      "slug": "electrical-support",
      "description": "All kinds of fan, light, and home wiring solutions.",
      "createdAt": "2026-07-07T15:10:00.000Z"
    }
  ]
}
```

#### C. Get All Users
Retrieves a list of all registered users.
- **Endpoint:** `GET /api/admin/users`
- **Auth:** Bearer Token (ADMIN)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully!",
  "data": [
    {
      "id": "e0b04e6c-c9c0-42ff-89d4-1a9be64cfbd2",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "CUSTOMER",
      "isBanned": false,
      "createdAt": "2026-07-07T15:00:00.000Z",
      "updatedAt": "2026-07-07T15:00:00.000Z",
      "technicianProfile": null
    }
  ]
}
```

#### D. Ban/Unban User
Bans or unbans a user. Banned users cannot access system services.
- **Endpoint:** `PATCH /api/admin/users/:id`
- **Auth:** Bearer Token (ADMIN)
- **Request Body (JSON):**
```json
{
  "isBanned": true
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User banned successfully!",
  "data": {
    "id": "e0b04e6c-c9c0-42ff-89d4-1a9be64cfbd2",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER",
    "isBanned": true
  }
}
```

---

### 3. Technician API (`/api/technician`)

#### A. Update Profile
Updates the technician's biography, work experience, skills (category IDs), base price, and location.
- **Endpoint:** `PUT /api/technician/profile`
- **Auth:** Bearer Token (TECHNICIAN)
- **Request Body (JSON):**
```json
{
  "bio": "Expert electrician specialized in heavy motor and home wiring solutions.",
  "skills": ["7bdfa67b-1188-466d-88b9-8e2b8df1a2ba"], // Category IDs
  "experience": 5, // in years
  "basePrice": 350.00, // Base rate
  "location": "Dhaka"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technician profile updated successfully!",
  "data": {
    "id": "tech-profile-uuid",
    "userId": "e0b04e6c-c9c0-42ff-89d4-1a9be64cfbd2",
    "bio": "Expert electrician specialized in heavy motor and home wiring solutions.",
    "skills": ["7bdfa67b-1188-466d-88b9-8e2b8df1a2ba"],
    "experience": 5,
    "basePrice": 350.00,
    "location": "Dhaka",
    "rating": 0.0,
    "availability": {}
  }
}
```

#### B. Update Availability
Configures working days and time slots for bookings.
- **Endpoint:** `PUT /api/technician/availability`
- **Auth:** Bearer Token (TECHNICIAN)
- **Request Body (JSON):**
```json
{
  "availability": {
    "days": ["Saturday", "Sunday", "Tuesday"],
    "slots": ["09:00 AM - 12:00 PM", "03:00 PM - 06:00 PM"]
  }
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technician availability updated successfully!",
  "data": {
    "id": "tech-profile-uuid",
    "availability": {
      "days": ["Saturday", "Sunday", "Tuesday"],
      "slots": ["09:00 AM - 12:00 PM", "03:00 PM - 06:00 PM"]
    }
  }
}
```

#### C. Create Service
Allows a technician to create specific services offered under their category.
- **Endpoint:** `POST /api/technician/services`
- **Auth:** Bearer Token (TECHNICIAN)
- **Request Body (JSON):**
```json
{
  "name": "AC Cleaning & Gas Refill",
  "description": "Complete outer and inner net cleaning with gas pressure check.",
  "price": 1200.0,
  "duration": "1.5 hours",
  "categoryId": "7bdfa67b-1188-466d-88b9-8e2b8df1a2ba"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Service created successfully by technician!",
  "data": {
    "id": "service-uuid-4444",
    "name": "AC Cleaning & Gas Refill",
    "description": "Complete outer and inner net cleaning with gas pressure check.",
    "price": 1200.0,
    "duration": "1.5 hours",
    "categoryId": "7bdfa67b-1188-466d-88b9-8e2b8df1a2ba",
    "technicianProfileId": "tech-profile-uuid"
  }
}
```

#### D. Get Bookings
Retrieves all booking requests sent to the logged-in technician.
- **Endpoint:** `GET /api/technician/bookings`
- **Auth:** Bearer Token (TECHNICIAN)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technician's bookings fetched successfully!",
  "data": [
    {
      "id": "booking-uuid-7777",
      "customerId": "cust-user-uuid",
      "technicianProfileId": "tech-profile-uuid",
      "bookingDate": "2026-07-10T00:00:00.000Z",
      "slot": "09:00 AM - 12:00 PM",
      "status": "PENDING",
      "paymentStatus": "UNPAID",
      "customer": {
        "name": "John Customer",
        "email": "john@example.com"
      }
    }
  ]
}
```

#### E. Update Booking Status
Allows a technician to accept, decline, or complete a booking.
- **Endpoint:** `PATCH /api/technician/bookings/:id`
- **Auth:** Bearer Token (TECHNICIAN)
- **Request Body (JSON):**
```json
{
  "status": "ACCEPTED" // Options: "ACCEPTED", "DECLINED", "COMPLETED"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking status updated to ACCEPTED successfully!",
  "data": {
    "id": "booking-uuid-7777",
    "status": "ACCEPTED",
    "paymentStatus": "UNPAID"
  }
}
```

---

### 4. Public API (`/api`)

#### A. Get All Technicians (Search & Filter)
Retrieves profiles of technicians with optional filters.
- **Endpoint:** `GET /api/technicians`
- **Auth:** Public
- **Query Parameters (Optional):**
  - `searchTerm` (Matches technician name or biography)
  - `location` (e.g., Dhaka, Uttara)
  - `rating` (e.g., 4.5)
  - `skills` (Specific Category ID)
- **Example URL:** `/api/technicians?location=Dhaka&rating=4.0`
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technicians fetched successfully!",
  "data": [
    {
      "id": "tech-profile-uuid",
      "bio": "Expert electrician...",
      "skills": ["7bdfa67b-1188-466d-88b9-8e2b8df1a2ba"],
      "experience": 5,
      "basePrice": 350,
      "location": "Dhaka",
      "rating": 4.8,
      "user": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ]
}
```

#### B. Get Single Technician Details
Fetches a single technician's profile, including customer reviews.
- **Endpoint:** `GET /api/technicians/:id`
- **Auth:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technician profile fetched successfully!",
  "data": {
    "id": "tech-profile-uuid",
    "bio": "Expert electrician...",
    "skills": ["7bdfa67b-1188-466d-88b9-8e2b8df1a2ba"],
    "experience": 5,
    "basePrice": 350,
    "location": "Dhaka",
    "rating": 4.8,
    "user": {
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "reviews": [
      {
        "id": "review-uuid-999",
        "rating": 5,
        "comment": "Highly recommended!",
        "createdAt": "2026-07-07T15:20:00.000Z",
        "customer": {
          "name": "John Customer",
          "email": "john@example.com"
        }
      }
    ]
  }
}
```

#### C. Get All Services (Search & Filter)
Retrieves a list of all services with optional search and category filters.
- **Endpoint:** `GET /api/services`
- **Auth:** Public
- **Query Parameters (Optional):**
  - `searchTerm` (Matches service name or description)
  - `categoryId` (Filters by specific category)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Services fetched successfully!",
  "data": [
    {
      "id": "service-uuid-4444",
      "name": "AC Cleaning & Gas Refill",
      "description": "Complete outer and inner net cleaning with gas pressure check.",
      "price": 1200,
      "duration": "1.5 hours",
      "categoryId": "7bdfa67b-1188-466d-88b9-8e2b8df1a2ba",
      "category": {
        "name": "Electrical Support"
      },
      "technicianProfile": {
        "user": {
          "name": "Jane Doe"
        }
      }
    }
  ]
}
```

#### D. Get All Categories
Retrieves all available service categories.
- **Endpoint:** `GET /api/categories`
- **Auth:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories fetched successfully!",
  "data": [
    {
      "id": "7bdfa67b-1188-466d-88b9-8e2b8df1a2ba",
      "name": "Electrical Support",
      "slug": "electrical-support"
    }
  ]
}
```

---

### 5. Booking API (`/api/bookings`)

#### A. Create Booking
Enables a customer to request a booking slot with a specific technician.
- **Endpoint:** `POST /api/bookings`
- **Auth:** Bearer Token (CUSTOMER)
- **Request Body (JSON):**
```json
{
  "technicianProfileId": "tech-profile-uuid",
  "bookingDate": "2026-07-10T10:00:00.000Z", // ISO String
  "slot": "09:00 AM - 12:00 PM"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Appointment booked successfully!",
  "data": {
    "id": "booking-uuid-7777",
    "customerId": "customer-user-uuid",
    "technicianProfileId": "tech-profile-uuid",
    "bookingDate": "2026-07-10T10:00:00.000Z",
    "slot": "09:00 AM - 12:00 PM",
    "status": "PENDING",
    "paymentStatus": "UNPAID",
    "technicianProfile": {
      "user": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  }
}
```

#### B. Get User Bookings
Retrieves the booking history. Customers see their booked appointments, and technicians see requests assigned to them.
- **Endpoint:** `GET /api/bookings`
- **Auth:** Bearer Token (CUSTOMER, TECHNICIAN)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bookings fetched successfully!",
  "data": [
    {
      "id": "booking-uuid-7777",
      "bookingDate": "2026-07-10T10:00:00.000Z",
      "slot": "09:00 AM - 12:00 PM",
      "status": "PENDING",
      "paymentStatus": "UNPAID",
      "customer": {
        "name": "John Customer"
      }
    }
  ]
}
```

#### C. Get Booking Details
Retrieves detailed information about a single booking request.
- **Endpoint:** `GET /api/bookings/:id`
- **Auth:** Bearer Token (CUSTOMER, TECHNICIAN)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking details fetched successfully!",
  "data": {
    "id": "booking-uuid-7777",
    "customerId": "customer-user-uuid",
    "technicianProfileId": "tech-profile-uuid",
    "bookingDate": "2026-07-10T10:00:00.000Z",
    "slot": "09:00 AM - 12:00 PM",
    "status": "PENDING",
    "paymentStatus": "UNPAID",
    "customer": {
      "name": "John Customer",
      "email": "john@example.com"
    },
    "technicianProfile": {
      "id": "tech-profile-uuid",
      "bio": "Expert electrician...",
      "experience": 5,
      "basePrice": 350
    }
  }
}
```

---

### 6. Payment API (`/api/payments`)

#### A. Create Payment Session
If a booking is **ACCEPTED** by the technician, the customer can initialize a payment session. This retrieves the gateway checkout URL from SSLCommerz.
- **Endpoint:** `POST /api/payments/create`
- **Auth:** Bearer Token (CUSTOMER)
- **Request Body (JSON):**
```json
{
  "bookingId": "booking-uuid-7777"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment session created successfully!",
  "data": {
    "paymentUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/api.php?gkey=..."
  }
}
```

#### B. Payment Callbacks
Endpoints invoked by SSLCommerz upon payment verification/status change. Redirects users to an HTML notification screen.
- **Endpoints:**
  - `POST /api/payments/confirm`
  - `GET /api/payments/confirm`
- **Auth:** Public
- **Query Parameters / Body:** Automated transaction payload from SSLCommerz.
- **Response (HTML):**
  - **Success:** Displays a green window indicating `Payment Successful!`.
  - **Failure:** Displays a red window indicating `Payment Failed!`.

#### C. Get Payment History
Retrieves transaction and payment history of the authenticated user.
- **Endpoint:** `GET /api/payments`
- **Auth:** Bearer Token (CUSTOMER, TECHNICIAN, ADMIN)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment history fetched successfully!",
  "data": [
    {
      "id": "payment-uuid-1111",
      "bookingId": "booking-uuid-7777",
      "transactionId": "TXN-171829381-1234",
      "amount": 350,
      "status": "PAID",
      "createdAt": "2026-07-07T15:30:00.000Z",
      "booking": {
        "customer": {
          "name": "John Customer",
          "email": "john@example.com"
        },
        "technicianProfile": {
          "user": {
            "name": "Jane Doe",
            "email": "jane@example.com"
          }
        }
      }
    }
  ]
}
```

#### D. Get Payment Details by Transaction ID
Retrieves details of a specific payment using its transaction ID.
- **Endpoint:** `GET /api/payments/:id`
- **Auth:** Bearer Token (CUSTOMER, TECHNICIAN, ADMIN)
- **Response (200 OK):** (Identical to a single payment history object)

---

### 7. Review API (`/api/reviews`)

#### A. Create Review & Rating
Enables customers to leave feedback and a rating (1 to 5 stars) once a booking is status **COMPLETED**. Submitting a review recalculates the technician's average rating automatically.
- **Endpoint:** `POST /api/reviews`
- **Auth:** Bearer Token (CUSTOMER)
- **Request Body (JSON):**
```json
{
  "technicianProfileId": "tech-profile-uuid",
  "bookingId": "booking-uuid-7777",
  "rating": 4.5,
  "comment": "Work was perfect, on time and very well-mannered."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Review and rating submitted successfully!",
  "data": {
    "id": "review-uuid-999",
    "customerId": "customer-user-uuid",
    "technicianProfileId": "tech-profile-uuid",
    "bookingId": "booking-uuid-7777",
    "rating": 4.5,
    "comment": "Work was perfect, on time and very well-mannered.",
    "createdAt": "2026-07-07T15:40:00.000Z"
  }
}
```

---

## 🔒 Security & Guidelines

- **Access Tokens:** Make sure to supply the access token via the header as `Authorization: Bearer <JWT_Token>` for any authenticated endpoints.
- **Banned Users:** If an administrator bans a user, their access tokens are immediately rejected, blocking them from creating bookings, processing payments, updating profiles, or leaving reviews.
- **SSLCommerz Testing:** To test the payment lifecycle locally, utilize a local tunneling utility (like `ngrok` or `localtunnel`) or deploy it to a staging/production server. Ensure your callback URLs and sandbox store credentials match so that SSLCommerz's status updates can reach the backend.

---
*Thank you! For questions or suggestions, feel free to contact the development team.* 🚀
