import React from 'react';
import VendorDirectory from '../components/vendors/VendorDirectory';

const VendorsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 bg-background-light">
      <h1 className="text-3xl font-bold text-primary-midnight mb-6">Vendor Management</h1>
      <VendorDirectory />
    </div>
  );
};

export default VendorsPage; 