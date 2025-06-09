// Type definitions for @testing-library/react
import '@testing-library/jest-dom';

declare module '@testing-library/react' {
  export * from '@testing-library/react/types';
  export { render, renderHook, act, cleanup, fireEvent } from '@testing-library/react';
}

declare module '@testing-library/jest-dom' {
  export * from '@testing-library/jest-dom';
}

declare module '@testing-library/dom' {
  export * from '@testing-library/dom';
}
