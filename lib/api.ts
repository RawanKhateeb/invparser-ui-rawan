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

    const response = await apiClient.post<UploadResponse>('/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
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
      InvoiceId: item.invoice.InvoiceId,
      VendorName: item.invoice.VendorName,
      InvoiceDate: item.invoice.InvoiceDate,
      ShippingAddress: item.invoice.ShippingAddress,
      InvoiceTotal: item.invoice.InvoiceTotal,
    })) || [];
    
    return {
      invoices: invoiceList,
      count: invoiceList.length,
    };
  },
};
