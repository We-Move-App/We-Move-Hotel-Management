import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { tokenDecode } from "../utils/helperFunctions";

const AuthContext = createContext(null);

const readTokensFromStorage = () => {
  try {
    const tokens = JSON.parse(localStorage.getItem("WEMOVE_TOKEN"));
    const user = JSON.parse(localStorage.getItem("WEMOVE_USER"));
    return { tokens, user };
  } catch {
    return { tokens: null, user: null };
  }
};

const AuthContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState(undefined);
  const [tokens, setTokens] = useState(undefined);

  useEffect(() => {
    const { tokens: storedTokens, user: storedUser } = readTokensFromStorage();
    if (storedTokens?.accessToken && storedUser) {
      setTokens(storedTokens);
      setUser(storedUser);
      const status = storedUser?.verificationStatus === "approved";
      setIsAuthenticated(!!storedTokens.accessToken && status);
    } else {
      setTokens(undefined);
      setUser(undefined);
      setIsAuthenticated(false);
    }
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    function handleStorageEvent(e) {
      if (e.key === "WEMOVE_TOKEN" || e.key === "WEMOVE_USER") {
        const { tokens: newTokens, user: newUser } = readTokensFromStorage();
        setTokens(newTokens);
        setUser(newUser);
        const status = newUser?.verificationStatus === "approved";
        setIsAuthenticated(!!newTokens?.accessToken && status);
      }
    }
    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  const login = useCallback((tokenObj) => {
    if (!tokenObj) return;
    try {
      const decoded = tokenDecode(tokenObj.accessToken);
      localStorage.setItem("WEMOVE_TOKEN", JSON.stringify(tokenObj));
      localStorage.setItem("WEMOVE_USER", JSON.stringify(decoded));
      setTokens(tokenObj);
      setUser(decoded);
      const status = decoded?.verificationStatus === "approved";
      setIsAuthenticated(!!tokenObj?.accessToken && status);
    } catch (err) {
      console.error("login decode error", err);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("WEMOVE_TOKEN");
    localStorage.removeItem("WEMOVE_USER");
    localStorage.removeItem("WEMOVE_HOTELID");
    setTokens(undefined);
    setUser(undefined);
    setIsAuthenticated(false);
  }, []);

  const value = {
    isAuthenticated,
    isAuthLoading,
    user,
    tokens,
    login,
    logout,
    setIsAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthContext");
  return context;
}
