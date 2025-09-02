import React from 'react';
import { cn } from './Uitils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    name: 'Customer Details',
    description: 'Enter your information',
  },
  {
    id: 2,
    name: 'Payment Method',
    description: 'Choose payment option',
  },
  {
    id: 3,
    name: 'Confirmation',
    description: 'Complete your purchase',
  },
];

interface CheckoutStepsProps {
  currentStep: number;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <nav className="mb-8">
      <ol className="flex items-center justify-center space-x-4 md:space-x-8">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  currentStep > step.id
                    ? 'bg-green-600 text-white'
                    : currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="hidden md:block">
                <p
                  className={cn(
                    'text-sm font-medium',
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'hidden md:block w-12 h-0.5 ml-4 transition-colors',
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}