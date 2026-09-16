import Constants from "expo-constants";
import { ApiClient } from "@grupo-j/api-client";
import * as SecureStore from "expo-secure-store";

export const ACCESS_TOKEN_KEY = "grupo_j_access_token";
export const REFRESH_TOKEN_KEY = "grupo_j_refresh_token";

const configuredUrl = process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl;
if (!configuredUrl || !/^https?:\/\//.test(configuredUrl)) {
  throw new Error("EXPO_PUBLIC_API_URL não configurada");
}

export const api = new ApiClient({
  baseUrl: configuredUrl,
  getAuthToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
});
