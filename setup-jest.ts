// Polyfill for structuredClone in Jest environment
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}

import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone/index.mjs';
import { TestBed } from '@angular/core/testing';

// ─────────────────────────────────────────────
// Mock browser APIs not implemented by JSDOM
// ─────────────────────────────────────────────
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// ─────────────────────────────────────────────
// Initialize Angular testing environment ONCE
// ─────────────────────────────────────────────
setupZoneTestEnv();

// ─────────────────────────────────────────────
// Ensure isolation between specs
// ─────────────────────────────────────────────
beforeEach(() => {
  // Reset browser state
  window.localStorage.clear();

  // Clear calls/instances but keep mock implementations
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────
// Reset Angular TestBed after each spec
// ─────────────────────────────────────────────
afterEach(() => {
  TestBed.resetTestingModule();
});
