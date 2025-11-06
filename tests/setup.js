/**
 * Test setup file
 * Runs before all tests
 */

import { vi } from 'vitest';

// Mock localStorage with actual storage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get _store() {
      return store;
    }
  };
})();

global.localStorage = localStorageMock;

// Mock navigator.clipboard
const clipboardMock = {
  writeText: vi.fn(() => Promise.resolve()),
  readText: vi.fn(() => Promise.resolve('')),
};

Object.defineProperty(global.navigator, 'clipboard', {
  value: clipboardMock,
  writable: true,
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  clipboardMock.writeText.mockClear();
  clipboardMock.readText.mockClear();
  URL.createObjectURL.mockClear();
  URL.revokeObjectURL.mockClear();
});
