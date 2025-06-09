// Global type definitions for Jest and Testing Library
declare namespace jest {
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

// This is required for TypeScript to recognize the global `expect`
declare const expect: jest.Expect;
