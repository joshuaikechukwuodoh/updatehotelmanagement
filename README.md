This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

---

# API Documentation

## Authentication (`/api/auth`)

| Method | Endpoint                    | Description                  | Request Body                       | Response            |
| :----- | :-------------------------- | :--------------------------- | :--------------------------------- | :------------------ |
| `POST` | `/api/auth/sign-up`         | Create a new user account    | `{ name, email, password }`        | `{ message, user }` |
| `POST` | `/api/auth/sign-in`         | Sign in an existing user     | `{ email, password }`              | `{ message, user }` |
| `POST` | `/api/auth/sign-out`        | Sign out the current user    | -                                  | `{ message, user }` |
| `POST` | `/api/auth/forget-password` | Request password reset email | `{ email }`                        | `{ message, user }` |
| `POST` | `/api/auth/reset-password`  | Reset password               | `{ currentPassword, newPassword }` | `{ message, user }` |

## Core Resources

### Rooms (`/api/rooms`)

| Method | Endpoint          | Description                    | Request Body                              | Response |
| :----- | :---------------- | :----------------------------- | :---------------------------------------- | :------- |
| `GET`  | `/api/rooms`      | List all rooms                 | -                                         | `[Room]` |
| `POST` | `/api/rooms`      | Create a new room (Admin only) | `{ number, floor, room_type_id, status }` | `Room`   |
| `GET`  | `/api/rooms/[id]` | Get room details               | -                                         | `Room`   |
| `PUT`  | `/api/rooms/[id]` | Update room (Admin only)       | `{ number, floor, status, room_type_id }` | `Room`   |

### Room Types (`/api/room-types`)

| Method | Endpoint               | Description                   | Request Body                          | Response     |
| :----- | :--------------------- | :---------------------------- | :------------------------------------ | :----------- |
| `GET`  | `/api/room-types`      | List all room types           | -                                     | `[RoomType]` |
| `POST` | `/api/room-types`      | Create room type (Admin only) | `{ name, maxGuests, basePriceCents }` | `RoomType`   |
| `GET`  | `/api/room-types/[id]` | Get room type details         | -                                     | `RoomType`   |
| `PUT`  | `/api/room-types/[id]` | Update room type              | `{ name, maxGuests, basePriceCents }` | `RoomType`   |

### Availability (`/api/availability`)

| Method | Endpoint            | Description             | Query Params                     | Response                   |
| :----- | :------------------ | :---------------------- | :------------------------------- | :------------------------- |
| `GET`  | `/api/availability` | Check room availability | `?from=YYYY-MM-DD&to=YYYY-MM-DD` | `[Room]` (Available rooms) |

## Bookings & Reservations

### Bookings (`/api/bookings`)

| Method | Endpoint                       | Description                       | Request Body                                         | Response               |
| :----- | :----------------------------- | :-------------------------------- | :--------------------------------------------------- | :--------------------- |
| `GET`  | `/api/bookings`                | List all bookings                 | -                                                    | `[Booking]`            |
| `POST` | `/api/bookings`                | Create booking (Admin only)       | `{ guest_id, room_id, check_in, check_out, status }` | `Booking`              |
| `POST` | `/api/bookings/[id]/check-in`  | Check-in guest (Admin/Reception)  | -                                                    | `{ message, booking }` |
| `POST` | `/api/bookings/[id]/check-out` | Check-out guest (Admin/Reception) | -                                                    | `{ message, booking }` |
| `POST` | `/api/bookings/[id]/cancel`    | Cancel booking (Admin/Reception)  | -                                                    | `{ message, booking }` |

## Guests & Housekeeping

### Guests (`/api/guests`)

| Method  | Endpoint           | Description                    | Request Body                      | Response  |
| :------ | :----------------- | :----------------------------- | :-------------------------------- | :-------- |
| `GET`   | `/api/guests`      | List all guests                | -                                 | `[Guest]` |
| `POST`  | `/api/guests`      | Create guest (Admin/Reception) | `{ name, email, phone, address }` | `Guest`   |
| `GET`   | `/api/guests/[id]` | Get guest details              | -                                 | `Guest`   |
| `PATCH` | `/api/guests/[id]` | Update guest (Admin/Reception) | `{ name, email, phone, address }` | `Guest`   |

### Housekeeping (`/api/housekeeping/tasks`)

| Method | Endpoint                       | Description                   | Request Body         | Response |
| :----- | :----------------------------- | :---------------------------- | :------------------- | :------- |
| `GET`  | `/api/housekeeping/tasks`      | List all tasks                | -                    | `[Task]` |
| `POST` | `/api/housekeeping/tasks`      | Create task (Admin/Reception) | `{ room_id, notes }` | `Task`   |
| `GET`  | `/api/housekeeping/tasks/[id]` | Get task details              | -                    | `Task`   |
| `PUT`  | `/api/housekeeping/tasks/[id]` | Update task (Housekeeping)    | `{ notes, status }`  | `Task`   |

## Payments & KYC

### Payments (`/api/payments`)

| Method | Endpoint                   | Description                 | Request Body              | Response                           |
| :----- | :------------------------- | :-------------------------- | :------------------------ | :--------------------------------- |
| `POST` | `/api/payments/initialize` | Initialize Paystack payment | `{ bookingId }`           | `{ authorization_url, reference }` |
| `GET`  | `/api/payments/verify`     | Verify payment status       | `?reference=PAYSTACK_REF` | `{ success: boolean }`             |
| `POST` | `/api/payments/webhook`    | Paystack Webhook Handler    | (Paystack Payload)        | `{ success: true }`                |

### KYC (`/api/kyc`)

| Method  | Endpoint                | Description             | Request Body                           | Response    |
| :------ | :---------------------- | :---------------------- | :------------------------------------- | :---------- |
| `POST`  | `/api/kyc`              | Submit KYC document     | `{ documentType, documentUrl }`        | `KYCRecord` |
| `PATCH` | `/api/kyc/reviews/[id]` | Review KYC (Admin only) | `{ status: "APPROVED" \| "REJECTED" }` | `KYCRecord` |

### Messages (`/api/messages`)

| Method | Endpoint        | Description               | Request Body              | Response  |
| :----- | :-------------- | :------------------------ | :------------------------ | :-------- |
| `POST` | `/api/messages` | Send message (Admin only) | `{ receiverId, content }` | `Message` |
