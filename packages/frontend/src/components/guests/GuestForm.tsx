import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useGuests } from '../../hooks/useGuests';
import { CreateGuestDto, UpdateGuestDto, GuestStatus } from '@attendandt/shared';
import { type Guest } from '@attendandt/shared';
import Modal from '../common/Modal';

interface GuestFormProps {
  guest?: Guest | null;
  onClose: () => void;
}

const GuestSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string(),
  status: Yup.string().oneOf(Object.values(GuestStatus)).required('Status is required'),
});

const formInputStyle = "h-[48px] w-full px-md py-sm border border-neutral-gray rounded-form bg-background-surface text-primary-midnight placeholder-neutral-gray focus:outline-none focus:ring-2 focus:ring-secondary-teal";

const GuestForm: React.FC<GuestFormProps> = ({ guest, onClose }) => {
  const { createGuest, updateGuest, isCreating, isUpdating } = useGuests();

  const initialValues: CreateGuestDto | UpdateGuestDto = {
    firstName: guest?.firstName || '',
    lastName: guest?.lastName || '',
    email: guest?.email || '',
    phone: guest?.phone || '',
    status: guest?.status || GuestStatus.ACTIVE,
  };

  const handleSubmit = async (values: CreateGuestDto | UpdateGuestDto) => {
    try {
      if (guest) {
        await updateGuest({ id: guest.id, ...values as UpdateGuestDto });
      } else {
        await createGuest(values as CreateGuestDto);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save guest:", error);
      // Here you could set an error state to display in the form
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={GuestSchema} onSubmit={handleSubmit} enableReinitialize>
      {() => (
        <Form className="space-y-md">
          <div>
            <label htmlFor="firstName" className="text-body-s text-dark-gray mb-xs block">First Name</label>
            <Field id="firstName" name="firstName" placeholder="John" className={formInputStyle} />
            <ErrorMessage name="firstName" component="p" className="text-error-red text-body-s mt-xs" />
          </div>

          <div>
            <label htmlFor="lastName" className="text-body-s text-dark-gray mb-xs block">Last Name</label>
            <Field id="lastName" name="lastName" placeholder="Doe" className={formInputStyle} />
            <ErrorMessage name="lastName" component="p" className="text-error-red text-body-s mt-xs" />
          </div>

          <div>
            <label htmlFor="email" className="text-body-s text-dark-gray mb-xs block">Email Address</label>
            <Field id="email" name="email" type="email" placeholder="john.doe@example.com" className={formInputStyle} />
            <ErrorMessage name="email" component="p" className="text-error-red text-body-s mt-xs" />
          </div>

          <div>
            <label htmlFor="phone" className="text-body-s text-dark-gray mb-xs block">Phone Number</label>
            <Field id="phone" name="phone" placeholder="(123) 456-7890" className={formInputStyle} />
            <ErrorMessage name="phone" component="p" className="text-error-red text-body-s mt-xs" />
          </div>
          
          <div>
            <label htmlFor="status" className="text-body-s text-dark-gray mb-xs block">Status</label>
            <Field as="select" id="status" name="status" className={formInputStyle}>
              {Object.values(GuestStatus).map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</option>
              ))}
            </Field>
          </div>
          
          <div className="flex justify-end space-x-md pt-md">
            <button type="button" onClick={onClose} className="h-[48px] px-lg bg-transparent text-primary-midnight rounded-form hover:bg-secondary-teal-light text-button">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isCreating || isUpdating} 
              className="h-[48px] px-lg bg-secondary-teal text-white rounded-form hover:bg-opacity-90 disabled:bg-neutral-gray/50 disabled:text-white/70 text-button"
            >
              {isCreating || isUpdating ? 'Saving...' : (guest ? 'Update Guest' : 'Create Guest')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default GuestForm; 