import '@testing-library/jest-dom';

// Mock de ResizeObserver para evitar errores en tests
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock de fetch para tests
global.fetch = vi.fn();

// Mock básico de framer-motion para evitar errores en tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }) => children,
}));
