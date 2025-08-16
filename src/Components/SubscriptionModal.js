import React, { useState } from 'react';
import { loadStripe } from '../MockStripe.js';
import { Elements, CardElement, useStripe, useElements } from '../MockStripe.js';
import { API } from '../MockAWSAmplify.js';
import './SubscriptionModal.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_mock');

const CheckoutForm = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!stripe || !elements) return;

    try {
      // Create subscription on your backend
      const response = await API.post('payments', '/create-subscription', {
        body: {
          planId: plan.id,
          paymentMethodId: elements.getElement(CardElement),
        }
      });

      const { client_secret } = response;

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="plan-summary">
        <h3>{plan.name}</h3>
        <div className="price">
          {plan.discounted ? (
            <>
              <span className="original-price">${plan.originalPrice}</span>
              <span className="discounted-price">${plan.price}</span>
              <span className="promo-badge">EARLY BIRD SPECIAL!</span>
            </>
          ) : (
            <span className="regular-price">${plan.price}</span>
          )}
          <span className="billing-period">/{plan.interval}</span>
        </div>
        <p className="trial-info">âœ¨ 30-day free trial included</p>
      </div>

      <div className="card-element-container">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button 
          type="button" 
          onClick={onCancel}
          className="cancel-btn"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={!stripe || loading}
          className="subscribe-btn"
        >
          {loading ? 'Processing...' : `Start Free Trial`}
        </button>
      </div>

      <div className="subscription-terms">
        <p>By subscribing, you agree to our Terms of Service. Cancel anytime during your trial period at no charge.</p>
      </div>
    </form>
  );
};

const SubscriptionModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriberCount] = useState(47); // Track early bird subscribers

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price: subscriberCount < 100 ? 59 : 79,
      originalPrice: 79,
      discounted: subscriberCount < 100,
      interval: 'month',
      features: [
        '54-Factor Game Predictions',
        'Emerging Player Analysis',
        'Real-time Updates',
        'Conference Deep Dives',
        'Trivia Game Access',
        'Community Chat'
      ]
    },
    {
      id: 'yearly',
      name: 'Annual Premium',
      price: 699,
      interval: 'year',
      savings: 'Save $249/year',
      features: [
        'Everything in Monthly',
        '2 months free',
        'Priority support',
        'Early access to new features',
        'Historical data access'
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="subscription-modal-overlay">
      <div className="subscription-modal">
        <div className="modal-header">
          <h2>ðŸˆ Unlock Premium CFB Analytics</h2>
          <button className="close-btn" onClick={onClose}>Ã—</button>
        </div>

        <div className="modal-content">
          {!selectedPlan ? (
            <div className="plan-selection">
              <div className="early-bird-banner">
                <h3>ðŸš€ Early Bird Special!</h3>
                <p>First 100 subscribers get Monthly Premium for $59/month (first year)</p>
                <p className="spots-left">{100 - subscriberCount} spots remaining</p>
              </div>

              <div className="plans-grid">
                {plans.map((plan) => (
                  <div key={plan.id} className={`plan-card ${plan.discounted ? 'featured' : ''}`}>
                    {plan.discounted && <div className="promo-ribbon">Limited Time</div>}
                    
                    <h3>{plan.name}</h3>
                    
                    <div className="plan-price">
                      {plan.discounted ? (
                        <>
                          <span className="original-price">${plan.originalPrice}</span>
                          <span className="discounted-price">${plan.price}</span>
                        </>
                      ) : (
                        <span className="regular-price">${plan.price}</span>
                      )}
                      <span className="billing-period">/{plan.interval}</span>
                    </div>
                    
                    {plan.savings && <p className="savings">{plan.savings}</p>}
                    
                    <ul className="features-list">
                      {plan.features.map((feature, index) => (
                        <li key={index}>âœ“ {feature}</li>
                      ))}
                    </ul>
                    
                    <button 
                      className="select-plan-btn"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      Choose {plan.name}
                    </button>
                  </div>
                ))}
              </div>

              <div className="value-proposition">
                <h3>Why Premium?</h3>
                <div className="value-grid">
                  <div className="value-item">
                    <span className="value-icon">ðŸŽ¯</span>
                    <span>Live-tracked prediction accuracy</span>
                  </div>
                  <div className="value-item">
                    <span className="value-icon">â­</span>
                    <span>Discover emerging players before anyone else</span>
                  </div>
                  <div className="value-item">
                    <span className="value-icon">ðŸ“Š</span>
                    <span>54-factor analysis beats traditional metrics</span>
                  </div>
                  <div className="value-item">
                    <span className="value-icon">âš¡</span>
                    <span>Real-time updates every Monday morning</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                plan={selectedPlan}
                onSuccess={onSuccess}
                onCancel={() => setSelectedPlan(null)}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
