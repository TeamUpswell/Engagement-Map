# Next Maps App

This project is a Next.js application that integrates Google Maps with data fetched from a Supabase database. It displays a full-screen map centered on Nigeria, with markers representing data points from the "responses" table.

## Features

- Full-screen Google Map integration using `@react-google-maps/api`.
- Fetches data from Supabase and displays markers with InfoWindows.
- Handles loading and error states gracefully.
- Basic clustering of markers for large datasets.

## Getting Started

### Prerequisites

- Node.js (version 12 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd next-maps-app
   ```

2. Install the dependencies:

   ```
   npm install
   ```

   or

   ```
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
   ```

### Running the Application

To start the development server, run:

```
npm run dev
```

or

```
yarn dev
```

Open your browser and navigate to `http://localhost:3000` to view the application.

### Project Structure

- `pages/index.tsx`: Main entry point for the application.
- `pages/map.tsx`: Contains the Google Map implementation.
- `lib/supabaseClient.ts`: Initializes and exports the Supabase client.
- `components/Map.tsx`: Renders the Google Map and handles markers.
- `components/LoadingState.tsx`: Displays loading messages.
- `types/index.ts`: Type definitions for the application.

### License

This project is licensed under the MIT License. See the LICENSE file for details.