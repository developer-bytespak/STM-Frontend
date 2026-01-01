export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'disputed';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'wallet';
export type PaymentType = 'job_payment' | 'subscription' | 'deposit' | 'refund' | 'payout' | 'fee';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  type: PaymentType;
  description: string;
  reference?: string; // External payment reference
  metadata?: PaymentMetadata;
  customerId?: string;
  providerId?: string;
  jobId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
}

export interface PaymentMetadata {
  cardLast4?: string;
  cardBrand?: string;
  bankName?: string;
  transactionId?: string;
  gatewayResponse?: any;
  fees?: {
    platform: number;
    processing: number;
    total: number;
  };
}

export interface PaymentCard {
  id: string;
  userId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentMethodData {
  type: PaymentMethod;
  card?: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    name: string;
  };
  bank?: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    accountHolderName: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret?: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Payment creation types
export interface CreatePaymentData {
  amount: number;
  currency: string;
  method: PaymentMethod;
  type: PaymentType;
  description: string;
  customerId?: string;
  providerId?: string;
  jobId?: string;
  paymentMethodData?: PaymentMethodData;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentData {
  paymentIntentId: string;
  paymentMethodId: string;
  confirmationMethod?: 'automatic' | 'manual';
}

// Payout types (for providers)
export interface Payout {
  id: string;
  providerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal';
  bankDetails?: BankDetails;
  paypalEmail?: string;
  scheduledDate?: string;
  processedAt?: string;
  failureReason?: string;
  earningsPeriod: {
    start: string;
    end: string;
  };
  jobs: string[]; // Job IDs included in this payout
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  netAmount: number;
  createdAt: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  country: string;
}

export interface CreatePayoutData {
  providerId: string;
  amount: number;
  method: 'bank_transfer' | 'paypal';
  bankDetails?: BankDetails;
  paypalEmail?: string;
  earningsPeriod: {
    start: string;
    end: string;
  };
  jobIds: string[];
}

// Refund types
export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  refundMethod: PaymentMethod;
  processedAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
}

export interface CreateRefundData {
  paymentId: string;
  amount: number;
  reason: string;
  refundMethod: PaymentMethod;
  metadata?: Record<string, any>;
}

// Invoice types
export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  providerId?: string;
  jobId?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  tax?: number;
}

// Payment analytics types
export interface PaymentAnalytics {
  period: {
    start: string;
    end: string;
  };
  totalVolume: number;
  totalTransactions: number;
  averageTransactionValue: number;
  successRate: number;
  refundRate: number;
  paymentMethodBreakdown: {
    method: PaymentMethod;
    count: number;
    volume: number;
    percentage: number;
  }[];
  dailyVolume: {
    date: string;
    volume: number;
    transactions: number;
  }[];
}

// Payment search and filtering types
export interface PaymentSearchFilters {
  status?: PaymentStatus[];
  method?: PaymentMethod[];
  type?: PaymentType[];
  customerId?: string;
  providerId?: string;
  jobId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'created_at' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// API response types
export interface PaymentResponse {
  payment: Payment;
  intent?: PaymentIntent;
}

export interface PaymentsListResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  filters: PaymentSearchFilters;
}

export interface PayoutsListResponse {
  payouts: Payout[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentAnalyticsResponse {
  analytics: PaymentAnalytics;
  summary: {
    totalVolume: number;
    totalTransactions: number;
    successRate: number;
    refundRate: number;
  };
}

// Payment webhook types
export interface PaymentWebhook {
  id: string;
  type: string;
  data: {
    payment: Payment;
    previousAttributes?: Partial<Payment>;
  };
  created: number;
  livemode: boolean;
}

// Wallet types (for internal credits)
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  transactions: WalletTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string; // Payment ID or other reference
  balanceAfter: number;
  createdAt: string;
}

export interface WalletTopUpData {
  amount: number;
  paymentMethodId: string;
  description?: string;
}

// ==================== PROVIDER EARNINGS & INVOICES ====================

export interface ProviderEarnings {
  providerId: number;
  totalEarnings: number;
  totalJobs: number;
  currentBalance: number;
}

export type InvoiceStatus = 'pending' | 'received' | 'disputed';

export interface ProviderInvoice {
  id: number;
  jobId: number;
  jobService: string;
  jobCategory: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: InvoiceStatus;
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


