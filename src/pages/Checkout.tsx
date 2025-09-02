import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckoutSteps } from '../component/checkout/CkeckoutStep';
import { CheckoutSummary } from '../component/checkout/CkeckoutSummary';
import { CustomerForm } from '../component/checkout/CustomerForm';
import { PaymentForm } from '../component/checkout/PaymentForm';
import { CheckoutSuccess } from '../component/checkout/CkeckoutSuccess';
import { Button } from '../component/checkout/Button';
import { useAuth } from '../Redux/UseAuth';
import { Card, CardHeader, CardContent } from '../component/checkout/Card';
import {type TenderDocument } from '../component/type/payment';
import { ArrowLeft } from 'lucide-react';

export function CheckoutPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [document, setDocument] = useState<TenderDocument | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [txRef, setTxRef] = useState<string | null>(null);

  // Mock document data - in real app, fetch from API
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockDocument: TenderDocument = {
          id: parseInt(documentId || '1'),
          name: 'Tender-Document-Construction-2024.pdf',
          title: 'Road Construction Project - Addis Ababa Ring Road Phase III',
          price: 850.00,
          type: 'PAID',
          tender: {
            id: 1,
            title: 'Construction of Ring Road Phase III',
            description: 'Major infrastructure development project for Addis Ababa city expansion',
            biddingOpen: new Date('2024-01-15'),
            biddingClosed: new Date('2024-02-15'),
            category: {
              name: 'Construction & Infrastructure',
            },
            subcategory: {
              name: 'Road Construction',
            },
          },
        };
        
        setDocument(mockDocument);
      } catch (error) {
        console.error('Failed to fetch document:', error);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const handleCustomerSubmit = (customerData: any) => {
    setCustomer(customerData);
    setCurrentStep(2);
  };

  const handlePaymentSuccess = (txReference: string) => {
    setTxRef(txReference);
    setCurrentStep(3);
  };

  const handleDownload = () => {
    // Implement document download logic
    const link = document.createElement('a');
    link.href = '/api/documents/download/' + documentId;
    link.download = document?.name || 'tender-document.pdf';
    link.click();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/tenders');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h1>
          <p className="text-gray-600 mb-6">The requested tender document could not be found.</p>
          <Button onClick={() => navigate('/tenders')}>
            Browse Tenders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase to access the tender document</p>
        </div>

        <CheckoutSteps currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
                  <p className="text-gray-600">Enter your details to create an account and complete the purchase</p>
                </CardHeader>
                <CardContent>
                  <CustomerForm onSubmit={handleCustomerSubmit} />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && customer && (
              <PaymentForm
                customer={customer}
                document={document}
                onPaymentSuccess={handlePaymentSuccess}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && txRef && (
              <CheckoutSuccess
                txRef={txRef}
                onDownload={handleDownload}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <CheckoutSummary document={document} />
          </div>
        </div>
      </div>
    </div>
  );
}