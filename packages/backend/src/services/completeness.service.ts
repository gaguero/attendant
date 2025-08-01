import { PrismaClient, User, Guest, Vendor, CompletenessConfig } from '@prisma/client';

export interface CompletenessResult {
  score: number; // 0-100
  gaps: string[];
  lastCheck: Date;
}

export interface FieldWeight {
  field: string;
  weight: number; // 0-100
  required: boolean;
}

export class CompletenessService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Calculate completeness score for a user profile
   */
  async calculateUserCompleteness(user: User): Promise<CompletenessResult> {
    const config = await this.getCompletenessConfig('User');
    const gaps: string[] = [];
    let totalWeight = 0;
    let earnedWeight = 0;

    // Check required fields
    for (const field of config.requiredFields) {
      const weight = this.getFieldWeight(config.fieldWeights, field);
      totalWeight += weight;
      
      if (!this.hasValue(user, field)) {
        gaps.push(field);
      } else {
        earnedWeight += weight;
      }
    }

    // Check optional fields
    for (const field of config.optionalFields) {
      const weight = this.getFieldWeight(config.fieldWeights, field);
      totalWeight += weight;
      
      if (this.hasValue(user, field)) {
        earnedWeight += weight;
      }
    }

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    return {
      score,
      gaps,
      lastCheck: new Date()
    };
  }

  /**
   * Calculate completeness score for a guest profile
   */
  async calculateGuestCompleteness(guest: Guest): Promise<CompletenessResult> {
    const config = await this.getCompletenessConfig('Guest');
    const gaps: string[] = [];
    let totalWeight = 0;
    let earnedWeight = 0;

    // Check required fields
    for (const field of config.requiredFields) {
      const weight = this.getFieldWeight(config.fieldWeights, field);
      totalWeight += weight;
      
      if (!this.hasValue(guest, field)) {
        gaps.push(field);
      } else {
        earnedWeight += weight;
      }
    }

    // Check optional fields
    for (const field of config.optionalFields) {
      const weight = this.getFieldWeight(config.fieldWeights, field);
      totalWeight += weight;
      
      if (this.hasValue(guest, field)) {
        earnedWeight += weight;
      }
    }

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    return {
      score,
      gaps,
      lastCheck: new Date()
    };
  }

  /**
   * Calculate completeness score for a vendor profile
   */
  async calculateVendorCompleteness(vendor: Vendor): Promise<CompletenessResult> {
    const config = await this.getCompletenessConfig('Vendor');
    const gaps: string[] = [];
    let totalWeight = 0;
    let earnedWeight = 0;

    // Check required fields
    for (const field of config.requiredFields) {
      const weight = this.getFieldWeight(config.fieldWeights, field);
      totalWeight += weight;
      
      if (!this.hasValue(vendor, field)) {
        gaps.push(field);
      } else {
        earnedWeight += weight;
      }
    }

    // Check optional fields
    for (const field of config.optionalFields) {
      const weight = this.getFieldWeight(config.fieldWeights, field);
      totalWeight += weight;
      
      if (this.hasValue(vendor, field)) {
        earnedWeight += weight;
      }
    }

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    return {
      score,
      gaps,
      lastCheck: new Date()
    };
  }

  /**
   * Update completeness scores for all entities
   */
  async updateAllCompletenessScores(): Promise<void> {
    // Update users
    const users = await this.prisma.user.findMany();
    for (const user of users) {
      const result = await this.calculateUserCompleteness(user);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          profileCompleteness: result.score,
          lastCompletenessCheck: result.lastCheck
        }
      });
    }

    // Update guests
    const guests = await this.prisma.guest.findMany();
    for (const guest of guests) {
      const result = await this.calculateGuestCompleteness(guest);
      await this.prisma.guest.update({
        where: { id: guest.id },
        data: {
          profileCompleteness: result.score,
          lastCompletenessCheck: result.lastCheck,
          dataGaps: result.gaps
        }
      });
    }

    // Update vendors
    const vendors = await this.prisma.vendor.findMany();
    for (const vendor of vendors) {
      const result = await this.calculateVendorCompleteness(vendor);
      await this.prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          // Note: Vendor model doesn't have profileCompleteness field yet
          // This would need to be added to the schema
        }
      });
    }
  }

  /**
   * Get or create completeness configuration for an entity type
   */
  private async getCompletenessConfig(entityType: string): Promise<CompletenessConfig> {
    let config = await this.prisma.completenessConfig.findUnique({
      where: { entityType }
    });

    if (!config) {
      config = await this.createDefaultConfig(entityType);
    }

    return config;
  }

  /**
   * Create default completeness configuration
   */
  private async createDefaultConfig(entityType: string): Promise<CompletenessConfig> {
    const defaultConfigs = {
      User: {
        fieldWeights: {
          email: 20,
          firstName: 15,
          lastName: 15,
          phone: 10,
          addressLine1: 8,
          city: 8,
          country: 8,
          preferences: 6,
          notes: 5,
          bio: 5
        },
        requiredFields: ['email', 'firstName', 'lastName'],
        optionalFields: ['phone', 'addressLine1', 'city', 'country', 'preferences', 'notes', 'bio']
      },
      Guest: {
        fieldWeights: {
          email: 20,
          firstName: 15,
          lastName: 15,
          phone: 12,
          dateOfBirth: 10,
          addressLine1: 8,
          city: 8,
          country: 8,
          preferences: 4
        },
        requiredFields: ['email', 'firstName', 'lastName'],
        optionalFields: ['phone', 'dateOfBirth', 'addressLine1', 'city', 'country', 'preferences']
      },
      Vendor: {
        fieldWeights: {
          name: 25,
          contactPerson: 20,
          phone: 15,
          email: 15,
          category: 10,
          servicesOffered: 10,
          website: 5
        },
        requiredFields: ['name', 'contactPerson'],
        optionalFields: ['phone', 'email', 'category', 'servicesOffered', 'website']
      }
    };

    const config = defaultConfigs[entityType as keyof typeof defaultConfigs];
    
    return await this.prisma.completenessConfig.create({
      data: {
        entityType,
        fieldWeights: config.fieldWeights,
        requiredFields: config.requiredFields,
        optionalFields: config.optionalFields
      }
    });
  }

  /**
   * Get field weight from configuration
   */
  private getFieldWeight(fieldWeights: any, field: string): number {
    return fieldWeights[field] || 1;
  }

  /**
   * Check if a field has a value
   */
  private hasValue(entity: any, field: string): boolean {
    const value = entity[field];
    
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    
    return true;
  }
} 