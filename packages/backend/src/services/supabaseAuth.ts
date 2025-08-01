import { supabaseAdmin } from '../lib/supabase.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { UserRole } from '@attendandt/shared';

export interface SupabaseUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export class SupabaseAuthService {
  /**
   * Register a new user using Supabase Auth
   */
  static async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }) {
    try {
      const { email, password, firstName, lastName, role = UserRole.STAFF } = userData;

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true, // Auto-confirm email for development
        user_metadata: {
          firstName,
          lastName,
          role
        }
      });

      if (authError) {
        logger.error('Supabase Auth registration failed', { error: authError, email });
        if (authError.code === 'email_exists') {
          throw new Error('A user with this email address has already been registered');
        }
        throw new Error(`Registration failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user data returned from Supabase');
      }

      // 2. Check if user already exists in our public.users table
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
      });

      // 3. If user doesn't exist, create them
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: authData.user.id, // Use Supabase user ID as our primary key
            email: email.toLowerCase(),
            firstName: firstName || null,
            lastName: lastName || null,
            role,
            authId: authData.user.id, // Reference to the auth.users table
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          }
        });
      }

      logger.info('User registered successfully with Supabase Auth', {
        userId: user.id,
        email: user.email,
      });

      return {
        data: user,
        error: null
      };

    } catch (error) {
      logger.error('Registration error', { error, email: userData.email });
      return {
        data: null,
        error: error as Error
      };
    }
  }

  /**
   * Sign in user using Supabase Auth
   */
  static async signIn(email: string, password: string) {
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (authError) {
        logger.warn('Supabase Auth sign in failed', { error: authError, email });
        throw new Error(`Login failed: ${authError.message}`);
      }

      if (!authData.user || !authData.session) {
        throw new Error('No user or session data returned from Supabase');
      }

      // 2. Get user data from our database
      const user = await prisma.user.findUnique({
        where: { authId: authData.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        }
      });

      if (!user) {
        throw new Error('User not found in database');
      }

      logger.info('User signed in successfully', {
        userId: user.id,
        email: user.email,
      });

      return {
        user,
        session: authData.session,
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token
      };

    } catch (error) {
      logger.error('Sign in error', { error, email });
      throw error;
    }
  }

  /**
   * Verify JWT token with Supabase
   */
  static async verifyToken(token: string) {
    try {
      const { data: userData, error } = await supabaseAdmin.auth.getUser(token);

      if (error) {
        throw new Error(`Token verification failed: ${error.message}`);
      }

      if (!userData.user) {
        throw new Error('No user data found');
      }

      // Get user from our database
      const user = await prisma.user.findUnique({
        where: { authId: userData.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        }
      });

      if (!user) {
        throw new Error('User not found in database');
      }

      return user;
    } catch (error) {
      logger.error('Token verification error', { error });
      throw error;
    }
  }

  /**
   * Sign out user
   */
  static async signOut(token: string) {
    try {
      await supabaseAdmin.auth.admin.signOut(token);
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out error', { error });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        throw new Error(`Token refresh failed: ${error.message}`);
      }

      return {
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        expiresIn: data.session?.expires_in
      };
    } catch (error) {
      logger.error('Token refresh error', { error });
      throw error;
    }
  }
}