import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const adminKey = localStorage.getItem("admin_key");
        
        if (!adminKey) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Verify with backend
        const response = await fetch("/api/admin/check-auth", {
          headers: {
            "Authorization": `Bearer ${adminKey}`,
          },
        });

        if (response.ok) {
          setIsAdmin(true);
        } else {
          localStorage.removeItem("admin_key");
          localStorage.removeItem("admin_authenticated");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}