import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!key.trim()) {
      setError("Please enter admin key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Send key to backend for verification
      const response = await fetch("https://backend-final-project1-production.up.railway.app/api/admin/verify-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token or success flag in localStorage
        localStorage.setItem("admin_key", key);
        localStorage.setItem("admin_authenticated", "true");
        
        // Redirect to admin dashboard
        navigate("/admin", { replace: true });
      } else {
        setError(data.message || "Invalid admin key");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to verify key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Admin Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin key"
              disabled={loading}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;