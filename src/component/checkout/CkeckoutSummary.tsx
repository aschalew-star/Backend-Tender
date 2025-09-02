import React from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { cn } from './Uitils';
import { type TenderDocument } from '../type/payment';
import { FileText, Calendar, Building2 } from 'lucide-react';

interface CheckoutSummaryProps {
  document: TenderDocument;
}

// ✅ Helper function for date formatting
function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ✅ Helper function for currency formatting
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function CheckoutSummary({ document }: CheckoutSummaryProps) {
  const isExpired = new Date() > new Date(document.tender.biddingClosed);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">{document.title}</h3>
              <p className="text-sm text-gray-600">{document.name}</p>
            </div>
          </div>

          <div className="pl-8 space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span>
                {document.tender.category.name} • {document.tender.subcategory.name}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                Bidding closes: {formatDate(new Date(document.tender.biddingClosed))}
              </span>
            </div>

            {isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Bidding period has expired
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Document Price</span>
            <span className="font-medium">{formatCurrency(document.price)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Processing Fee</span>
            <span className="font-medium">{formatCurrency(0)}</span>
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(document.price)}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Full tender document access</li>
            <li>• Instant download after payment</li>
            <li>• Email copy of the document</li>
            <li>• 24/7 customer support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
