import React, { useState } from 'react';
import { Vendor } from '@attendandt/shared';
import { useVendors } from '../../hooks/useVendors';
import Modal from '../common/Modal';
import VendorForm from './VendorForm';

const VendorDirectory: React.FC = () => {
  const { vendors, isLoading, error, deleteVendor, isDeleting } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (vendor: Vendor | null = null) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedVendor(null);
    setIsModalOpen(false);
  };

  if (isLoading) return <p className="text-center text-neutral-gray">Loading vendors…</p>;
  if (error) return <p className="text-center text-error-red">Error: {(error as Error).message}</p>;

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-midnight">Vendors</h2>
          <button onClick={() => openModal()} className="bg-secondary-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">Add Vendor</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-gray uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-gray uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-gray uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-gray uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3"> </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors?.map(vendor => (
                <tr key={vendor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-midnight">{vendor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{vendor.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{vendor.rating?.toFixed(1)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {vendor.email && <div>{vendor.email}</div>}
                    {vendor.phone && <div className="text-neutral-gray text-xs">{vendor.phone}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button className="text-secondary-teal hover:text-opacity-80" onClick={() => openModal(vendor)}>Edit</button>
                    <button className="text-error-red hover:text-opacity-80 disabled:text-neutral-gray" onClick={() => deleteVendor(vendor.id)} disabled={isDeleting}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedVendor ? 'Edit Vendor' : 'Add Vendor'}>
          <VendorForm vendor={selectedVendor} onClose={closeModal} />
        </Modal>
      )}
    </>
  );
};

export default VendorDirectory; 