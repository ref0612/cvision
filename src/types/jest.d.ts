// Jest Global Types
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

  interface Expect {
    // Add any custom matchers here
  }

  interface ExpectStatic {
    <T = any>(actual: T): JestMatchers<T>;
  }

  interface JestMatchers<T> {
    toBeInTheDocument(): void;
    toHaveClass(...classNames: string[]): void;
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): void;
    toBeVisible(): void;
    toBeDisabled(): void;
    toBeEnabled(): void;
    toHaveAttribute(attr: string, value?: any): void;
  }
}

// Declare the global expect function
declare const expect: jest.ExpectStatic;
