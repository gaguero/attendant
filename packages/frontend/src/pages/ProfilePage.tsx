import React from 'react';
import ProfileForm from '../components/profile/ProfileForm';
import AvatarUpload from '../components/profile/AvatarUpload';

const ProfilePage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <ProfileForm />
        </div>
        <div>
          <AvatarUpload />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 