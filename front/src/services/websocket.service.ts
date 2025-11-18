import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/auth.store'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

class WebSocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  connect() {
    const authStore = useAuthStore()
    
    if (!authStore.token) {
      console.warn('No auth token available for WebSocket connection')
      return
    }

    this.socket = io(WS_URL, {
      auth: {
        token: authStore.token,
      },
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })

    // Setup event listeners
    this.setupEventListeners()
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.listeners.clear()
  }

  private setupEventListeners() {
    if (!this.socket) return

    const events = [
      'user:connected',
      'user:disconnected',
      'vocabulary:created',
      'vocabulary:updated',
      'vocabulary:deleted',
      'vocabulary:pinned',
      'vocabulary:bydate:refresh',
      'practice:completed',
      'user:typing',
      'user:theme:changed',
      'history:created',
      'history:deleted',
      // category realtime events
      'category:created',
      'category:updated',
      'category:deleted',
      'category:pinned',
      // tag realtime events
      'tag:created',
      'tag:updated',
      'tag:deleted',
      'user:profile:updated',
      'user:layout:changed',
    ]

    events.forEach((event) => {
      this.socket!.on(event, (data) => {
        this.notifyListeners(event, data)
      })
    })
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data))
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const websocketService = new WebSocketService()
