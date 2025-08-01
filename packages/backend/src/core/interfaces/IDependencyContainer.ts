import type { ILogger } from './ILogger.js'
import type { ICache } from './ICache.js'
import type { IUserRepository } from './repositories/IUserRepository.js'
import type { IUserService } from './services/IUserService.js'
import type { IGuestService } from './services/IGuestService.js'

export interface IDependencyContainer {
  // Core infrastructure
  logger: ILogger
  cache: ICache
  
  // Repositories
  userRepository: IUserRepository
  // guestRepository: IGuestRepository (to be implemented)
  // vendorRepository: IVendorRepository (to be implemented)
  
  // Services
  userService: IUserService
  guestService: IGuestService
  // vendorService: IVendorService (to be implemented)
  
  // Utility methods
  resolve<T>(token: symbol | string): T
  register<T>(token: symbol | string, implementation: T): void
}