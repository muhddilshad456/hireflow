import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { setAccessToken } from "../services/tokenService";

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
};

type Props = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: Props) => {
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);

  const updateAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    setAccessToken(token);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: accessTokenState,
        setAccessToken: updateAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
