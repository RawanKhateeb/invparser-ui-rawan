export interface InvoiceApiResponse {
  InvoiceId: string;
  VendorName: string;
  InvoiceDate: string;
  BillingAddressRecipient: string;
  ShippingAddress: string;
  SubTotal: number | null;
  ShippingCost: number;
  InvoiceTotal: number;
  Items: InvoiceItem[];
  [key: string]: any;
}

export interface InvoiceListItem {
  InvoiceId: string;
  VendorName: string;
  InvoiceDate: string;
  ShippingAddress: string;
  InvoiceTotal: number;
}

export interface InvoiceItem {
  id: string;
  Name: string;
  Description: string;
  Quantity: number;
  UnitPrice: number;
  Amount: number;
}

export interface ConfidenceData {
  InvoiceId: string;
  VendorName: number;
  InvoiceDate: number;
  BillingAddressRecipient: number;
  ShippingAddress: number;
  SubTotal: number;
  ShippingCost: number;
  InvoiceTotal: number;
}

export interface UploadResponse {
  invoiceId: string;
  vendor?: string;
  amount?: number;
  status?: string;
  message?: string;
  [key: string]: any;
}

export interface VendorInvoicesResponse {
  invoices: InvoiceListItem[];
  count: number;
}
