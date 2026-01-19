import axios from 'axios';
import { InvoiceApiResponse, UploadResponse, VendorInvoicesResponse } from '@/types/invoice';

const API_BASE_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const invoiceAPI = {
  // Upload invoice file
  uploadInvoice: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use axios.post directly with minimal config - don't set Content-Type
      const response = await axios.post<UploadResponse>(
        `${API_BASE_URL}/extract`,
        formData,
        {
          headers: {
            // Let browser set Content-Type with boundary automatically
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  // Get invoice details by ID
  getInvoice: async (invoiceId: string): Promise<InvoiceApiResponse> => {
    try {
      const response = await apiClient.get<any>(`/invoice/${invoiceId}`);
      
      // Handle different response structures
      if (response.data.invoice) {
        return {
          ...response.data.invoice,
          Items: response.data.items || response.data.invoice.Items || [],
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invoice:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      throw error;
    }
  },

  // Get invoices by vendor name
  getInvoicesByVendor: async (vendorName: string): Promise<VendorInvoicesResponse> => {
    const response = await apiClient.get<any>(
      `/invoices/vendor/${vendorName}`
    );
    
    // Transform the response to match InvoiceListItem format
    const invoiceList = response.data.invoices?.map((item: any) => ({
      InvoiceId: item.InvoiceId || item.invoice?.InvoiceId,
      VendorName: item.VendorName || item.invoice?.VendorName,
      InvoiceDate: item.InvoiceDate || item.invoice?.InvoiceDate,
      ShippingAddress: item.ShippingAddress || item.invoice?.ShippingAddress,
      InvoiceTotal: item.InvoiceTotal || item.invoice?.InvoiceTotal,
    })) || [];
    
    return {
      invoices: invoiceList,
      count: invoiceList.length,
    };
  },
};
