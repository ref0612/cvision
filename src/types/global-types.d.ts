// This file contains global type definitions for the project

// Type definitions for @testing-library/react
import '@testing-library/jest-dom';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveAttribute(attr: string, value?: any): R;
    }
  }

  // Global expect function
  const expect: jest.Expect;

  // Add other global types as needed
  interface Window {
    // Add any window extensions here
  }
}

// This export is needed for TypeScript to treat this as a module
export {};
