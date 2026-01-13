'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { invoiceAPI } from '@/lib/api';
import { InvoiceApiResponse } from '@/types/invoice';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Download, Loader, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const invoiceId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [invoice, setInvoice] = useState<InvoiceApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setError('Invoice ID not found');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // First, try to get from sessionStorage (passed from list page)
        const cachedData = sessionStorage.getItem(`invoice_${invoiceId}`);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setInvoice(parsedData);
          setError(null);
          setIsLoading(false);
          return;
        }

        // If not cached, try to fetch from API
        const data = await invoiceAPI.getInvoice(invoiceId);
        setInvoice(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load invoice');
        toast.error('Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleEditChange = (field: string, value: any) => {
    setEditData({
      ...editData,
      [field]: value,
    });
  };

  const handleSaveChanges = () => {
    // This is UI-only for demonstration
    setInvoice(editData as Invoice);
    setEditMode(false);
    toast.success('Changes saved locally (demo mode)');
  };

  const handleCancel = () => {
    setEditData(invoice || {});
    setEditMode(false);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <Loader size={48} className="mx-auto text-blue-600 mb-4 animate-spin" />
            <p className="text-slate-600">Loading invoice...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !invoice) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/invoices"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold mb-6 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Invoices</span>
            </Link>

            <div className="bg-white rounded-lg shadow-md p-12 text-center border-l-4 border-red-500">
              <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Invoice Not Found</h3>
              <p className="text-slate-600 mb-6">{error || 'The requested invoice could not be found.'}</p>
              <Link
                href="/invoices"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Back to Invoices
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/invoices"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Invoices</span>
          </Link>

          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-600">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Invoice {invoice.InvoiceId}</h1>
                <p className="text-slate-600">Invoice Details</p>
              </div>
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">
                <Download size={18} />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Invoice Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Invoice Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Invoice ID</label>
                    <p className="text-slate-900 font-semibold">{invoice.InvoiceId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Invoice Date</label>
                    <p className="text-slate-900 font-semibold">
                      {invoice.InvoiceDate ? new Date(invoice.InvoiceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Vendor Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Vendor Name</label>
                    <p className="text-slate-900 font-semibold">{invoice.VendorName || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Shipping Address</label>
                    <p className="text-slate-900">{invoice.ShippingAddress || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Billing Address</label>
                    <p className="text-slate-900">{invoice.BillingAddressRecipient || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              {invoice.Items && invoice.Items.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Line Items</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Item Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Unit Price</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {invoice.Items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm text-slate-900 font-medium">{item.Name || '—'}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{item.Description || '—'}</td>
                            <td className="px-4 py-3 text-sm text-right text-slate-900">{item.Quantity || '0'}</td>
                            <td className="px-4 py-3 text-sm text-right text-slate-900">${(item.UnitPrice || 0)?.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">${(item.Amount || 0)?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Summary</h2>
                <div className="space-y-4">
                  {invoice.SubTotal !== null && (
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-sm text-slate-600">Subtotal</span>
                      <span className="font-semibold text-slate-900">${(invoice.SubTotal || 0)?.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.ShippingCost > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-sm text-slate-600">Shipping Cost</span>
                      <span className="font-semibold text-slate-900">${(invoice.ShippingCost || 0)?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${(invoice.InvoiceTotal || 0)?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
