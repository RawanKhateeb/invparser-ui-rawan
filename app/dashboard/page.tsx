'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';
import { FileText, Upload, Search, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [totalInvoices, setTotalInvoices] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalInvoices = async () => {
      try {
        const response = await fetch('http://localhost:8080/invoices', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
          const count = data.count || data.total || data.invoices?.length || 0;
          console.log('Total invoices:', count);
          setTotalInvoices(count);
        } else {
          setTotalInvoices(0);
        }
      } catch (error) {
        console.error('Error fetching total invoices:', error);
        setTotalInvoices(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalInvoices();
  }, []);

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
              value={loading ? "—" : totalInvoices.toString()}
              description={loading ? "Loading..." : "Total in system"}
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
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-lg shadow-md p-8 mb-8 border border-blue-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent mb-6">Quick Actions</h2>
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
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{title}</h3>
      <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">{value}</p>
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
      <div className="p-6 rounded-xl border-2 border-slate-300 hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-400 group-hover:to-indigo-500 transition-all duration-300 text-slate-600 group-hover:text-white">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{title}</h3>
            <p className="text-sm text-slate-600 mt-1 group-hover:text-slate-700">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
