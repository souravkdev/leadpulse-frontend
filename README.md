# LeadPulse Frontend

Lead management system frontend built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: Zustand
- **HTTP Client**: Custom API utility

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/                    # Next.js App Router pages
  (auth)/              # Authentication routes
  (dashboard)/         # Protected dashboard routes
components/            # React components
  auth/                # Authentication components
  layout/              # Layout components (Header, Sidebar)
  leads/               # Lead management components
  ui/                  # Reusable UI components
  users/               # User management components
hooks/                  # Custom React hooks
lib/                    # Utility functions
stores/                 # Zustand stores
types/                  # TypeScript type definitions
```

## Features

- User authentication (login/logout)
- Lead management (CRUD operations)
- Activity tracking
- User management
- Pipeline visualization
- Analytics dashboard

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Building for Production

```bash
npm run build
npm start
```
