// Type definitions for @testing-library/dom
declare module '@testing-library/dom' {
  export * from '@testing-library/dom/types';
  
  // Re-export the screen object with all its methods
  export const screen: {
    getByText: any;
    getByRole: any;
    queryByText: any;
    queryByRole: any;
    // Add other methods as needed
    [key: string]: any;
  };
  
  // Add other exports as needed
  export const getByText: any;
  export const getByRole: any;
  export const queryByText: any;
  export const queryByRole: any;
}
