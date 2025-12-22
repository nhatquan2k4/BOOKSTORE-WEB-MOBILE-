import * as signalR from '@microsoft/signalr';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5276';
const HUB_URL = `${API_BASE_URL}/hubs/notifications`;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Khởi tạo kết nối SignalR
   */
  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('[SignalR] Already connected');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token || '',
        skipNegotiation: false, // Cho phép negotiate để tự động chọn transport tốt nhất
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s
          return Math.min(2000 * Math.pow(2, retryContext.previousRetryCount), 32000);
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Event handlers
    this.connection.onclose((error) => {
      console.log('[SignalR] Connection closed', error);
      this.handleReconnect();
    });

    this.connection.onreconnecting((error) => {
      console.log('[SignalR] Reconnecting...', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('[SignalR] Reconnected with ID:', connectionId);
      this.reconnectAttempts = 0;
    });

    try {
      await this.connection.start();
      console.log('[SignalR] Connected successfully to:', HUB_URL);
      console.log('[SignalR] Connection ID:', this.connection.connectionId);
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('[SignalR] Connection failed:', error);
      this.handleReconnect();
      throw error;
    }
  }

  /**
   * Xử lý reconnect khi mất kết nối
   */
  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SignalR] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts), 32000);
    
    console.log(`[SignalR] Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('[SignalR] Reconnect failed:', error);
      }
    }, delay);
  }

  /**
   * Đăng ký lắng nghe sự kiện từ server
   */
  on(eventName: string, callback: (...args: any[]) => void): void {
    if (!this.connection) {
      console.error('[SignalR] Connection not initialized');
      return;
    }

    this.connection.on(eventName, callback);
    console.log(`[SignalR] Listening to event: ${eventName}`);
  }

  /**
   * Hủy đăng ký sự kiện
   */
  off(eventName: string, callback: (...args: any[]) => void): void {
    if (!this.connection) {
      return;
    }

    this.connection.off(eventName, callback);
    console.log(`[SignalR] Stopped listening to event: ${eventName}`);
  }

  /**
   * Gửi tin nhắn lên server
   */
  async invoke(methodName: string, ...args: any[]): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.error('[SignalR] Not connected');
      return;
    }

    try {
      await this.connection.invoke(methodName, ...args);
      console.log(`[SignalR] Invoked method: ${methodName}`, args);
    } catch (error) {
      console.error(`[SignalR] Failed to invoke ${methodName}:`, error);
      throw error;
    }
  }

  /**
   * Ngắt kết nối
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('[SignalR] Disconnected');
      } catch (error) {
        console.error('[SignalR] Disconnect failed:', error);
      }
      this.connection = null;
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Lấy connection instance (nếu cần dùng trực tiếp)
   */
  getConnection(): signalR.HubConnection | null {
    return this.connection;
  }
}

// Export singleton instance
export const signalRService = new SignalRService();
