import axios from 'axios';
import type{ PaymentRequest, PaymentResponse, PaymentVerification } from '../type/payment';

const TELLBIRR_BASE_URL = 'https://api.tellbirr.com/v1';

class TellbirrService {
  private secretKey: string;

  constructor() {
    this.secretKey = import.meta.env.VITE_TELLBIRR_SECRET_KEY || '';
  }

  async initiatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${TELLBIRR_BASE_URL}/payment/initialize`,
        {
          ...paymentData,
          merchant_id: import.meta.env.VITE_TELLBIRR_MERCHANT_ID,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Tellbirr payment initiation failed:', error);
      throw new Error('Payment initiation failed');
    }
  }

  async verifyPayment(txRef: string): Promise<PaymentVerification> {
    try {
      const response = await axios.get(
        `${TELLBIRR_BASE_URL}/payment/verify/${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Tellbirr payment verification failed:', error);
      throw new Error('Payment verification failed');
    }
  }
}

export const tellbirrService = new TellbirrService();