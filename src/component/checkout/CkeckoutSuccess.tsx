import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';
import { CheckCircle, Download, Receipt } from 'lucide-react';
import { paymentService } from './PaymentService';

interface CheckoutSuccessProps {
  txRef: string;
  onDownload: () => void;
}

export function CheckoutSuccess({ txRef, onDownload }: CheckoutSuccessProps) {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Determine provider from txRef or store it during payment initiation
        const provider = 'chapa'; // This should be determined dynamically
        const result = await paymentService.verifyPayment(provider, txRef);
        
        if (result.status === 'success') {
          setVerificationStatus('success');
          setPaymentDetails(result.data);
        } else {
          setVerificationStatus('failed');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setVerificationStatus('failed');
      }
    };

    verifyPayment();
  }, [txRef]);

  if (verificationStatus === 'pending') {
    return (
      <Card className="text-center">
        <CardContent className="py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <Card className="text-center">
        <CardContent className="py-12">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">We couldn't verify your payment. Please try again or contact support.</p>
          <Button onClick={() => window.location.href = '/checkout'} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-center">
      <CardContent className="py-12">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. You can now download your tender document.
        </p>

        {paymentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Payment Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Transaction ID: <span className="font-mono">{paymentDetails.reference}</span></p>
              <p>Amount: <span className="font-medium">{paymentDetails.amount} {paymentDetails.currency}</span></p>
              <p>Payment Method: <span className="capitalize">{paymentDetails.provider || 'Chapa'}</span></p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onDownload} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Document</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>Download Receipt</span>
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          A copy of your receipt has been sent to your email address
        </p>
      </CardContent>
    </Card>
  );
}