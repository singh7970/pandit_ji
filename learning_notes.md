# 📝 Vidhi Vidhan: Comprehensive Technical Learning Notes & Interview Guide

This guide is placed directly in your repository to help you understand the architectural patterns, database choices, and backend protocols used in the **Vidhi Vidhan** application. Use this side-by-side during your development and interview practice.

---

## 🗄️ 1. PostgreSQL (The Relational Database)

### What is PostgreSQL?
PostgreSQL (often called Postgres) is an advanced, open-source **Relational Database Management System (RDBMS)**. It organizes data into structured tables consisting of rows and columns, using SQL (Structured Query Language) to query and manipulate data.

### Why do we use it in Vidhi Vidhan?
Our application handles complex relational data. For example:
* A **User** has many **Bookings**.
* A **Booking** links a specific **User**, a **Pandit**, a **Puja**, and an **Address**.
* A **Pandit** has a **PanditProfile** containing skills, languages, and verification documents.

Postgres is the perfect choice for this because of the following reasons:

#### 1. ACID Compliance (Data Integrity)
ACID stands for **Atomicity, Consistency, Isolation, Durability**. It guarantees that database transactions are processed reliably:
* **Atomicity (All-or-Nothing)**: When a booking is paid, we must create a booking record AND record a transaction. If one fails, the entire transaction rolls back. Your database will never end up in a corrupt half-saved state.
* **Consistency**: Ensures data meets all validation rules (e.g., you cannot create a booking for a Puja ID that does not exist).
* **Isolation**: Multiple bookings occurring at the same time do not interfere with each other.
* **Durability**: Once a transaction is completed, it is permanently written to disk (safe even if the server crashes).

#### 2. Relational Constraints & Foreign Keys
We use **Foreign Keys** to link tables. For example:
```sql
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id);
```
This guarantees referential integrity. The database will throw an error if someone tries to delete a user while they still have active bookings, preventing orphaned rows.

#### 3. Indexing for Query Performance
As the app grows to thousands of bookings, running `SELECT * FROM bookings WHERE pandit_id = 5` becomes slow. We create **Indexes** on columns frequently used in filters (`WHERE`) or joins (`JOIN`).
* **Under the Hood**: Postgres builds a B-Tree structure for index columns, reducing search complexity from $O(N)$ (scanning the whole table) to $O(\log N)$ (binary tree search).

---

## ⚡ 2. Redis (The In-Memory Cache)

### What is Redis?
Redis stands for **Remote Dictionary Server**. Unlike Postgres, which writes data to hard drives (SSD/HDD), Redis is an **in-memory database**. It stores everything in RAM, which allows it to process read and write operations at ultra-low latencies (typically under 1 millisecond).

### Why do we use it in Vidhi Vidhan?
Since RAM is volatile (erases when power is lost) and expensive, we do not store persistent business data (like bookings) in Redis. Instead, we use it for high-speed, temporary storage:

#### 1. Stateless JWT Token Blacklisting (Security)
* **The Problem**: JWT (JSON Web Tokens) are stateless. Once signed by the backend, they are valid until their expiration date. If a user logs out, their token is still technically valid!
* **The Redis Solution**: 
  1. When a user clicks **Logout**, the mobile app sends the JWT to the backend.
  2. The backend extracts the token's unique signature and saves it into Redis.
  3. We set a **TTL (Time-To-Live)** on the Redis key equal to the remaining lifespan of the JWT.
  4. For every incoming API request, our auth middleware checks:
     `redis.exists(jwt_token_signature)`
  5. If it exists in Redis, the request is blocked (`401 Unauthorized`).
  6. Once the token naturally expires, Redis automatically deletes the key to free up RAM.

#### 2. High-Performance Session Cache
Reading user session data from Postgres on every single API request adds database load. By caching hot data (like the current user's profile details) in Redis, we serve requests instantly.

---

## 🔥 3. Firebase (BaaS & Realtime Tracking)

We use Firebase for features that are difficult or expensive to run on a standard SQL server.

### A. Realtime Database (GPS Tracking) vs. Firestore (NoSQL Document Store)
Firebase offers two NoSQL databases. We explicitly chose the **Realtime Database** for GPS tracking:
* **The Use Case**: While a pandit is traveling to a puja, their mobile app pushes their latitude and longitude coordinates to the database every 10 seconds.
* **Why not Postgres?** High-frequency writes (every 10s per active pandit) would bottleneck a relational database write queue.
* **Why not Firestore?** Firestore is billed based on individual document read, write, and delete operations. High-frequency coordinates would cost a fortune.
* **Why Realtime Database?** It operates as a single massive JSON tree. It connects clients via **WebSockets** (persistent duplex connection). Pushing coordinates and streaming them to the customer map is fast, lightweight, and billed on bandwidth (GB) rather than operation count.

### B. Firebase Cloud Messaging (FCM)
* **What it is**: A cross-platform notification engine.
* **The Architecture**:
  1. Mobile app requests a device token from Apple/Google APNs.
  2. Mobile app registers this token in our Postgres database.
  3. When an event occurs (e.g., booking confirmed), our FastAPI backend sends a payload to FCM using the `firebase-admin` SDK.
  4. FCM delivers the push notification directly to the user's OS notification manager.

---

## 🐍 4. FastAPI & Uvicorn (The Backend Engine)

### What are they?
* **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python, based on standard Python type hints.
* **Uvicorn**: An **ASGI (Asynchronous Server Gateway Interface)** web server implementation for Python.

### Why do we use them?
1. **Asynchronous (Async/Await) Support**: 
   Standard Python frameworks (like Django or Flask) are WSGI (synchronous). Each request blocks a thread. FastAPI is ASGI-native. While waiting for PostgreSQL or Firebase to respond, Uvicorn pauses the current function and processes other requests on the same event loop. This allows the backend to handle thousands of concurrent requests with low resource usage.
2. **Automatic OpenAPI/Swagger Documentation**:
   FastAPI automatically parses inputs using **Pydantic** validation models and exposes interactive API documentation out-of-the-box (accessible at `/docs`).

---

## 🛠️ 5. Troubleshooting: InvalidSchemaName (PostgreSQL)

### The Problem
During deployment on Render, the backend server crashed during startup with the following error:
```
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.InvalidSchemaName) no schema has been selected to create in
LINE 2: CREATE TABLE users ( ...
```

### Why it happened
1. Our database connection string configured the SQLAlchemy engine with a custom search path:
   `connect_args={"options": "-c search_path=app_schema"}`.
2. In PostgreSQL, a database contains **schemas** (logical namespaces/containers for tables). By default, only the `public` schema exists.
3. Because the newly provisioned PostgreSQL instance on Render did not have `app_schema` created yet, the database engine set the search path to a non-existent folder. 
4. When `Base.metadata.create_all(bind=engine)` was called on startup, PostgreSQL did not know where to create the tables and failed.

### The Solution (Programmatic Pre-verification)
Instead of forcing the user to run SQL statements manually in a database console before deploying, we automated this inside the database initialization lifecycle ([database.py](file:///media/priyanshu-singh/B/2026/pandit_ji/backend/app/core/database.py)):
1. We create a temporary, raw connection engine *without* specifying the custom search path:
   `temp_engine = create_engine(settings.DATABASE_URL)`
2. We run an idempotent DDL query to build the schema:
   `CREATE SCHEMA IF NOT EXISTS app_schema`
3. We dispose of the temporary engine, and safely initialize our main SQLAlchemy connection pool which now connects to the existing schema successfully.

> [!NOTE]
> **Interview Concepts:**
> * **Idempotency**: An operation is *idempotent* if running it multiple times yields the same result without causing errors. `CREATE SCHEMA IF NOT EXISTS` is idempotent.
> * **Search Path**: A parameter in Postgres defining the order in which schemas are searched when a query references a table name without its schema prefix.

