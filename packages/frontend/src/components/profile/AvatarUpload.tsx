import React, { useState, useRef, DragEvent } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useToast } from '../../context/ToastContext';

const AvatarUpload: React.FC = () => {
  const { profile, uploadAvatar, isUploadingAvatar, uploadError } = useProfile();
  const { showToast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
      uploadFile(file);
    }
  };

  const uploadFile = (file: File) => {
    uploadAvatar(file, {
      onSuccess: () => {
        setPreview(null);
        showToast('Avatar updated successfully!', 'success');
      },
      onError: (err) => {
        showToast(err.message || 'Failed to upload avatar', 'error');
      },
    });
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  let fallbackName = '';
  if (profile?.firstName || profile?.lastName) {
    fallbackName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
  } else if (profile?.email) {
    fallbackName = profile.email;
  }

  const currentAvatar = preview || profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">Profile Picture</h2>
      <img src={currentAvatar} alt="Avatar" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
      
      <div
        className={`border-2 ${isDragOver ? 'border-blue-400' : 'border-dashed border-gray-300'} rounded-md p-4 mb-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload avatar by click or drag and drop"
      >
        <p className="text-sm text-gray-600">Drag & drop an image here, or click to select</p>
      </div>
      
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="avatar-upload" />

      {preview && (
        <div className="mt-4 flex flex-col items-center space-y-3">
          <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
          <button onClick={handleUpload} disabled={isUploadingAvatar} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
            {isUploadingAvatar ? 'Uploading...' : 'Upload New Picture'}
          </button>
        </div>
      )}
      
      {uploadError && <p className="text-red-500 mt-2">{uploadError.message}</p>}
    </div>
  );
};

export default AvatarUpload; 