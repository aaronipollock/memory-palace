import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import PasswordStrength from './PasswordStrength';
import { InputSanitizer, PasswordValidator } from '../utils/security';
import {
  validateAuthForm,
  getFieldStyling,
  getFieldIcon
} from '../utils/validation';

const AuthModal = ({ isOpen, onClose, mode, onSubmit, error, isLoading, formData: initialFormData, setFormData }) => {
  // Use local state to prevent parent re-renders on every keystroke
  const [localFormData, setLocalFormData] = useState(initialFormData);
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false });
  const [validation, setValidation] = useState({
    isValid: false,
    errors: {},
    isValidations: {},
    passwordStrength: 0,
    passwordStrengthLabel: '',
    passwordStrengthColor: '',
    passwordRequirements: []
  });
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Sync with parent state only on blur (not on every keystroke to prevent focus loss)
  const syncWithParent = () => {
    if (setFormData) {
      setFormData(localFormData);
    }
  };

  // Sync local state with prop when modal opens or prop changes externally
  useEffect(() => {
    if (isOpen) {
      setLocalFormData(initialFormData);
    }
  }, [isOpen, initialFormData]);

  // Validate form whenever localFormData changes
  useEffect(() => {
    const validationResult = validateAuthForm(localFormData, mode);
    setValidation(validationResult);
  }, [localFormData, mode]);

  // Focus trap and Escape key support
  useEffect(() => {
    if (!isOpen) return;
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    // Focus the first input
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Sanitize input
    const sanitizedValue = InputSanitizer.sanitizeString(value);

    // Update local state only (prevents parent re-render on every keystroke)
    setLocalFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    // Sync with parent state on blur
    syncWithParent();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true, confirmPassword: true });

    // Additional security validation
    if (mode === 'signup') {
      const passwordValidation = PasswordValidator.validate(localFormData.password);
      if (!passwordValidation.isValid) {
        // Update validation state with password errors
        setValidation(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            password: passwordValidation.errors[0]
          },
          isValid: false
        }));
        return;
      }
    }

    if (validation.isValid) {
      // Sanitize all form data before submission
      const sanitizedFormData = InputSanitizer.sanitizeObject(localFormData);
      onSubmit(sanitizedFormData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-desc"
        ref={modalRef}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold" id="auth-modal-title">
            {mode === 'login' ? 'Welcome Back' : 'Start Your Journey'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div id="auth-modal-desc" className="sr-only">
          {mode === 'login' ? 'Sign in to your account.' : 'Create a new account.'}
        </div>

        {error && (
          <div className="mb-4" aria-live="assertive">
            <ErrorMessage
              error={error}
              context="authentication"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={localFormData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  getFieldStyling(
                    validation.isValidations.email,
                    localFormData.email,
                    touched.email
                  )
                }`}
                required
                autoComplete="off"
                disabled={isLoading}
                maxLength={254}
                ref={firstInputRef}
              />
              {touched.email && localFormData.email && (
                <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                  validation.isValidations.email ? 'text-green-500' : 'text-red-500'
                }`}>
                  {getFieldIcon(validation.isValidations.email, localFormData.email, touched.email)}
                </span>
              )}
            </div>
            {touched.email && validation.errors.email && (
              <p className="text-red-500 text-xs mt-1">{validation.errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={localFormData.password}
                onChange={handleInputChange}
                onBlur={() => handleBlur('password')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  getFieldStyling(
                    validation.isValidations.password,
                    localFormData.password,
                    touched.password
                  )
                }`}
                required
                autoComplete="new-password"
                disabled={isLoading}
                maxLength={128}
                ref={passwordInputRef}
              />
              {touched.password && localFormData.password && (
                <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                  validation.isValidations.password ? 'text-green-500' : 'text-red-500'
                }`}>
                  {getFieldIcon(validation.isValidations.password, localFormData.password, touched.password)}
                </span>
              )}
            </div>
            {touched.password && validation.errors.password && (
              <p className="text-red-500 text-xs mt-1">{validation.errors.password}</p>
            )}
            {mode === 'signup' && localFormData.password && (
              <PasswordStrength
                strength={validation.passwordStrength}
                label={validation.passwordStrengthLabel}
                color={validation.passwordStrengthColor}
                requirements={validation.passwordRequirements}
              />
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={localFormData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  getFieldStyling(
                    validation.isValidations.confirmPassword,
                    localFormData.confirmPassword,
                    touched.confirmPassword
                  )
                }`}
                  required
                  disabled={isLoading}
                  maxLength={128}
                />
                {touched.confirmPassword && localFormData.confirmPassword && (
                  <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                    validation.isValidations.confirmPassword ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {getFieldIcon(validation.isValidations.confirmPassword, localFormData.confirmPassword, touched.confirmPassword)}
                  </span>
                )}
              </div>
              {touched.confirmPassword && validation.errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{validation.errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!validation.isValid || isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
              validation.isValid && !isLoading
                ? 'bg-primary hover:bg-primary-dark'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" text="" className="mr-2" />
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => onClose()}
                className="text-primary hover:text-primary-dark underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => onClose()}
                className="text-primary hover:text-primary-dark underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
