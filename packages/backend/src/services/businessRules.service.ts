import { PrismaClient, RuleType } from '@prisma/client';
import type { BusinessRule } from '@prisma/client';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RuleConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
  customValidator?: string; // Function name or expression
}

export class BusinessRulesService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Validate an entity against all active business rules
   */
  async validateEntity(entityType: string, entityData: any): Promise<ValidationResult> {
    const rules = await this.prisma.businessRule.findMany({
      where: {
        entityType,
        isActive: true
      },
      orderBy: {
        priority: 'desc'
      }
    });

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    for (const rule of rules) {
      const fieldValue = entityData[rule.field];
      const validation = this.validateField(fieldValue, rule);

      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push(`${rule.field}: ${validation.message}`);
      } else if (validation.warning) {
        result.warnings.push(`${rule.field}: ${validation.warning}`);
      }
    }

    return result;
  }

  /**
   * Validate a single field against a rule
   */
  private validateField(value: any, rule: BusinessRule): { isValid: boolean; message?: string; warning?: string } {
    const config = rule.ruleConfig as RuleConfig;

    switch (rule.ruleType) {
      case RuleType.REQUIRED:
        return this.validateRequired(value, config);
      
      case RuleType.FORMAT:
        return this.validateFormat(value, config);
      
      case RuleType.RANGE:
        return this.validateRange(value, config);
      
      case RuleType.CUSTOM:
        return this.validateCustom(value, config);
      
      default:
        return { isValid: true };
    }
  }

  /**
   * Validate required field
   */
  private validateRequired(value: any, config: RuleConfig): { isValid: boolean; message?: string } {
    if (config.required && (value === null || value === undefined || value === '')) {
      return {
        isValid: false,
        message: 'This field is required'
      };
    }
    return { isValid: true };
  }

  /**
   * Validate format (string length, pattern)
   */
  private validateFormat(value: any, config: RuleConfig): { isValid: boolean; message?: string; warning?: string } {
    if (value === null || value === undefined || value === '') {
      return { isValid: true }; // Skip empty values for format validation
    }

    const stringValue = String(value);

    // Check min length
    if (config.minLength && stringValue.length < config.minLength) {
      return {
        isValid: false,
        message: `Minimum length is ${config.minLength} characters`
      };
    }

    // Check max length
    if (config.maxLength && stringValue.length > config.maxLength) {
      return {
        isValid: false,
        message: `Maximum length is ${config.maxLength} characters`
      };
    }

    // Check pattern
    if (config.pattern) {
      const regex = new RegExp(config.pattern);
      if (!regex.test(stringValue)) {
        return {
          isValid: false,
          message: 'Format is invalid'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate range (numeric values)
   */
  private validateRange(value: any, config: RuleConfig): { isValid: boolean; message?: string } {
    if (value === null || value === undefined || value === '') {
      return { isValid: true }; // Skip empty values for range validation
    }

    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      return {
        isValid: false,
        message: 'Value must be a number'
      };
    }

    // Check min value
    if (config.minValue !== undefined && numericValue < config.minValue) {
      return {
        isValid: false,
        message: `Minimum value is ${config.minValue}`
      };
    }

    // Check max value
    if (config.maxValue !== undefined && numericValue > config.maxValue) {
      return {
        isValid: false,
        message: `Maximum value is ${config.maxValue}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate custom rule
   */
  private validateCustom(value: any, config: RuleConfig): { isValid: boolean; message?: string } {
    if (!config.customValidator) {
      return { isValid: true };
    }

    // This is a simplified implementation
    // In a real system, you might want to use a more sophisticated expression evaluator
    try {
      // For now, we'll implement some common custom validators
      switch (config.customValidator) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            return {
              isValid: false,
              message: 'Invalid email format'
            };
          }
          break;

        case 'phone':
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(String(value).replace(/\s/g, ''))) {
            return {
              isValid: false,
              message: 'Invalid phone number format'
            };
          }
          break;

        case 'url':
          try {
            new URL(String(value));
          } catch {
            return {
              isValid: false,
              message: 'Invalid URL format'
            };
          }
          break;

        default:
          // Unknown custom validator
          return { isValid: true };
      }
    } catch (error) {
      return {
        isValid: false,
        message: 'Custom validation failed'
      };
    }

    return { isValid: true };
  }

  /**
   * Create a new business rule
   */
  async createRule(data: {
    name: string;
    description?: string;
    entityType: string;
    field: string;
    ruleType: RuleType;
    ruleConfig: RuleConfig;
    isActive?: boolean;
    priority?: number;
  }): Promise<BusinessRule> {
    return await this.prisma.businessRule.create({
      data: {
        name: data.name,
        description: data.description,
        entityType: data.entityType,
        field: data.field,
        ruleType: data.ruleType,
        ruleConfig: data.ruleConfig,
        isActive: data.isActive ?? true,
        priority: data.priority ?? 0
      }
    });
  }

  /**
   * Update a business rule
   */
  async updateRule(id: string, data: Partial<BusinessRule>): Promise<BusinessRule> {
    return await this.prisma.businessRule.update({
      where: { id },
      data
    });
  }

  /**
   * Delete a business rule
   */
  async deleteRule(id: string): Promise<void> {
    await this.prisma.businessRule.delete({
      where: { id }
    });
  }

  /**
   * Get all rules for an entity type
   */
  async getRulesForEntity(entityType: string): Promise<BusinessRule[]> {
    return await this.prisma.businessRule.findMany({
      where: { entityType },
      orderBy: { priority: 'desc' }
    });
  }

  /**
   * Create default business rules for common validations
   */
  async createDefaultRules(): Promise<void> {
    const defaultRules = [
      // User rules
      {
        name: 'User Email Required',
        description: 'User email is required and must be valid',
        entityType: 'User',
        field: 'email',
        ruleType: RuleType.REQUIRED,
        ruleConfig: { required: true },
        priority: 100
      },
      {
        name: 'User Email Format',
        description: 'User email must be in valid format',
        entityType: 'User',
        field: 'email',
        ruleType: RuleType.CUSTOM,
        ruleConfig: { customValidator: 'email' },
        priority: 90
      },
      {
        name: 'User Name Required',
        description: 'User first and last name are required',
        entityType: 'User',
        field: 'firstName',
        ruleType: RuleType.REQUIRED,
        ruleConfig: { required: true },
        priority: 80
      },
      {
        name: 'User Phone Format',
        description: 'User phone number must be in valid format',
        entityType: 'User',
        field: 'phone',
        ruleType: RuleType.CUSTOM,
        ruleConfig: { customValidator: 'phone' },
        priority: 70
      },

      // Guest rules
      {
        name: 'Guest Email Required',
        description: 'Guest email is required and must be valid',
        entityType: 'Guest',
        field: 'email',
        ruleType: RuleType.REQUIRED,
        ruleConfig: { required: true },
        priority: 100
      },
      {
        name: 'Guest Email Format',
        description: 'Guest email must be in valid format',
        entityType: 'Guest',
        field: 'email',
        ruleType: RuleType.CUSTOM,
        ruleConfig: { customValidator: 'email' },
        priority: 90
      },
      {
        name: 'Guest Name Required',
        description: 'Guest first and last name are required',
        entityType: 'Guest',
        field: 'firstName',
        ruleType: RuleType.REQUIRED,
        ruleConfig: { required: true },
        priority: 80
      },
      {
        name: 'Guest Phone Format',
        description: 'Guest phone number must be in valid format',
        entityType: 'Guest',
        field: 'phone',
        ruleType: RuleType.CUSTOM,
        ruleConfig: { customValidator: 'phone' },
        priority: 70
      },

      // Vendor rules
      {
        name: 'Vendor Name Required',
        description: 'Vendor name is required',
        entityType: 'Vendor',
        field: 'name',
        ruleType: RuleType.REQUIRED,
        ruleConfig: { required: true },
        priority: 100
      },
      {
        name: 'Vendor Contact Required',
        description: 'Vendor contact person is required',
        entityType: 'Vendor',
        field: 'contactPerson',
        ruleType: RuleType.REQUIRED,
        ruleConfig: { required: true },
        priority: 90
      },
      {
        name: 'Vendor Email Format',
        description: 'Vendor email must be in valid format',
        entityType: 'Vendor',
        field: 'email',
        ruleType: RuleType.CUSTOM,
        ruleConfig: { customValidator: 'email' },
        priority: 70
      },
      {
        name: 'Vendor Phone Format',
        description: 'Vendor phone number must be in valid format',
        entityType: 'Vendor',
        field: 'phone',
        ruleType: RuleType.CUSTOM,
        ruleConfig: { customValidator: 'phone' },
        priority: 60
      },
      {
        name: 'Vendor Website Format',
        description: 'Vendor website must be in valid URL format',
        entityType: 'Vendor',
        field: 'website',
        ruleType: RuleType.CUSTOM,
        ruleConfig: { customValidator: 'url' },
        priority: 50
      }
    ];

    for (const ruleData of defaultRules) {
      try {
        await this.createRule(ruleData);
      } catch (error) {
        // Rule might already exist, skip
        console.log(`Rule ${ruleData.name} might already exist:`, error);
      }
    }
  }
} 