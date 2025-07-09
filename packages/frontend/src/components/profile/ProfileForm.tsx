import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useProfile } from '../../hooks/useProfile';
import { UpdateProfileDto } from '@attendandt/shared';
import { useToast } from '../../context/ToastContext';

const profileSchema = Yup.object().shape({
  firstName: Yup.string().max(50, 'First name is too long'),
  lastName: Yup.string().max(50, 'Last name is too long'),
  bio: Yup.string().max(500, 'Bio is too long'),
  phone: Yup.string().max(25, 'Phone number is too long'),
  addressLine1: Yup.string().max(100, 'Address line is too long'),
  addressLine2: Yup.string().max(100, 'Address line is too long'),
  city: Yup.string().max(50, 'City name too long'),
  stateOrProvince: Yup.string().max(50, 'State/Province too long'),
  postalCode: Yup.string().max(20, 'Postal/Zip too long'),
  country: Yup.string().max(50, 'Country name too long'),
  notes: Yup.string().max(1000, 'Notes too long'),
  theme: Yup.string().max(20, 'Theme string too long'),
});

const ProfileForm: React.FC = () => {
  const { profile, updateProfile, isFetchingProfile, isUpdatingProfile, fetchError, updateError } = useProfile();
  const { showToast } = useToast();

  if (isFetchingProfile) {
    return <div>Loading profile...</div>;
  }

  if (fetchError) {
    return <div>Error fetching profile: {fetchError.message}</div>;
  }

  const initialValues: UpdateProfileDto = {
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    addressLine1: profile?.addressLine1 || '',
    addressLine2: profile?.addressLine2 || '',
    city: profile?.city || '',
    stateOrProvince: profile?.stateOrProvince || '',
    postalCode: profile?.postalCode || '',
    country: profile?.country || '',
    preferences: profile?.preferences || {},
    notes: profile?.notes || '',
    theme: profile?.theme || '',
  } as unknown as UpdateProfileDto;

  const handleSubmit = (values: UpdateProfileDto) => {
    updateProfile(values, {
      onSuccess: () => {
        showToast('Profile updated successfully', 'success');
      },
      onError: (err) => {
        showToast(err.message || 'Failed to update profile', 'error');
      },
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={profileSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-6">
            {updateError && <p className="text-red-500">{updateError.message}</p>}
            
            {/* Personal Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <Field id="firstName" name="firstName" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                <ErrorMessage name="firstName" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <Field id="lastName" name="lastName" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                <ErrorMessage name="lastName" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <Field id="bio" name="bio" as="textarea" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                <p className="text-xs text-gray-500 mt-1">Max 500 characters</p>
                <ErrorMessage name="bio" component="p" className="text-red-500 text-xs mt-1" />
              </div>
            </div>

            {/* Contact Section */}
            <h3 className="text-lg font-semibold">Contact</h3>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <Field id="phone" name="phone" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              <ErrorMessage name="phone" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Address Section */}
            <h3 className="text-lg font-semibold">Address</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <Field id="addressLine1" name="addressLine1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                <ErrorMessage name="addressLine1" component="p" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
                <Field id="addressLine2" name="addressLine2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                <ErrorMessage name="addressLine2" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <Field id="city" name="city" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  <ErrorMessage name="city" component="p" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="stateOrProvince" className="block text-sm font-medium text-gray-700">State / Province</label>
                  <Field id="stateOrProvince" name="stateOrProvince" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  <ErrorMessage name="stateOrProvince" component="p" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <Field id="postalCode" name="postalCode" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  <ErrorMessage name="postalCode" component="p" className="text-red-500 text-xs mt-1" />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <Field id="country" name="country" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                <ErrorMessage name="country" component="p" className="text-red-500 text-xs mt-1" />
              </div>
            </div>

            {/* Misc Section */}
            <h3 className="text-lg font-semibold">Preferences & Notes</h3>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <Field id="notes" name="notes" as="textarea" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              <ErrorMessage name="notes" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</label>
              <Field id="theme" name="theme" as="select" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value="">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Field>
              <ErrorMessage name="theme" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <button type="submit" disabled={isUpdatingProfile} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfileForm; 