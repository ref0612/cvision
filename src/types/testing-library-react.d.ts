// This file helps TypeScript understand the testing-library/react module
declare module '@testing-library/react' {
  import { RenderResult, RenderOptions } from '@testing-library/react/types';
  
  export * from '@testing-library/react/types';
  
  export const render: (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'queries'>
  ) => RenderResult;
  
  export const renderHook: <TProps, TResult>(
    hook: (props: TProps) => TResult,
    options?: any
  ) => {
    result: { current: TResult };
    rerender: (newProps?: TProps) => void;
    unmount: () => void;
  };
  
  export const act: (callback: () => void) => void;
  export const cleanup: () => void;
  export const fireEvent: {
    [K in keyof HTMLElementEventMap]: (
      element: HTMLElement,
      event: HTMLElementEventMap[K]
    ) => void;
  };
}
