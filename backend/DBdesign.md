User.js
```javascript
{
  name: String,
  mobile: Number,
  password: String,
}```

API-> 
POST /api/auth/register


POST /api/auth/login


```javascript

pg schema
{
    ownerId: ObjectId,
    title: String,
    city: String,
    langitude: Number,
    latitude: Number,
    pincode: Number,
    address: String,
    rent: Number,
    amenities: [String],
    roomsAvailable: Number,
    description: String,
    images: [String],
  }

APIs
Add PG (Owner Only)
POST /api/pgs

Get All PGs
GET /api/pgs

Search by City
GET /api/pgs?city=Ahmedabad

Get Single PG
GET /api/pgs/:id

Update PG (Owner Only)
PUT /api/pgs/:id

Delete PG
DELETE /api/pgs/:id

booking 
{
  studentId: ObjectId,
  pgId: ObjectId,
  status: "Pending" | "Approved" | "Rejected"
}

Create Booking Request
POST /api/bookingsGet

Student Bookings
GET /api/bookings/student

Get Owner Booking Requests
GET /api/bookings/owner

Update Booking Status
PUT /api/bookings/:id

```javasceipt```

Review.js
{
  studentId: ObjectId,
  pgId: ObjectId,
  rating: Number,
  comment: String
}

Add Review
POST /api/reviews

Get Reviews for PG
GET /api/reviews/:pgId

13/02/26
  1. updateUser check
  2. updatePG
  3. 

14/02/26
  1. authRoute
  2. auth Controller, jwt sign, jwt verify
  3. middleware/ protect.js

[
  { "name": "Rahul", 
  "mobile": "9000000001", 
  "password": "password123" },
  { "name": "Amit", 
  "mobile": "9000000002", 
  "password": "password123" },
  { "name": "Sneha", 
  "mobile": "9000000003", 
  "password": "password123" },
  { "name": "Priya", 
  "mobile": "9000000004", 
  "password": "password123" },
  { "name": "Karan", 
  "mobile": "9000000005", 
  "password": "password123" },
  { "name": "Neha", 
  "mobile": "9000000006", 
  "password": "password123" },
  { "name": "Arjun", 
  "mobile": "9000000007", 
  "password": "password123" },
  { "name": "Ritika", 
  "mobile": "9000000008", 
  "password": "password123" },
  { "name": "Vikas", 
  "mobile": "9000000009", 
  "password": "password123" },
  { "name": "Meera", 
  "mobile": "9000000010", 
  "password": "password123" }
]


{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzMwNTgyOTYsImV4cCI6MTc3MzY2MzA5Nn0.oX0OPdK5h3RW7PvgR0_jpQAqEEAxPOORICkSqJNpPFk"

    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzMwNTgyOTYsImV4cCI6MTc3MzY2MzA5Nn0.oX0OPdK5h3RW7PvgR0_jpQAqEEAxPOORICkSqJNpPFk
}
parth
1234512345
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzMwNjA4MDIsImV4cCI6MTc3MzY2NTYwMn0.K9KS4YFiiFFDfwFb0xTo2132JpbXFAujNJlFCae3vVo"
}

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YWVjMjk0MTVlNTc1YmVmNzMzZjQ5NyIsImlhdCI6MTc3MzA2MTc1NiwiZXhwIjoxNzczNjY2NTU2fQ.-fHB34Ei5AFGVcqtXn4jxj-inSzunKfa9wOVKFyhCH0