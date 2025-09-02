import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from'./Card';
import { Button } from './Button';
import { PaymentMethodSelector } from './Paymentselector';
import { paymentService } from './PaymentService';
import { v4 as uuidv4 } from 'uuid';
import {type TenderDocument } from '../type/payment';

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PaymentFormProps {
  customer: Customer;
  document: TenderDocument;
  onPaymentSuccess: (txRef: string) => void;
  onBack: () => void;
}

export function PaymentForm({
  customer,
  document,
  onPaymentSuccess,
  onBack,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<'chapa' | 'tellbirr' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const txRef = `tender_${document.id}_${uuidv4()}`;
      
      const paymentData = {
        amount: document.price,
        currency: 'ETB',
        email: customer.email,
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone_number: customer.phone,
        tx_ref: txRef,
        callback_url: `${window.location.origin}/api/payment/callback`,
        return_url: `${window.location.origin}/checkout/success?tx_ref=${txRef}`,
        customization: {
          title: `Purchase ${document.title}`,
          description: `Tender Document - ${document.tender.title}`,
        },
      };

      const response = await paymentService.processPayment(selectedMethod, paymentData);

      if (response.status === 'success' && response.data?.checkout_url) {
        // Redirect to payment gateway
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error(response.message || 'Payment initiation failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
        <p className="text-gray-600">Choose your preferred payment method to complete the purchase</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onMethodSelect={setSelectedMethod}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={loading}
          >
            Back
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1"
            loading={loading}
            disabled={!selectedMethod}
          >
            Pay {document.price > 0 ? `${document.price} ETB` : 'Free'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>🔒 Your payment information is secure and encrypted</p>
          <p className="mt-1">By proceeding, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </CardContent>
    </Card>
  );
}