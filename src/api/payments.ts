/**
 * Provider Payments & Earnings API Service Layer
 * Handles all payments and invoices API calls for providers
 */

import { apiClient } from './index';

// ==================== TYPE DEFINITIONS ====================

export interface EarningsData {
  providerId: number;
  totalEarnings: number;
  totalJobs: number;
  currentBalance: number;
}

export interface InvoiceStripeData {
  id?: string;
  hosted_invoice_url?: string;
  pdf?: string;
}

export interface Invoice {
  id: number;
  jobId: number;
  jobService: string;
  jobCategory: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'received' | 'disputed';
  stripeInvoiceId?: string;
  stripeInvoiceUrl?: string;
  stripePdfUrl?: string;
  createdAt: string;
  markedAt?: string;
  notes?: string;
}

export interface InvoicesSummary {
  total: number;
  pending: number;
  received: number;
  disputed: number;
  totalAmount: number;
}

export interface GetProviderInvoicesResponse {
  summary: InvoicesSummary;
  invoices: Invoice[];
}

export interface JobInvoiceResponse {
  success: boolean;
  message: string;
  invoiceUrl?: string;
  invoiceId?: string;
  alreadyExists?: boolean;
  invoiceNumber?: string;
  pdfUrl?: string;
}

export interface JobDetails {
  id: number;
  service: string;
  status: string;
  price: number;
  completedAt?: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
}

export interface PaymentDetails {
  id: number;
  amount: number;
  status: string;
  method?: string;
  markedAt?: string;
}

export interface InvoiceDetails {
  job: JobDetails;
  customer: CustomerDetails;
  payment: PaymentDetails | null;
  invoice: InvoiceStripeData | null;
}

export interface ResendInvoiceResponse {
  success: boolean;
  message: string;
  sentAt?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get provider earnings and payment statistics
 * Uses authenticated user context - no provider ID parameter needed
 * @returns Earnings data including total earnings, jobs count, and current balance
 */
export const getProviderEarnings = async (): Promise<EarningsData> => {
  return apiClient.request(`/payments/earnings`, {
    method: 'GET',
  });
};

/**
 * Get all invoices for a provider with optional status filter
 * @param status - Optional filter for invoice status ('pending', 'received', 'disputed')
 * @returns Invoices summary and list of invoices with Stripe details
 */
export const getProviderInvoices = async (status?: string): Promise<GetProviderInvoicesResponse> => {
  const params = status ? `?status=${status}` : '';
  return apiClient.request(`/payments/provider/invoices${params}`, {
    method: 'GET',
  });
};

/**
 * Get invoice details by ID
 * @param invoiceId - The invoice ID
 * @returns Invoice details
 */
export const getInvoiceById = async (invoiceId: number): Promise<Invoice> => {
  return apiClient.request(`/payments/provider/invoices/${invoiceId}`, {
    method: 'GET',
  });
};

/**
 * Send/Generate invoice for a completed job
 * Generates invoice and sends to customer via email and chat
 * @param jobId - The job ID
 * @returns Invoice response with URL and status
 */
export const sendJobInvoice = async (jobId: number): Promise<JobInvoiceResponse> => {
  return apiClient.request(`/payments/jobs/${jobId}/send-invoice`, {
    method: 'POST',
  });
};

/**
 * Get invoice details for a specific job
 * @param jobId - The job ID
 * @returns Complete invoice details including job, customer, payment and invoice data
 */
export const getJobInvoiceDetails = async (jobId: number): Promise<InvoiceDetails> => {
  return apiClient.request(`/payments/jobs/${jobId}/invoice`, {
    method: 'GET',
  });
};

/**
 * Resend invoice email to customer
 * @param jobId - The job ID
 * @returns Resend operation status
 */
export const resendJobInvoice = async (jobId: number): Promise<ResendInvoiceResponse> => {
  return apiClient.request(`/payments/jobs/${jobId}/resend-invoice`, {
    method: 'POST',
  });
};

