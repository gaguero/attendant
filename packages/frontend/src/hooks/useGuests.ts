import { useAuth } from './useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateGuestDto, UpdateGuestDto } from '@attendandt/shared';
import type { Guest } from '@attendandt/shared';

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

  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

export const useGuests = () => {
  const { tokens } = useAuth();
  const queryClient = useQueryClient();

  const getGuests = async (): Promise<Guest[]> => {
    const response = await apiCall('/guests', {
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
    });
    return response.data;
  };

  const createGuest = async (data: CreateGuestDto): Promise<Guest> => {
    const response = await apiCall('/guests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
      body: JSON.stringify(data),
    });
    return response.data;
  };

  const updateGuest = async ({ id, ...data }: { id: string } & UpdateGuestDto): Promise<Guest> => {
    const response = await apiCall(`/guests/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
      body: JSON.stringify(data),
    });
    return response.data;
  };

  const deleteGuest = async (id: string): Promise<void> => {
    await apiCall(`/guests/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
    });
  };

  const { data: guests, isLoading, error } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: getGuests,
    enabled: !!tokens?.accessToken,
  });

  const createMutation = useMutation<Guest, Error, CreateGuestDto>({
    mutationFn: createGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  const updateMutation = useMutation<Guest, Error, { id: string } & UpdateGuestDto>({
    mutationFn: updateGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  return {
    guests,
    isLoading,
    error,
    createGuest: createMutation.mutate,
    isCreating: createMutation.isLoading,
    createError: createMutation.error,
    updateGuest: updateMutation.mutate,
    isUpdating: updateMutation.isLoading,
    updateError: updateMutation.error,
    deleteGuest: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
    deleteError: deleteMutation.error,
  };
}; 