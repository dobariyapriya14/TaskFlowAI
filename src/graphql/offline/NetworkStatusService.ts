type NetworkStatusListener = (isOnline: boolean) => void;
type ReconnectionCallback = () => void;

export class NetworkStatusService {
  private online: boolean = true;
  private listeners: Set<NetworkStatusListener> = new Set();
  private reconnectionCallbacks: Set<ReconnectionCallback> = new Set();

  constructor(initialOnline: boolean = true) {
    this.online = initialOnline;
  }

  /**
   * Returns current connectivity status
   */
  public isOnline(): boolean {
    return this.online;
  }

  /**
   * Set online status programmatically (or from network change listeners)
   */
  public setOnline(status: boolean): void {
    const wasOffline = !this.online;
    this.online = status;
    this.notifyListeners();

    if (wasOffline && status) {
      this.triggerReconnectionCallbacks();
    }
  }

  /**
   * Toggle offline mode for testing or offline usage simulation
   */
  public toggleOffline(): boolean {
    this.setOnline(!this.online);
    return this.online;
  }

  /**
   * Subscribe to network status changes
   */
  public subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.online);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Register a callback to execute automatically when connectivity is restored
   */
  public onReconnected(callback: ReconnectionCallback): () => void {
    this.reconnectionCallbacks.add(callback);
    return () => {
      this.reconnectionCallbacks.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.online));
  }

  private triggerReconnectionCallbacks(): void {
    this.reconnectionCallbacks.forEach(async callback => {
      try {
        await callback();
      } catch (err) {
        console.warn('Error in reconnection callback:', err);
      }
    });
  }
}

export const networkStatusService = new NetworkStatusService(true);
