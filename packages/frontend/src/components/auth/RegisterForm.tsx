import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '@attendandt/shared';
import { useToast } from '../../context/ToastContext';

// Validation schema
const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
}

const RegisterForm: React.FC = () => {
  const { register, isAuthenticated, error, clearError, isLoading } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast } = useToast();

  // Get redirect URL from state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (values: RegisterFormValues) => {
    console.log('🚀 Registration form submitted:', values);
    try {
      console.log('📡 Calling register...');
      await register(
        {
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
          role: UserRole.STAFF, // Explicitly set default role
        },
        from
      );
      console.log('✅ Registration successful');
      showToast('Account created successfully!','success');
    } catch (err) {
      console.error('❌ Registration failed:', err);
      /* error handled by context */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Formik
          initialValues={{
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            termsAccepted: false,
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, values, isValid }) => {
            console.log('🔍 Formik render - isSubmitting:', isSubmitting, 'isValid:', isValid, 'errors:', errors, 'values:', values);
            return (
            <Form className="mt-8 space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Name fields row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name (optional)
                    </label>
                    <div className="mt-1">
                      <Field
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        aria-invalid={Boolean(errors.firstName && touched.firstName)}
                        className={`appearance-none relative block w-full px-3 py-2 border ${
                          errors.firstName && touched.firstName
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md focus:outline-none focus:z-10 sm:text-sm transition-colors`}
                        placeholder="First name"
                      />
                      <ErrorMessage
                        name="firstName"
                        component="p"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name (optional)
                    </label>
                    <div className="mt-1">
                      <Field
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        aria-invalid={Boolean(errors.lastName && touched.lastName)}
                        className={`appearance-none relative block w-full px-3 py-2 border ${
                          errors.lastName && touched.lastName
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md focus:outline-none focus:z-10 sm:text-sm transition-colors`}
                        placeholder="Last name"
                      />
                      <ErrorMessage
                        name="lastName"
                        component="p"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email && touched.email)}
                      className={`appearance-none relative block w-full px-3 py-2 border ${
                        errors.email && touched.email
                          ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md focus:outline-none focus:z-10 sm:text-sm transition-colors`}
                      placeholder="Enter your email"
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password && touched.password)}
                      className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                        errors.password && touched.password
                          ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md focus:outline-none focus:z-10 sm:text-sm transition-colors`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5 text-gray-400 hover:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a7.5 7.5 0 00-1.5 1.5m11.5-1.5L16.949 11.05M9.878 9.878a3 3 0 103.75 3.75m1.372 1.372L16.5 16.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-gray-400 hover:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters with uppercase, lowercase, and numbers
                  </div>
                </div>

                {/* Confirm Password field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="mt-1 relative">
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.confirmPassword && touched.confirmPassword)}
                      className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                        errors.confirmPassword && touched.confirmPassword
                          ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md focus:outline-none focus:z-10 sm:text-sm transition-colors`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="h-5 w-5 text-gray-400 hover:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a7.5 7.5 0 00-1.5 1.5m11.5-1.5L16.949 11.05M9.878 9.878a3 3 0 103.75 3.75m1.372 1.372L16.5 16.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-gray-400 hover:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                    <ErrorMessage
                      name="confirmPassword"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                </div>

                {/* Terms and conditions */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Field
                      id="termsAccepted"
                      name="termsAccepted"
                      type="checkbox"
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                        errors.termsAccepted && touched.termsAccepted
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="termsAccepted" className="text-gray-700">
                      I agree to the{' '}
                      <Link
                        to="/terms"
                        className="font-medium text-blue-600 hover:text-blue-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link
                        to="/privacy"
                        className="font-medium text-blue-600 hover:text-blue-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                    <ErrorMessage
                      name="termsAccepted"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  onClick={() => console.log('🔘 Create account button clicked!')}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {(isSubmitting || isLoading) && (
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg
                        className="animate-spin h-5 w-5 text-green-300"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </span>
                  )}
                  {(isSubmitting || isLoading) ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </Form>
          );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default RegisterForm;