export interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title: string;
    description: string;
  };
}

export interface PaymentResponse {
  message: string;
  status: string;
  data?: {
    checkout_url: string;
    tx_ref: string;
  };
}

export interface PaymentVerification {
  status: string;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    tx_ref: string;
  };
}

export interface TenderDocument {
  id: number;
  name: string;
  title: string;
  price: number;
  type: 'FREE' | 'PAID';
  tender: {
    id: number;
    title: string;
    description: string;
    biddingOpen: Date;
    biddingClosed: Date;
    category: {
      name: string;
    };
    subcategory: {
      name: string;
    };
  };
}