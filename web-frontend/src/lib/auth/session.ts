// Small auth session service to centralize token/user storage and auth operations
import { authApi } from "@/lib/api/auth";
import type {
  LoginRequest,
  AuthResponse,
  User,
  RefreshTokenRequest,
} from "@/types/user";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const authService = {
  login: async (data: LoginRequest): Promise<User> => {
    const response = (await authApi.login(data)) as AuthResponse;

    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response.user;
  },

  logout: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  clearSession: (): void => {
    authService.logout();
  },

  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  setSessionFromResponse: (resp: AuthResponse): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, resp.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, resp.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(resp.user));
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<void> => {
    const resp = (await authApi.refreshToken(data)) as AuthResponse;
    authService.setSessionFromResponse(resp);
  },
};

export default authService;
