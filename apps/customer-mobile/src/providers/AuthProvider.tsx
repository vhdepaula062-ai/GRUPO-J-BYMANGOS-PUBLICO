import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { ApiClientError } from "@grupo-j/api-client";
import { api, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../lib/api";

type SessionUser = { id: string; fullName: string; email: string; roles: string[] };
type LoginResult = { accessToken: string; refreshToken: string; user: SessionUser };
type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  isInitialized: boolean;
  signIn(identifier: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  restore(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY }),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY })
  ]);
}

async function clearTokens() {
  await Promise.all([SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY), SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)]);
}

function withTimeout<T>(promise: Promise<T>, ms = 3500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Network timeout")), ms))
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const restore = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (!accessToken) {
        setUser(null);
        return;
      }

      try {
        const response = await withTimeout(api.get<SessionUser>("/api/v1/auth/session"));
        setUser(response.data);
      } catch (sessionError: any) {
        // Se a sessão expirou, tenta o refresh token
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          await clearTokens();
          setUser(null);
          return;
        }

        try {
          const refreshed = await withTimeout(
            api.refreshSession<{ accessToken: string; refreshToken: string }>(refreshToken)
          );
          await persistTokens(refreshed.data.accessToken, refreshed.data.refreshToken);
          const response = await withTimeout(api.get<SessionUser>("/api/v1/auth/session"));
          setUser(response.data);
        } catch (refreshError: any) {
          // Apenas limpa tokens se for explicitamente rejeitado pelo servidor (401/403)
          const isExplicitAuthRejection =
            refreshError instanceof ApiClientError &&
            (refreshError.problem.status === 401 || refreshError.problem.status === 403);

          if (isExplicitAuthRejection) {
            await clearTokens();
            setUser(null);
          } else {
            // Em caso de falha de conexão ou timeout de rede, NÃO descarta os tokens do usuário
            console.warn("[Auth] Restauração offline ou timeout. Tokens preservados.");
            setUser(null);
          }
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => { void restore(); }, [restore]);

  const signIn = useCallback(async (identifier: string, password: string) => {
    const response = await api.login<LoginResult>(identifier, password);
    await persistTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);
  }, []);

  const signOut = useCallback(async () => {
    try { await api.logout(); } finally { await clearTokens(); setUser(null); }
  }, []);

  const value = useMemo(
    () => ({ user, loading, isInitialized, signIn, signOut, restore }),
    [user, loading, isInitialized, signIn, signOut, restore]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth precisa ser usado dentro de AuthProvider");
  return value;
}

