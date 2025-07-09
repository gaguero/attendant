import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CreateVendorDto, UpdateVendorDto, VendorCategory, type Vendor } from '@attendandt/shared';
import { useVendors } from '../../hooks/useVendors';
import Modal from '../common/Modal';

interface VendorFormProps {
  vendor?: Vendor | null;
  onClose: () => void;
}

const VendorSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  category: Yup.string().oneOf(Object.values(VendorCategory)),
  rating: Yup.number().min(0).max(5),
  phone: Yup.string(),
  email: Yup.string().email('Invalid email'),
  website: Yup.string().url('Invalid URL'),
  notes: Yup.string(),
});

const formInput =
  'h-[44px] w-full px-md py-sm border border-neutral-gray rounded-form bg-background-surface placeholder-neutral-gray focus:outline-none focus:ring-2 focus:ring-secondary-teal';

const VendorForm: React.FC<VendorFormProps> = ({ vendor, onClose }) => {
  const { createVendor, updateVendor, isCreating, isUpdating } = useVendors();

  const initialValues: CreateVendorDto | UpdateVendorDto = {
    name: vendor?.name || '',
    category: vendor?.category || VendorCategory.OTHER,
    rating: vendor?.rating ?? 0,
    phone: vendor?.phone || '',
    email: vendor?.email || '',
    website: vendor?.website || '',
    notes: vendor?.notes || '',
  };

  const handleSubmit = async (values: CreateVendorDto | UpdateVendorDto) => {
    try {
      if (vendor) {
        await updateVendor({ id: vendor.id, ...values });
      } else {
        await createVendor(values as CreateVendorDto);
      }
      onClose();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={VendorSchema} onSubmit={handleSubmit} enableReinitialize>
      {() => (
        <Form className="space-y-md">
          <div>
            <label htmlFor="name" className="text-sm text-dark-gray mb-xs block">Name</label>
            <Field id="name" name="name" className={formInput} />
            <ErrorMessage name="name" component="p" className="text-error-red text-xs mt-xs" />
          </div>

          <div>
            <label htmlFor="category" className="text-sm text-dark-gray mb-xs block">Category</label>
            <Field as="select" id="category" name="category" className={formInput}>
              {Object.values(VendorCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Field>
          </div>

          <div>
            <label htmlFor="rating" className="text-sm text-dark-gray mb-xs block">Rating (0-5)</label>
            <Field id="rating" name="rating" type="number" step="0.1" className={formInput} />
            <ErrorMessage name="rating" component="p" className="text-error-red text-xs mt-xs" />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm text-dark-gray mb-xs block">Phone</label>
            <Field id="phone" name="phone" className={formInput} />
          </div>

          <div>
            <label htmlFor="email" className="text-sm text-dark-gray mb-xs block">Email</label>
            <Field id="email" name="email" type="email" className={formInput} />
            <ErrorMessage name="email" component="p" className="text-error-red text-xs mt-xs" />
          </div>

          <div>
            <label htmlFor="website" className="text-sm text-dark-gray mb-xs block">Website</label>
            <Field id="website" name="website" className={formInput} />
          </div>

          <div>
            <label htmlFor="notes" className="text-sm text-dark-gray mb-xs block">Notes</label>
            <Field as="textarea" id="notes" name="notes" rows={3} className={formInput} />
          </div>

          <div className="flex justify-end space-x-md pt-md">
            <button type="button" onClick={onClose} className="h-[44px] px-lg bg-transparent text-primary-midnight rounded-form hover:bg-secondary-teal-light">Cancel</button>
            <button type="submit" disabled={isCreating || isUpdating} className="h-[44px] px-lg bg-secondary-teal text-white rounded-form hover:bg-opacity-90 disabled:bg-neutral-gray/50">
              {isCreating || isUpdating ? 'Saving…' : vendor ? 'Update Vendor' : 'Create Vendor'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default VendorForm; 