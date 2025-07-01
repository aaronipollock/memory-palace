import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import PasswordStrength from './PasswordStrength';
import { InputSanitizer, PasswordValidator } from '../utils/security';
import {
  validateAuthForm,
  getFieldStyling,
  getFieldIcon
} from '../utils/validation';

const AuthModal = ({ isOpen, onClose, mode, onSubmit, error, isLoading, formData, setFormData }) => {
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

  // Validate form whenever formData changes
  useEffect(() => {
    const validationResult = validateAuthForm(formData, mode);
    setValidation(validationResult);
  }, [formData, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Sanitize input
    const sanitizedValue = InputSanitizer.sanitizeString(value);

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true, confirmPassword: true });

    // Additional security validation
    if (mode === 'signup') {
      const passwordValidation = PasswordValidator.validate(formData.password);
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
      const sanitizedFormData = InputSanitizer.sanitizeObject(formData);
      onSubmit(sanitizedFormData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {mode === 'login' ? 'Welcome Back' : 'Start Your Journey'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4">
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
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  getFieldStyling(
                    validation.isValidations.email,
                    formData.email,
                    touched.email
                  )
                }`}
                required
                autoComplete="off"
                disabled={isLoading}
                maxLength={254}
              />
              {touched.email && formData.email && (
                <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                  validation.isValidations.email ? 'text-green-500' : 'text-red-500'
                }`}>
                  {getFieldIcon(validation.isValidations.email, formData.email, touched.email)}
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
                value={formData.password}
                onChange={handleInputChange}
                onBlur={() => handleBlur('password')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  getFieldStyling(
                    validation.isValidations.password,
                    formData.password,
                    touched.password
                  )
                }`}
                required
                autoComplete="new-password"
                disabled={isLoading}
                maxLength={128}
              />
              {touched.password && formData.password && (
                <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                  validation.isValidations.password ? 'text-green-500' : 'text-red-500'
                }`}>
                  {getFieldIcon(validation.isValidations.password, formData.password, touched.password)}
                </span>
              )}
            </div>
            {touched.password && validation.errors.password && (
              <p className="text-red-500 text-xs mt-1">{validation.errors.password}</p>
            )}
            {mode === 'signup' && formData.password && (
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
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    getFieldStyling(
                      validation.isValidations.confirmPassword,
                      formData.confirmPassword,
                      touched.confirmPassword
                    )
                  }`}
                  required
                  disabled={isLoading}
                  maxLength={128}
                />
                {touched.confirmPassword && formData.confirmPassword && (
                  <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                    validation.isValidations.confirmPassword ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {getFieldIcon(validation.isValidations.confirmPassword, formData.confirmPassword, touched.confirmPassword)}
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
