import { createContext, useContext, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

import {
  outlineBorder,
  outlineBorderFocused,
  outlineBorderPressed,
  outlineSurface,
  welcomeOutlineBorder,
  welcomeOutlineBorderFocused,
} from '../../theme/surface';

type AuthOutlineContextValue = {
  /** Белая рамка при focus или заполнении (только на Welcome). */
  fieldBorder: (focused: boolean, filled?: boolean) => ViewStyle | undefined;
  /** Белая рамка у выбранного чипа/checkbox (только на Welcome). */
  selectedBorder: ViewStyle | undefined;
};

const defaultValue: AuthOutlineContextValue = {
  fieldBorder: (focused) => (focused ? outlineBorderFocused : undefined),
  selectedBorder: undefined,
};

const welcomeValue: AuthOutlineContextValue = {
  fieldBorder: (focused, filled = false) => {
    if (focused) {
      return welcomeOutlineBorderFocused;
    }
    if (filled) {
      return welcomeOutlineBorder;
    }
    return undefined;
  },
  selectedBorder: welcomeOutlineBorderFocused,
};

const AuthOutlineContext = createContext<AuthOutlineContextValue>(defaultValue);

export function AuthOutlineProvider({ children }: { children: ReactNode }) {
  return (
    <AuthOutlineContext.Provider value={welcomeValue}>
      {children}
    </AuthOutlineContext.Provider>
  );
}

/** На Welcome: белая рамка только у focus / filled / selected. */
export function useAuthOutline(): AuthOutlineContextValue {
  return useContext(AuthOutlineContext);
}
