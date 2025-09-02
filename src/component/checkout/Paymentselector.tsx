import React from 'react';
import { Card } from './Card';
import { cn } from './Uitils';


interface PaymentMethod {
  id: 'chapa' | 'tellbirr';
  name: string;
  description: string;
  logo: string;
  supported: string[];
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'chapa',
    name: 'Chapa',
    description: 'Pay with your mobile wallet or bank account',
    logo: '🔷',
    supported: ['CBE Birr', 'Telebirr', 'Awash Bank', 'Bank of Abyssinia'],
  },
  {
    id: 'tellbirr',
    name: 'Tellbirr',
    description: 'Secure payment with Tellbirr wallet',
    logo: '📱',
    supported: ['Tellbirr Wallet', 'Mobile Banking'],
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: 'chapa' | 'tellbirr' | null;
  onMethodSelect: (method: 'chapa' | 'tellbirr') => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              selectedMethod === method.id
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'hover:border-gray-300'
            )}
            onClick={() => onMethodSelect(method.id)}
          >
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{method.logo}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {method.supported.map((support) => (
                      <span
                        key={support}
                        className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                      >
                        {support}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className={cn(
                    'h-4 w-4 rounded-full border-2 transition-colors',
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  )}
                >
                  {selectedMethod === method.id && (
                    <div className="h-full w-full rounded-full bg-white scale-50" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}