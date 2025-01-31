# 🎉 Online Event Management Platform - Backend

The backend for the **Online Event Management Platform** built using the **MERN stack**. It handles **user authentication**, **event creation**, **ticket management**, and **payment integration**. The backend is also integrated with **Razorpay** for secure payments and email notifications.

## 🚀 Live Demo
🔗 [Click here to view the live backend](https://event-management-backend-6ifk.onrender.com)

## 🛠️ Features
- 📝 **Event Creation** – Organizers can create and manage events.
- 🎟️ **Ticket Booking** – Users can browse events and register.
- 💳 **Razorpay Payment** – Secure online payments for event tickets.
- 📩 **Email Notifications** – Confirmation emails sent after registration.
- 📊 **Event Analytics** – Organizers can track ticket sales and attendees.
- 🔐 **User Authentication** – Secure login & registration using JWT.
- 📅 **Schedule Management** – Organizers can create and manage event schedules.
- 📊 **Admin Dashboard** – Admin can manage events, users, and view event reports.

## ⚙️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Token)
- **Payments**: Razorpay
- **Email Notifications**: Nodemailer
- **Deployment**: Render (Backend)

---

## 🔥 API Endpoints

### 📌 Authentication
- `POST /api/v1/auth/register` - Register a new user  
- `POST /api/v1/auth/login` - Login user  
- `GET /api/v1/auth/profile` - Get user details 
- `POST /api/v1/auth/forgotpassword` - Forgot Password
- `POST /api/v1/auth/reset-password/:token` - Reset Password 

### 🎟 Event Management
- `POST /api/v1/event/create` - Create a new event (organizers)
- `GET /api/v1/event` - Get all events  
- `GET /api/v1/event/:id` - Get event details  
- `GET /api/v1/filter` - Search for events

### 💳 Payments & Ticket
- `POST /api/v1/ticket/create` - Create a ticket order 
- `POST /api/v1/ticket/handlePaymentSuccess` - Handle successful payment
- `GET /api/v1/ticket/getTicketbyId/:id` - Get ticket by ID
- `GET /api/v1/ticket/cancel/:id` - Cancel ticket by ID
- `POST /api/v1/ticket/transfer` - Transfer ticket
- `GET /api/v1/ticket/getorgid` - Get organizer ID
- `GET /api/v1/ticket/analytics` - Get ticket analytics

### 📊 Analytics
- `GET /api/v1/ticket/analytics/:eventId` - Event Analytics (organizers, admin)

### 📅 Schedule
- `GET /api/v1/schedule/get/:eventId` - Get schedule by event ID
- `GET /api/v1/schedule` - Get all schedules
- `POST /api/v1/schedule` - Create a schedule (organizers)
- `POST /api/v1/notify` - Notify schedule updates (organizers)

### Admin
- `GET /api/v1/admin/events` - Get all events
- `PUT /api/v1/admin/events/:eventId/status` - Update event status
- `GET /api/v1/admin/reports` - Get event reports
- `POST /api/v1/admin/events` - Handle support inquiries
- `POST /api/v1/admin/support` - Handle support inquiry
- `POST /api/v1/admin/support/get` - Send reply to inquiries (Admin)
- `POST /api/v1/admin/support/reply` - Create a new organizer (Admin)
- `POST /api/v1/admin/create-organizer` - Create a new organizer (Admin)
- `GET /api/v1/admin/getalluser` - Get all users (Admin)

---

## 🛠️ Deployment
- **Frontend**: Deployed on **[Netlify](https://guvi-event-management-project.netlify.app/)**
- **Backend**: Deployed on **[Render](https://event-management-backend-6ifk.onrender.com)**

---

## 👨‍💻 Author
**Harish**  
- 🔗 [LinkedIn](https://www.linkedin.com/in/harishdeveloper/)  
- 🔗 [GitHub](https://github.com/IT-HARISH-R)  
