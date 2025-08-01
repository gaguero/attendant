// packages/backend/src/lib/mews.ws.ts
import WebSocket from 'ws';
import { mewsConfig } from '../config';
import { logger } from './logger';
import { syncService } from '../services/sync.service';

const MEWS_WEBSOCKET_URL = 'wss://ws.mews-demo.com';

class MewsWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectInterval = 5000; // 5 seconds

  public connect() {
    this.ws = new WebSocket(MEWS_WEBSOCKET_URL, {
      headers: {
        'Authorization': `Bearer ${mewsConfig.accessToken}`,
      },
    });

    this.ws.on('open', () => {
      logger.info('Connected to Mews WebSocket');
      // TODO: Send subscription message if required by Mews API
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        syncService.handleMewsEvent(message);
      } catch (error) {
        logger.error('Error parsing Mews WebSocket message:', error);
      }
    });

    this.ws.on('error', (error) => {
      logger.error('Mews WebSocket error:', error);
    });

    this.ws.on('close', (code, reason) => {
      logger.warn(`Mews WebSocket closed. Code: ${code}, Reason: ${reason}. Reconnecting...`);
      this.reconnect();
    });
  }

  private reconnect() {
    setTimeout(() => {
      logger.info('Attempting to reconnect to Mews WebSocket...');
      this.connect();
    }, this.reconnectInterval);
  }
}

export const mewsWebSocketClient = new MewsWebSocketClient();
