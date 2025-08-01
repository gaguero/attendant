// packages/backend/src/services/sync.service.ts
import { logger } from '../lib/logger';

class SyncService {
  public handleMewsEvent(event: any) {
    logger.info('Handling Mews event:', event);
    // TODO: Implement event handling logic
  }
}

export const syncService = new SyncService();
