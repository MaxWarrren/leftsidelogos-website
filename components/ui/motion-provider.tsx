import * as React from 'react';
import { MotionConfig, useReducedMotion } from 'framer-motion';

type MotionContextValue = {
  reducedMotion: boolean;
};

const MotionContext = React.createContext<MotionContextValue>({
  reducedMotion: false,
});

export function useMotionPreference() {
  return React.useContext(MotionContext);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionContext.Provider value={{ reducedMotion }}>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}
