import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenvConfig();

// Define the schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),
  
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required').optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // Server
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // CORS
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:5173'),
  
  // Redis (optional for now, required in Step 18)
  REDIS_URL: z.string().optional(),
  
  // SMTP configuration for password reset emails
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required').default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int()).default('587'),
  SMTP_SECURE: z.string().transform((val) => val === 'true').pipe(z.boolean()).default('false'),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
});

// Validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

// Export validated config
export const config = parseResult.data;

// Export email config
export const emailConfig = {
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
} as const;

// Export individual config sections for convenience
export const dbConfig = {
  url: config.DATABASE_URL,
  directUrl: config.DIRECT_URL,
} as const;

export const supabaseConfig = {
  url: config.SUPABASE_URL,
  anonKey: config.SUPABASE_ANON_KEY,
  serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
} as const;

export const serverConfig = {
  port: config.PORT,
  nodeEnv: config.NODE_ENV,
  frontendUrl: config.FRONTEND_URL,
  jwtSecret: config.JWT_SECRET,
} as const;

export const redisConfig = {
  url: config.REDIS_URL,
} as const;

// Type exports for better TypeScript support
export type Config = typeof config;
export type DbConfig = typeof dbConfig;
export type SupabaseConfig = typeof supabaseConfig;
export type ServerConfig = typeof serverConfig;
export type RedisConfig = typeof redisConfig;

export default config; 