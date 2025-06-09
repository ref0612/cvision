// Type definitions for Jest and Testing Library
import '@testing-library/jest-dom';

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
}

export {};
