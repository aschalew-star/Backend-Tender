// Mock API endpoints for payment processing
// In a real application, these would be actual API routes

import type{ PaymentRequest, PaymentResponse, PaymentVerification } from '../type/payment';

export const paymentApi = {
  async initializeChapa(data: PaymentRequest): Promise<PaymentResponse> {
    // Mock Chapa API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Payment initialized successfully',
          status: 'success',
          data: {
            checkout_url: `https://checkout.chapa.co/checkout/payment/${data.tx_ref}`,
            tx_ref: data.tx_ref,
          },
        });
      }, 1000);
    });
  },

  async initializeTellbirr(data: PaymentRequest): Promise<PaymentResponse> {
    // Mock Tellbirr API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Payment initialized successfully',
          status: 'success',
          data: {
            checkout_url: `https://checkout.tellbirr.com/pay/${data.tx_ref}`,
            tx_ref: data.tx_ref,
          },
        });
      }, 1000);
    });
  },

  async verifyChapa(txRef: string): Promise<PaymentVerification> {
    // Mock verification response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          message: 'Payment verified successfully',
          data: {
            status: 'success',
            reference: txRef,
            amount: 850,
            currency: 'ETB',
            tx_ref: txRef,
          },
        });
      }, 2000);
    });
  },

  async verifyTellbirr(txRef: string): Promise<PaymentVerification> {
    // Mock verification response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          message: 'Payment verified successfully',
          data: {
            status: 'success',
            reference: txRef,
            amount: 850,
            currency: 'ETB',
            tx_ref: txRef,
          },
        });
      }, 2000);
    });
  },
};