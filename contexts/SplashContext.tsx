import { createContext, useContext, type ReactNode } from 'react';

type SplashContextValue = {
  splashDone: boolean;
};

const SplashContext = createContext<SplashContextValue>({ splashDone: true });

type SplashProviderProps = {
  splashDone: boolean;
  children: ReactNode;
};

export function SplashProvider({ splashDone, children }: SplashProviderProps) {
  return (
    <SplashContext.Provider value={{ splashDone }}>{children}</SplashContext.Provider>
  );
}

export function useSplashDone(): boolean {
  return useContext(SplashContext).splashDone;
}
