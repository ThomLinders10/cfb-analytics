import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const AuthModal = ({ isOpen, onClose, initialTab = 'signin' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const modalRef = useRef();

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!signInData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(signInData.email)) newErrors.email = 'Invalid email';
    
    if (!signInData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Sign in:', signInData);
      setLoading(false);
      onClose();
    }, 1000);
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!signUpData.firstName) newErrors.firstName = 'First name required';
    if (!signUpData.lastName) newErrors.lastName = 'Last name required';
    if (!signUpData.email) newErrors.email = 'Email required';
    else if (!validateEmail(signUpData.email)) newErrors.email = 'Invalid email';
    
    if (!signUpData.password) newErrors.password = 'Password required';
    else if (signUpData.password.length < 6) newErrors.password = 'Min 6 characters';
    
    if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      console.log('Sign up:', signUpData);
      setLoading(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="auth-modal-overlay">
      <div className="auth-modal" ref={modalRef}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        
        <div className="auth-tabs">
          <button 
            className={activeTab === 'signin' ? 'active' : ''}
            onClick={() => {setActiveTab('signin'); setErrors({})}}
          >
            Sign In
          </button>
          <button 
            className={activeTab === 'signup' ? 'active' : ''}
            onClick={() => {setActiveTab('signup'); setErrors({})}}
          >
            Sign Up
          </button>
        </div>

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignInSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={signInData.email}
                onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={signInData.password}
                onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit}>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="First Name"
                  value={signUpData.firstName}
                  onChange={(e) => setSignUpData({...signUpData, firstName: e.target.value})}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={signUpData.lastName}
                  onChange={(e) => setSignUpData({...signUpData, lastName: e.target.value})}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password (6+ characters)"
                value={signUpData.password}
                onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={signUpData.confirmPassword}
                onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default AuthModal;