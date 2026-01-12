import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for admin key on mount
    const checkAdminStatus = () => {
      const adminKey = localStorage.getItem("admin_key");
      console.log("Checking admin key:", !!adminKey);
      setIsAdmin(!!adminKey);
      setIsLoading(false);
    };

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(checkAdminStatus, 100);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array - runs once

  const loginWithKey = (key) => {
    if (key && key.trim()) {
      localStorage.setItem("admin_key", key);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("admin_key");
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{ 
        isAdmin, 
        isLoading, 
        loginWithKey, 
        logout 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};