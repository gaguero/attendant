import React, { useState } from 'react';
import { useGuests } from '../../hooks/useGuests';
import type { Guest } from '@attendandt/shared';
import Modal from '../common/Modal';
import GuestForm from './GuestForm';

const GuestList: React.FC = () => {
  const { guests, isLoading, error, deleteGuest, isDeleting } = useGuests();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const handleOpenModal = (guest: Guest | null = null) => {
    setSelectedGuest(guest);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedGuest(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="text-center text-neutral-gray">
        Loading guests...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-error-red bg-red-100 rounded-lg">
        Error: {(error as Error).message}
      </div>
    );
  }

  return (
    <>
      <div className="bg-background-surface shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-midnight">
            Guest Directory
          </h2>
          <button onClick={() => handleOpenModal()} className="bg-secondary-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition">
            Add New Guest
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background-light">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-gray uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-gray uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-gray uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests?.map((guest: Guest) => (
                <tr key={guest.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary-midnight">{guest.firstName} {guest.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-dark-gray">{guest.email}</div>
                    <div className="text-sm text-neutral-gray">{guest.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      guest.status === 'ACTIVE' ? 'bg-green-100 text-success-green' :
                      guest.status === 'VIP' ? 'bg-purple-100 text-accent-purple' :
                      'bg-gray-100 text-neutral-gray'
                    }`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(guest)} className="text-secondary-teal hover:text-opacity-80">Edit</button>
                    <button onClick={() => deleteGuest(guest.id)} disabled={isDeleting} className="text-error-red hover:text-opacity-80 disabled:text-neutral-gray">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedGuest ? 'Edit Guest' : 'Add New Guest'}>
          <GuestForm guest={selectedGuest} onClose={handleCloseModal} />
        </Modal>
      )}
    </>
  );
};

export default GuestList; 