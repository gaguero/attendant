import { PrismaClient, MewsSyncLog, SyncDirection, SyncStatus } from '@prisma/client';
import { CompletenessService } from './completeness.service';
import { BusinessRulesService } from './businessRules.service';

export interface SyncResult {
  success: boolean;
  entityId: string;
  entityType: string;
  operation: string;
  errors?: string[];
  warnings?: string[];
  completenessScore?: number;
  dataGaps?: string[];
}

export interface MewsGuestData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateOrProvince?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: any;
  notes?: string;
}

export interface MewsUserData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateOrProvince?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: any;
  notes?: string;
}

export class EnhancedSyncService {
  private prisma: PrismaClient;
  private completenessService: CompletenessService;
  private businessRulesService: BusinessRulesService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.completenessService = new CompletenessService(prisma);
    this.businessRulesService = new BusinessRulesService(prisma);
  }

  /**
   * Sync guest data from Mews
   */
  async syncGuestFromMews(mewsData: MewsGuestData): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      entityId: '',
      entityType: 'Guest',
      operation: 'SYNC'
    };

    try {
      // Check if guest already exists
      let guest = await this.prisma.guest.findFirst({
        where: { mewsId: mewsData.id }
      });

      // Transform Mews data to platform format
      const guestData = this.transformMewsGuestData(mewsData);

      // Validate data against business rules
      const validation = await this.businessRulesService.validateEntity('Guest', guestData);
      
      if (!validation.isValid) {
        result.errors = validation.errors;
        result.warnings = validation.warnings;
        
        // Log sync attempt with validation errors
        await this.logSyncOperation({
          entityType: 'Guest',
          entityId: guest?.id || 'unknown',
          operation: 'SYNC',
          direction: SyncDirection.INBOUND,
          status: SyncStatus.FAILED,
          mewsEventId: mewsData.id,
          mewsData,
          platformData: guestData,
          errorMessage: validation.errors.join(', ')
        });

        return result;
      }

      if (guest) {
        // Update existing guest
        guest = await this.prisma.guest.update({
          where: { id: guest.id },
          data: {
            ...guestData,
            syncedAt: new Date(),
            syncStatus: SyncStatus.SYNCED
          }
        });
        result.operation = 'UPDATE';
      } else {
        // Create new guest
        guest = await this.prisma.guest.create({
          data: {
            ...guestData,
            mewsId: mewsData.id,
            syncedAt: new Date(),
            syncStatus: SyncStatus.SYNCED,
            createdById: 'system' // You might want to get this from context
          }
        });
        result.operation = 'CREATE';
      }

      // Calculate completeness score
      const completeness = await this.completenessService.calculateGuestCompleteness(guest);
      
      // Update guest with completeness data
      await this.prisma.guest.update({
        where: { id: guest.id },
        data: {
          profileCompleteness: completeness.score,
          lastCompletenessCheck: completeness.lastCheck,
          dataGaps: completeness.gaps
        }
      });

      result.success = true;
      result.entityId = guest.id;
      result.completenessScore = completeness.score;
      result.dataGaps = completeness.gaps;
      result.warnings = validation.warnings;

      // Log successful sync
      await this.logSyncOperation({
        entityType: 'Guest',
        entityId: guest.id,
        operation: result.operation,
        direction: SyncDirection.INBOUND,
        status: SyncStatus.SYNCED,
        mewsEventId: mewsData.id,
        mewsData,
        platformData: guestData
      });

    } catch (error) {
      result.errors = [error instanceof Error ? error.message : 'Unknown error'];
      
      // Log sync error
      await this.logSyncOperation({
        entityType: 'Guest',
        entityId: result.entityId || 'unknown',
        operation: 'SYNC',
        direction: SyncDirection.INBOUND,
        status: SyncStatus.FAILED,
        mewsEventId: mewsData.id,
        mewsData,
        errorMessage: result.errors[0]
      });
    }

    return result;
  }

  /**
   * Sync user data from Mews
   */
  async syncUserFromMews(mewsData: MewsUserData): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      entityId: '',
      entityType: 'User',
      operation: 'SYNC'
    };

    try {
      // Check if user already exists
      let user = await this.prisma.user.findFirst({
        where: { mewsId: mewsData.id }
      });

      // Transform Mews data to platform format
      const userData = this.transformMewsUserData(mewsData);

      // Validate data against business rules
      const validation = await this.businessRulesService.validateEntity('User', userData);
      
      if (!validation.isValid) {
        result.errors = validation.errors;
        result.warnings = validation.warnings;
        
        // Log sync attempt with validation errors
        await this.logSyncOperation({
          entityType: 'User',
          entityId: user?.id || 'unknown',
          operation: 'SYNC',
          direction: SyncDirection.INBOUND,
          status: SyncStatus.FAILED,
          mewsEventId: mewsData.id,
          mewsData,
          platformData: userData,
          errorMessage: validation.errors.join(', ')
        });

        return result;
      }

      if (user) {
        // Update existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            ...userData,
            syncedAt: new Date(),
            syncStatus: SyncStatus.SYNCED
          }
        });
        result.operation = 'UPDATE';
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            ...userData,
            mewsId: mewsData.id,
            syncedAt: new Date(),
            syncStatus: SyncStatus.SYNCED
          }
        });
        result.operation = 'CREATE';
      }

      // Calculate completeness score
      const completeness = await this.completenessService.calculateUserCompleteness(user);
      
      // Update user with completeness data
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          profileCompleteness: completeness.score,
          lastCompletenessCheck: completeness.lastCheck
        }
      });

      result.success = true;
      result.entityId = user.id;
      result.completenessScore = completeness.score;
      result.dataGaps = completeness.gaps;
      result.warnings = validation.warnings;

      // Log successful sync
      await this.logSyncOperation({
        entityType: 'User',
        entityId: user.id,
        operation: result.operation,
        direction: SyncDirection.INBOUND,
        status: SyncStatus.SYNCED,
        mewsEventId: mewsData.id,
        mewsData,
        platformData: userData
      });

    } catch (error) {
      result.errors = [error instanceof Error ? error.message : 'Unknown error'];
      
      // Log sync error
      await this.logSyncOperation({
        entityType: 'User',
        entityId: result.entityId || 'unknown',
        operation: 'SYNC',
        direction: SyncDirection.INBOUND,
        status: SyncStatus.FAILED,
        mewsEventId: mewsData.id,
        mewsData,
        errorMessage: result.errors[0]
      });
    }

    return result;
  }

  /**
   * Transform Mews guest data to platform format
   */
  private transformMewsGuestData(mewsData: MewsGuestData): any {
    return {
      firstName: mewsData.firstName || '',
      lastName: mewsData.lastName || '',
      email: mewsData.email || '',
      phone: mewsData.phone,
      dateOfBirth: mewsData.dateOfBirth ? new Date(mewsData.dateOfBirth) : null,
      addressLine1: mewsData.address?.addressLine1,
      addressLine2: mewsData.address?.addressLine2,
      city: mewsData.address?.city,
      stateOrProvince: mewsData.address?.stateOrProvince,
      postalCode: mewsData.address?.postalCode,
      country: mewsData.address?.country,
      preferences: mewsData.preferences,
      notes: mewsData.notes
    };
  }

  /**
   * Transform Mews user data to platform format
   */
  private transformMewsUserData(mewsData: MewsUserData): any {
    return {
      firstName: mewsData.firstName || '',
      lastName: mewsData.lastName || '',
      email: mewsData.email || '',
      phone: mewsData.phone,
      addressLine1: mewsData.address?.addressLine1,
      addressLine2: mewsData.address?.addressLine2,
      city: mewsData.address?.city,
      stateOrProvince: mewsData.address?.stateOrProvince,
      postalCode: mewsData.address?.postalCode,
      country: mewsData.address?.country,
      preferences: mewsData.preferences,
      notes: mewsData.notes
    };
  }

  /**
   * Log sync operation
   */
  private async logSyncOperation(data: {
    entityType: string;
    entityId: string;
    operation: string;
    direction: SyncDirection;
    status: SyncStatus;
    mewsEventId?: string;
    mewsData?: any;
    platformData?: any;
    errorMessage?: string;
  }): Promise<MewsSyncLog> {
    return await this.prisma.mewsSyncLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        operation: data.operation,
        direction: data.direction,
        status: data.status,
        mewsEventId: data.mewsEventId,
        mewsData: data.mewsData,
        platformData: data.platformData,
        errorMessage: data.errorMessage,
        retryCount: 0
      }
    });
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(): Promise<{
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageCompleteness: number;
    recentErrors: string[];
  }> {
    const [
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      averageCompleteness,
      recentErrors
    ] = await Promise.all([
      this.prisma.mewsSyncLog.count(),
      this.prisma.mewsSyncLog.count({ where: { status: SyncStatus.SYNCED } }),
      this.prisma.mewsSyncLog.count({ where: { status: SyncStatus.FAILED } }),
      this.prisma.guest.aggregate({
        _avg: { profileCompleteness: true }
      }),
      this.prisma.mewsSyncLog.findMany({
        where: { 
          status: SyncStatus.FAILED,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        },
        select: { errorMessage: true },
        take: 10
      })
    ]);

    return {
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      averageCompleteness: averageCompleteness._avg.profileCompleteness || 0,
      recentErrors: recentErrors.map(log => log.errorMessage || 'Unknown error')
    };
  }

  /**
   * Retry failed sync operations
   */
  async retryFailedSyncs(): Promise<number> {
    const failedSyncs = await this.prisma.mewsSyncLog.findMany({
      where: { 
        status: SyncStatus.FAILED,
        retryCount: { lt: 3 } // Max 3 retries
      }
    });

    let retryCount = 0;
    for (const syncLog of failedSyncs) {
      try {
        // Update retry count
        await this.prisma.mewsSyncLog.update({
          where: { id: syncLog.id },
          data: { retryCount: syncLog.retryCount + 1 }
        });

        // Here you would implement the actual retry logic
        // For now, we'll just mark it as retried
        retryCount++;
      } catch (error) {
        console.error(`Failed to retry sync ${syncLog.id}:`, error);
      }
    }

    return retryCount;
  }
} 