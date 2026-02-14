import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = 0 // CONNECTING
    setTimeout(() => {
      this.readyState = 1 // OPEN
      if (this.onopen) this.onopen()
    }, 100)
  }

  send(data) {
    // Mock send
  }

  close() {
    this.readyState = 3 // CLOSED
    if (this.onclose) this.onclose()
  }
}

global.WebSocket = MockWebSocket

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
