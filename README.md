# Invoice Parser Frontend

A modern, production-quality Next.js frontend application for intelligent invoice extraction and management.

## Features

- **User Authentication**: Simple login system (demo: username `admin`, password `admin`)
- **Invoice Upload**: Drag-and-drop file upload with support for PDF and image formats
- **Invoice Search**: Search invoices by vendor name
- **Invoice Management**: View detailed invoice information with editable fields
- **Enterprise Design**: Modern UI with Oracle-inspired color palette
- **Responsive Layout**: Mobile-friendly design for all device sizes

## Technology Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI & shadcn/ui
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn installed

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Backend API Integration

The application connects to a backend API at `http://localhost:8080` with the following endpoints:

### POST `/extract`
Upload an invoice file for extraction.
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: File upload
- **Response**: Invoice data with `invoiceId`

### GET `/invoice/{invoice_id}`
Retrieve details of a specific invoice.
- **Response**: Invoice object with full details

### GET `/invoices/vendor/{vendor_name}`
Retrieve invoices filtered by vendor name.
- **Response**: Array of invoices matching the vendor

## Project Pages

### `/login`
Dummy login page with credentials (admin/admin)

### `/dashboard`
Overview page with statistics and quick actions

### `/upload`
Drag-and-drop invoice upload interface

### `/invoices`
Search and browse invoices by vendor name

### `/invoice/[id]`
Detailed invoice view with editable fields

## Usage

### Login
1. Navigate to `/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `admin`
3. Click "Sign In"

### Upload Invoice
1. Click "Upload Invoice" in the dashboard or navigation
2. Drag and drop files or click "Browse Files"
3. Supported formats: PDF, JPEG, PNG, GIF, WebP (max 50MB)
4. Click "Upload" or "Upload All"
5. View extracted invoice details by clicking the invoice ID link

### Search Invoices
1. Click "Invoices" in the navigation
2. Enter a vendor name
3. Click "Search"
4. Sort by date, amount, or vendor name
5. Click "View" to see invoice details

### View Invoice Details
1. Navigate to an invoice from the invoices list
2. View all extracted information
3. Click "Edit" to make local changes (demo mode only)
4. Click "Download" for invoice download (if backend supports)

## Configuration

### API Base URL
To change the backend API URL, modify `lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080';
```

## Design System

The application uses a professional color palette:
- **Primary**: Blue
- **Secondary**: Slate
- **Success**: Green
- **Warning**: Yellow
- **Error**: Red

## Troubleshooting

### Backend Connection Issues
- Ensure the backend server is running on `http://localhost:8080`
- Check network connectivity

### Login Issues
- Ensure using correct credentials: `admin`/`admin`
- Check browser localStorage is enabled

---

**Built with Next.js 16+, TypeScript, and Tailwind CSS**

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
