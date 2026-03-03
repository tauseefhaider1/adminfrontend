import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // check if admin key exists in storage when component mounts
    const checkAdminStatus = () => {
      const adminKey = localStorage.getItem("admin_key");
      console.log("admin key present:", adminKey ? "yes" : "no");
      setIsAdmin(!!adminKey);
      setIsLoading(false);
    };

    // small delay just to be safe
    const timer = setTimeout(checkAdminStatus, 100);
    return () => clearTimeout(timer);
  }, []); // only run once

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