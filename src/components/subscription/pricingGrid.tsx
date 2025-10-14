import React from 'react';
import { useRouter } from 'next/navigation';

interface PlanFeature {
  text: string;
}

interface Plan {
  name: string;
  price: string;
  priceSubtext?: string;
  features: PlanFeature[];
  buttonText: string;
  planId: string;
}

interface PricingGridProps {
  title: string;
  plans: Plan[];
  userType: 'customer' | 'provider';
  onPlanSelect?: (plan: Plan, userType: 'customer' | 'provider') => void;
}

const PricingGrid: React.FC<PricingGridProps> = ({ title, plans, userType, onPlanSelect }) => {
  const router = useRouter();

  const handlePlanSelect = (plan: Plan) => {
    if (onPlanSelect) {
      onPlanSelect(plan, userType);
    } else {
      // Default behavior - redirect to signup with plan info
      const signupUrl = userType === 'customer' ? '/register' : '/provider/signup';
      // Use just the plan ID for a cleaner URL
      router.push(`${signupUrl}?planId=${plan.planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {title}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                {plan.name}
              </h2>
              
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                {plan.priceSubtext && (
                  <span className="text-lg text-gray-900 ml-1">
                    {plan.priceSubtext}
                  </span>
                )}
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li 
                    key={featureIndex}
                    className="flex items-start text-gray-800"
                  >
                    <span className="text-lg mr-2 leading-none">•</span>
                    <span className="text-sm leading-relaxed">{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handlePlanSelect(plan)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-4 rounded-lg transition-colors"
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Customer Plans Data
const customerPlans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    planId: 'customer-free',
    features: [
      { text: 'Access to all services' },
      { text: 'Pay-per-job basis' },
      { text: 'View SP ratings & profiles' },
      { text: 'Basic chat support' }
    ],
    buttonText: 'Get Started'
  },
  {
    name: 'Premium',
    price: '$49',
    priceSubtext: '/ month',
    planId: 'customer-premium',
    features: [
      { text: 'Priority SP assignment' },
      { text: '5% discount on all bookings' },
      { text: 'Dedicated LSM support for disputes' },
      { text: 'Cashback / loyalty rewards' }
    ],
    buttonText: 'Get Started'
  },
  {
    name: 'Corporate',
    price: 'Custom',
    planId: 'customer-corporate',
    features: [
      { text: 'Bulk / recurring service bookings' },
      { text: 'Monthly invoicing & usage reports' },
      { text: 'Dedicated key-account manager' },
      { text: 'Custom service packages' }
    ],
    buttonText: 'Get Started'
  }
];

// Service Provider Plans Data
const serviceProviderPlans: Plan[] = [
  {
    name: 'Basic',
    price: '$0',
    planId: 'provider-basic',
    features: [
      { text: 'Access to job listings' },
      { text: 'Standard commission rates' },
      { text: 'Basic profile visibility' },
      { text: 'Email support' }
    ],
    buttonText: 'Get Started'
  },
  {
    name: 'Professional',
    price: '$99',
    priceSubtext: '/ month',
    planId: 'provider-professional',
    features: [
      { text: 'Priority job notifications' },
      { text: 'Reduced commission rates' },
      { text: 'Enhanced profile features' },
      { text: 'Dedicated support line' }
    ],
    buttonText: 'Get Started'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    planId: 'provider-enterprise',
    features: [
      { text: 'Multi-user account access' },
      { text: 'Lowest commission rates' },
      { text: 'Premium profile placement' },
      { text: 'Account manager support' }
    ],
    buttonText: 'Get Started'
  }
];

// Main Pricing Plans Component
const PricingPlans: React.FC = () => {
  const [viewType, setViewType] = React.useState<'customer' | 'provider'>('customer');
  
  return (
    <div className="relative">
      {/* Toggle Buttons */}
      <div className="fixed top-4 right-4 z-10 bg-white rounded-lg shadow-md p-1">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewType('customer')}
            className={`p-2 rounded-md transition-colors ${
              viewType === 'customer' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Customer Plans"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button
            onClick={() => setViewType('provider')}
            className={`p-2 rounded-md transition-colors ${
              viewType === 'provider' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Service Provider Plans"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>
      
      {viewType === 'customer' ? (
        <PricingGrid 
          title="Customer Membership Plans" 
          plans={customerPlans}
          userType="customer"
        />
      ) : (
        <PricingGrid 
          title="Service Provider Membership Plans" 
          plans={serviceProviderPlans}
          userType="provider"
        />
      )}
    </div>
  );
};


export { PricingGrid, customerPlans, serviceProviderPlans };
export default PricingPlans;