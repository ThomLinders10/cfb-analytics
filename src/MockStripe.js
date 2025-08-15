// Mock Stripe for development - src/MockStripe.js

// Mock @stripe/stripe-js
export const loadStripe = async (publishableKey) => {
  console.log('Mock Stripe loaded with key:', publishableKey);
  
  return {
    elements: () => ({
      create: (type, options) => ({
        mount: (selector) => console.log('Mock element mounted:', type, selector),
        on: (event, handler) => console.log('Mock event listener:', event),
        destroy: () => console.log('Mock element destroyed')
      }),
      getElement: (type) => ({
        clear: () => console.log('Mock element cleared')
      })
    }),
    
    createPaymentMethod: async (options) => {
      console.log('Mock payment method created:', options);
      return {
        paymentMethod: {
          id: 'pm_mock_123456',
          type: 'card'
        }
      };
    },
    
    confirmCardPayment: async (clientSecret, paymentMethod) => {
      console.log('Mock payment confirmed:', clientSecret);
      return {
        paymentIntent: {
          id: 'pi_mock_123456',
          status: 'succeeded'
        }
      };
    }
  };
};

// Mock @stripe/react-stripe-js
export const Elements = ({ children, stripe, options }) => {
  return children;
};

export const CardElement = ({ onChange, onReady }) => {
  // Simulate card element
  setTimeout(() => {
    if (onReady) onReady();
  }, 100);
  
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '12px',
      background: 'white',
      color: '#424770'
    }}>
      Mock Card Element - **** **** **** 4242
    </div>
  );
};

export const useStripe = () => {
  return {
    createPaymentMethod: async (options) => {
      return {
        paymentMethod: { id: 'pm_mock_123456' }
      };
    },
    confirmCardPayment: async (clientSecret) => {
      return {
        paymentIntent: { status: 'succeeded' }
      };
    }
  };
};

export const useElements = () => {
  return {
    getElement: (type) => ({
      clear: () => console.log('Mock element cleared')
    })
  };
};