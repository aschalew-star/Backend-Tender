import axios from 'axios';
import type{ PaymentRequest, PaymentResponse, PaymentVerification } from '../type/payment';

const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

class ChapaService {
  private secretKey: string;

  constructor() {
    this.secretKey = import.meta.env.VITE_CHAPA_SECRET_KEY || '';
  }

  async initiatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${CHAPA_BASE_URL}/transaction/initialize`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Chapa payment initiation failed:', error);
      throw new Error('Payment initiation failed');
    }
  }

  async verifyPayment(txRef: string): Promise<PaymentVerification> {
    try {
      const response = await axios.get(
        `${CHAPA_BASE_URL}/transaction/verify/${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Chapa payment verification failed:', error);
      throw new Error('Payment verification failed');
    }
  }
}

export const chapaService = new ChapaService();