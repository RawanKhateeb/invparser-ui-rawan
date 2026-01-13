'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';
import { FileText, Upload, Search, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Welcome to Invoice Parser. Manage and extract invoices efficiently.</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Invoices"
              value="—"
              description="Connect to backend"
              icon={<FileText size={24} className="text-blue-600" />}
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Processed"
              value="—"
              description="Real-time updates"
              icon={<TrendingUp size={24} className="text-green-600" />}
              bgColor="bg-green-50"
            />
            <StatCard
              title="Pending"
              value="—"
              description="Awaiting extraction"
              icon={<Upload size={24} className="text-amber-600" />}
              bgColor="bg-amber-50"
            />
            <StatCard
              title="Recent Uploads"
              value="—"
              description="Last 30 days"
              icon={<Search size={24} className="text-purple-600" />}
              bgColor="bg-purple-50"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionButton
                href="/upload"
                title="Upload Invoice"
                description="Upload a new invoice document"
                icon={<Upload size={20} />}
              />
              <ActionButton
                href="/invoices"
                title="Search Invoices"
                description="Find invoices by vendor name"
                icon={<Search size={20} />}
              />
              <ActionButton
                href="/invoices"
                title="View All Invoices"
                description="Browse recent invoice extractions"
                icon={<FileText size={20} />}
              />
            </div>
          </div>

          {/* Information Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md p-8 border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-4">About Invoice Parser</h2>
            <ol className="text-blue-800 space-y-2 list-decimal list-inside">
              <li>Modern frontend for intelligent invoice extraction</li>
              <li>Upload PDF invoice documents</li>
              <li>Automatically extract vendor details</li>
              <li>Extract amounts, dates, and line items</li>
            </ol>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  bgColor,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow">
      <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

function ActionButton({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <div className="p-6 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-200 transition-colors text-slate-600 group-hover:text-blue-600">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">{title}</h3>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
