import { chapaService } from './ChapaService';
import { tellbirrService } from './tellbirrservice';
import type{ PaymentRequest, PaymentResponse} from '../type/payment';


export class PaymentService {
  async processPayment(
    provider: 'chapa' | 'tellbirr',
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    switch (provider) {
      case 'chapa':
        return await chapaService.initiatePayment(paymentData);
      case 'tellbirr':
        return await tellbirrService.initiatePayment(paymentData);
      default:
        throw new Error('Unsupported payment provider');
    }
  }

  async verifyPayment(provider: 'chapa' | 'tellbirr', txRef: string) {
    switch (provider) {
      case 'chapa':
        return await chapaService.verifyPayment(txRef);
      case 'tellbirr':
        return await tellbirrService.verifyPayment(txRef);
      default:
        throw new Error('Unsupported payment provider');
    }
  }
}

export const paymentService = new PaymentService();