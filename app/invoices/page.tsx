'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { invoiceAPI } from '@/lib/api';
import { InvoiceListItem } from '@/types/invoice';
import { useState } from 'react';
import { toast } from 'sonner';
import { Search, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InvoicesPage() {
  const router = useRouter();
  const [vendorName, setVendorName] = useState('');
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'vendor'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchingInvoiceId, setFetchingInvoiceId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const handleViewInvoice = async (invoiceId: string) => {
    setFetchingInvoiceId(invoiceId);
    try {
      const data = await invoiceAPI.getInvoice(invoiceId);
      // Store in sessionStorage for quick access
      sessionStorage.setItem(`invoice_${invoiceId}`, JSON.stringify(data));
      router.push(`/invoice/${invoiceId}`);
    } catch (err: any) {
      toast.error('Failed to load invoice details');
      setFetchingInvoiceId(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      toast.error('Please enter a vendor name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await invoiceAPI.getInvoicesByVendor(vendorName.trim());
      setInvoices(response.invoices || []);
      setHasSearched(true);
      setCurrentPage(1);
      if ((response.invoices || []).length === 0) {
        toast.info('No invoices found for this vendor');
      } else {
        toast.success(`Found ${(response.invoices || []).length} invoice(s)`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch invoices');
      setInvoices([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return (b.InvoiceTotal || 0) - (a.InvoiceTotal || 0);
      case 'vendor':
        return (a.VendorName || '').localeCompare(b.VendorName || '');
      case 'date':
      default:
        return new Date(b.InvoiceDate || 0).getTime() - new Date(a.InvoiceDate || 0).getTime();
    }
  });

  const paginatedInvoices = sortedInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Invoices</h1>
            <p className="text-slate-600">Search and browse invoices by vendor name</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="vendor" className="block text-sm font-medium text-slate-700 mb-2">
                  Vendor Name
                </label>
                <input
                  id="vendor"
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Enter vendor name (e.g., Acme Corp)"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Results Section */}
          {hasSearched && (
            <>
              {invoices.length > 0 ? (
                <>
                  {/* Sort Controls */}
                  <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Showing {paginatedInvoices.length} of {sortedInvoices.length} invoice(s)
                    </div>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="sortBy" className="text-sm font-medium text-slate-700">
                        Sort by:
                      </label>
                      <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value as 'date' | 'amount' | 'vendor');
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="date">Date (Newest)</option>
                        <option value="amount">Amount (Highest)</option>
                        <option value="vendor">Vendor Name</option>
                      </select>
                    </div>
                  </div>

                  {/* Table View */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Invoice ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Shipping Address</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {paginatedInvoices.map((invoice) => (
                            <tr key={invoice.InvoiceId} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-blue-600">{invoice.InvoiceId}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {invoice.InvoiceDate ? new Date(invoice.InvoiceDate).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-900">
                                {invoice.ShippingAddress || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                {typeof invoice.InvoiceTotal === 'number' ? `$${invoice.InvoiceTotal.toFixed(2)}` : '—'}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => handleViewInvoice(invoice.InvoiceId)}
                                  disabled={fetchingInvoiceId === invoice.InvoiceId}
                                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {fetchingInvoiceId === invoice.InvoiceId ? (
                                    <Loader size={16} className="animate-spin" />
                                  ) : (
                                    <>
                                      <span>View</span>
                                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Invoices Found</h3>
                  <p className="text-slate-600">
                    No invoices were found for vendor "<strong>{vendorName}</strong>". Try searching with a different vendor name.
                  </p>
                </div>
              )}
            </>
          )}

          {!hasSearched && (
            <div className="bg-blue-50 rounded-lg shadow-md p-8 text-center border border-blue-200">
              <Search size={48} className="mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Search for Invoices</h3>
              <p className="text-blue-800">Enter a vendor name above to search for invoices in the system.</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
