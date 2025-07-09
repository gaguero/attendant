import { useAuth } from './useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateVendorDto, UpdateVendorDto, Vendor } from '@attendandt/shared';

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

  if (response.status === 204) return null;
  return response.json();
};

export const useVendors = () => {
  const { tokens } = useAuth();
  const queryClient = useQueryClient();

  const getVendors = async (): Promise<Vendor[]> => {
    const res = await apiCall('/vendors', {
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
    });
    return res.data;
  };

  const createVendor = async (data: CreateVendorDto): Promise<Vendor> => {
    const res = await apiCall('/vendors', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
      body: JSON.stringify(data),
    });
    return res.data;
  };

  const updateVendor = async ({ id, ...data }: { id: string } & UpdateVendorDto): Promise<Vendor> => {
    const res = await apiCall(`/vendors/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
      body: JSON.stringify(data),
    });
    return res.data;
  };

  const deleteVendor = async (id: string): Promise<void> => {
    await apiCall(`/vendors/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokens?.accessToken}` },
    });
  };

  const { data: vendors, isLoading, error } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: getVendors,
    enabled: !!tokens?.accessToken,
  });

  const createMutation = useMutation<Vendor, Error, CreateVendorDto>({
    mutationFn: createVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });

  const updateMutation = useMutation<Vendor, Error, { id: string } & UpdateVendorDto>({
    mutationFn: updateVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });

  return {
    vendors,
    isLoading,
    error,
    createVendor: createMutation.mutate,
    isCreating: createMutation.isLoading,
    updateVendor: updateMutation.mutate,
    isUpdating: updateMutation.isLoading,
    deleteVendor: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
  } as const;
}; 