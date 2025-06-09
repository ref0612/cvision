// Testing Library setup
import '@testing-library/jest-dom';

// Configuraciones globales para los tests
beforeEach(() => {
  // Configuraciones antes de cada prueba
});

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

// Mock Next.js Router
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Clear all mocks after each test
afterEach(() => {
  // Limpieza después de cada prueba
  jest.clearAllMocks();
});
