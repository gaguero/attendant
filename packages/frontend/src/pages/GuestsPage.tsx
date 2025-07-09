import React from 'react';
import GuestList from '../components/guests/GuestList';

const GuestsPage = () => {
  return (
    <div className="container mx-auto p-4 bg-background-light">
      <h1 className="text-3xl font-bold text-primary-midnight mb-6">Guest Management</h1>
      <GuestList />
    </div>
  );
};

export default GuestsPage; 