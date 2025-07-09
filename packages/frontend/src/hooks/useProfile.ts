import { useAuth } from './useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileDto, UpdateProfileDto } from '@attendandt/shared';

// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  // Handle cases with no response body
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
};

export const useProfile = () => {
  const { tokens } = useAuth();
  const queryClient = useQueryClient();

  const getProfile = async (): Promise<ProfileDto> => {
    const response = await apiCall('/profile/me', {
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
    });
    return response.data;
  };

  const updateProfile = async (data: UpdateProfileDto): Promise<ProfileDto> => {
    const response = await apiCall('/profile/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
      body: JSON.stringify(data),
    });
    return response.data;
  };

  const uploadAvatar = async (avatar: File): Promise<ProfileDto> => {
    const formData = new FormData();
    formData.append('avatar', avatar);

    const response = await apiCall('/profile/me/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
      body: formData,
    });
    return response.data;
  };
  
  const { data: profile, isLoading: isFetchingProfile, error: fetchError } = useQuery<ProfileDto>({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: !!tokens?.accessToken,
  });

  const { mutate: update, isLoading: isUpdatingProfile, error: updateError } = useMutation<ProfileDto, Error, UpdateProfileDto>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });

  const { mutate: upload, isLoading: isUploadingAvatar, error: uploadError } = useMutation<ProfileDto, Error, File>({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], (oldData: ProfileDto | undefined) =>
        oldData ? { ...oldData, avatarUrl: data.avatarUrl } : data
      );
    },
  });

  return {
    profile,
    isFetchingProfile,
    isUpdatingProfile,
    isUploadingAvatar,
    fetchError,
    updateError,
    uploadError,
    updateProfile: update,
    uploadAvatar: upload,
  };
}; 