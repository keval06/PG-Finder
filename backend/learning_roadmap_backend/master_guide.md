# Level 0: Master Guide — Backend Architecture

Welcome to the PG Finder Backend Learning Roadmap! This master guide provides a "Big Picture" overview of how the server is structured using Node.js, Express.js, and MongoDB (via Mongoose).

## 🏗️ Core Architecture: RESTful Express.js

The backend follows a strict **Controller-Service-Route** pattern, ensuring that data is valid and secure before reaching the database.

### 1. Key Concepts
- **RESTful API**: We use standard HTTP methods (GET, POST, PUT, DELETE) to manage resources like PGs and Bookings.
- **Middleware**: Functions that run "between" the request and the controller (e.g., Auth checks, error handling, image uploading).
- **Stateless Authentication**: We use **JWT (JSON Web Tokens)** instead of sessions. This allows our server to scale and handle thousands of users effortlessly.
- **ACID Transactions**: For critical operations like Booking, we use **MongoDB Sessions** to ensure multiple database updates either all succeed or all fail together.

### 2. Folder Structure (Zero Skips)
- `models/`: Defines your database "Shape" and validation rules using Mongoose Schemas.
- `routes/`: Defines the URL endpoints (e.g., `/api/pg`).
- `controllers/`: The "Heart" of the app. This is where your **Heavy Business Logic**, **Aggregation Pipelines**, and **Transactions** live.
- `middleware/`: Security guards for your routes.
- `db/`: The connection logic for your MongoDB cluster.
- `config/` & `utils/`: External settings (S3/Cloudinary) and helper functions.
- `learning_roadmap_backend/`: This documentation hub.

## 🗺️ Data Consistency Flow
1. **Request Received**: Express catches the request in `server.js`.
2. **Security Check**: `protect.js` middleware verifies the JWT token.
3. **Route Handling**: `routes/*.js` sends the request to the correct controller function.
4. **Business Logic**: The `controller` function applies logic (Filtering, Sorting, Aggregation).
5. **Database Interactivity**: The `model` communicates with MongoDB to save or retrieve data.
6. **Response**: Data is sent back to the frontend in a standardized JSON format.

---

## 🔗 Learning Path
1. **[Level 1: Models & Schemas](01_models_schemas.md)** - Start here to learn how your data is designed.
2. **[Level 2: Middleware & Security](02_middleware_security.md)** - Learn how the server protects your data.
3. **[Level 3: Identity & Auth Logic](03_auth_user_logic.md)** - Learn the Login/Signup logic.
4. **[Level 4: Resource CRUD](04_resource_crud.md)** - Learn how PGs and RoomTypes are managed.
5. **[Level 5: Query Filtering](05_query_filtering.md)** - Learn the dynamic search builder.
6. **[Level 6: Aggregations & Geospatial](06_aggregations_geospatial.md)** - The most advanced database logic.
7. **[Level 7: Booking Lifecycle](07_booking_lifecycle.md)** - Transactions and state management.
8. **[Level 8: Maintenance & Migrations](08_maintenance_migrations.md)** - System scripts and data safety.