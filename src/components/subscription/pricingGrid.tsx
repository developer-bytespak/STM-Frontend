import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
  const { isAuthenticated } = useAuth();

  const handlePlanSelect = (plan: Plan) => {
    if (onPlanSelect) {
      onPlanSelect(plan, userType);
    } else {
      // Store plan info in localStorage
      const planInfo = {
        name: plan.name,
        price: plan.price + (plan.priceSubtext || ''),
        userType: userType,
        planId: plan.planId
      };
      localStorage.setItem('selectedPlan', JSON.stringify(planInfo));

      // Check if it's a free plan
      const isFreePlan = plan.planId === 'customer-free' || plan.planId === 'provider-basic';

      if (isAuthenticated) {
        // User is logged in
        if (isFreePlan) {
          // Redirect to dashboard for free plans
          const dashboardPath = userType === 'customer' ? '/customer/dashboard' : '/provider/dashboard';
          router.push(dashboardPath);
        } else {
          // Redirect to payment page for paid plans
          router.push('/payment');
        }
      } else {
        // User is not logged in
        if (isFreePlan) {
          // Redirect to signup for free plans with plan info
          const signupUrl = userType === 'customer' ? '/register' : '/provider/signup';
          router.push(`${signupUrl}?planId=${plan.planId}`);
        } else {
          // Redirect to payment page for paid plans
          router.push('/payment');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl mt-8 md:-mt-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {title}
        </h1>
        
        {/* Current Plan Status for Logged-in Users */}
        {isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto -mt-4 md:-mt-6">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 font-medium">
                You are currently using the free plan. Upgrade to unlock premium features!
              </span>
            </div>
          </div>
        )}
        
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
                disabled={isAuthenticated && (plan.planId === 'customer-free' || plan.planId === 'provider-basic')}
                className={`w-full font-semibold text-lg py-3 px-4 rounded-lg transition-colors ${
                  isAuthenticated && (plan.planId === 'customer-free' || plan.planId === 'provider-basic')
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isAuthenticated && (plan.planId === 'customer-free' || plan.planId === 'provider-basic')
                  ? 'Current Plan'
                  : plan.buttonText
                }
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
  const { user, isAuthenticated } = useAuth();
  const [viewType, setViewType] = React.useState<'customer' | 'provider'>('customer');
  
  // Determine which pricing to show based on user role
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'customer') {
        setViewType('customer');
      } else if (user.role === 'service_provider') {
        setViewType('provider');
      }
      // For admin and lsm roles, default to customer view
    }
  }, [isAuthenticated, user]);
  
  // Show toggle only if user is not logged in or has admin/lsm role
  const showToggle = !isAuthenticated || (user?.role === 'admin' || user?.role === 'local_service_manager');
  
  return (
    <div className="relative">
      {/* Toggle Buttons - Only show for unauthenticated users or admin/lsm */}
      {showToggle && (
        <div className="absolute top-0 right-0 z-10 bg-white rounded-lg shadow-md p-1">
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
      )}
      
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