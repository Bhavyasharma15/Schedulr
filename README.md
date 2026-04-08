# SaaS Scheduling Platform

This project includes the frontend (React/Vite with Tailwind CSS) and backend (Node.js/Express) for a SaaS Scheduling Platform.

## Features Built
1. **Frontend Landing Page**: Highly aesthetic UI with a Hero Section, Registration/Payment flow via mock QR, and Platform Access (Login) options.
2. **Backend**: Initialized Express/Node js server ready for API integration.
3. **Database Schema**: Provided a Supabase PostreSQL schema setup.

## Running the Application

### Frontend
1. Navigate to the `frontend` folder: `cd frontend`
2. Install dependencies (already done): `npm install`
3. Run the development server: `npm run dev`

### Backend
1. Navigate to the `backend` folder: `cd backend`
2. Install dependencies (already done): `npm install`
3. Run the server: `node server.js`

### Supabase Initialization
1. Create a Supabase project at [Supabase Website](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard and execute the `supabase_schema.sql` file located in the root directory.
3. Copy the URL and Anon Key into your application environment variables.
