# Kventro Backend

Production-ready Node.js, Express, and MongoDB Atlas backend for the Kventro Flutter app.

## Frontend Analysis

The Flutter app currently uses:

- Provider and `ChangeNotifier` for state management.
- Firebase phone authentication in `AuthViewModel`.
- One HTTP integration point: `lib/core/services/api_service.dart`.
- Screens:
  - Home: loads featured packages from `GET /packages`.
  - Event details: loads event types and posts selected event details.
  - Vibe selection: loads vibe packages and posts selected package estimate.
  - Package customization: currently local state, now supported by backend through customization options.
  - Review and pay: currently static UI, now supported by bookings API.
- No image picker or upload UI detected.
- No chat or realtime client detected.

## Architecture

```text
backend/
 ├── config/          MongoDB and Cloudinary config
 ├── controllers/     HTTP request handlers
 ├── middleware/      auth, validation, uploads, error handling
 ├── models/          Mongoose schemas
 ├── routes/          REST route modules
 ├── scripts/         MongoDB Atlas seed script
 ├── services/        business/data access logic
 ├── socket/          optional Socket.io extension point
 ├── uploads/         local upload temp directory
 ├── utils/           shared helpers
 ├── validators/      express-validator rules
 ├── app.js
 ├── server.js
 ├── package.json
 └── .env.example
```

## Setup

Install dependencies:

```powershell
cd C:\Users\91954\AndroidStudioProject\kventro\backend
npm install
```

Create `.env` from `.env.example` and set MongoDB Atlas:

```text
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kventro
JWT_SECRET=replace_with_a_long_random_access_token_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_refresh_token_secret
```

Seed required app catalog data into MongoDB Atlas:

```powershell
npm run seed
```

Start development server:

```powershell
npm run dev
```

Start production server:

```powershell
npm start
```

## API Base URL

```text
http://localhost:3000/api
```

The app's `ApiService` already points to:

```dart
http://localhost:3000/api
```

For Android emulator, run Flutter with:

```powershell
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

For a physical phone, use your computer LAN IP:

```powershell
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3000/api
```

## Routes

### Health

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | API and MongoDB status |

### Auth

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register with phone/email and password |
| POST | `/api/auth/login` | Login and receive access/refresh tokens |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/me` | Current user |

### Catalog

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/services` | Services for home/category UI |
| GET | `/api/packages` | Featured home packages |
| GET | `/api/event-types` | Event type grid |
| GET | `/api/vibe-packages` | Step 3 vibe packages |
| GET | `/api/customization-options` | Cakes, food categories, decor, and add-ons |

### Planning

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/event-details` | Save event details from step 2 |
| GET | `/api/event-details` | List saved event details |
| POST | `/api/vibe-selection` | Save selected vibe package |
| GET | `/api/vibe-selections` | List saved vibe selections |
| POST | `/api/bookings` | Create final booking |
| GET | `/api/bookings` | List bookings |

## Important Notes

- All APIs read/write MongoDB Atlas through Mongoose.
- No JSON-file storage or local mock database is used.
- Socket.io is installed but disabled by default because the Flutter app has no realtime feature yet.
- Multer middleware is present, but no upload API is exposed because the Flutter app has no upload flow yet.
- Existing Firebase OTP auth can continue on the frontend. JWT auth endpoints are ready when you want to move login fully to this backend.
