import { httpClient } from './http';
import type { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from '@attendandt/shared';

export const loginApi = (credentials: LoginDto) => {
  return httpClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const registerApi = (data: RegisterDto) => {
  return httpClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const refreshTokenApi = (data: RefreshTokenDto) => {
  return httpClient('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const forgotPasswordApi = (data: ForgotPasswordDto) => {
    return httpClient('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const resetPasswordApi = (data: ResetPasswordDto) => {
    return httpClient('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const logoutApi = (data: RefreshTokenDto) => {
    return httpClient('/auth/logout', {
        method: 'POST',
        body: JSON.stringify(data),
    }, true); // This call needs to be authenticated
}; 