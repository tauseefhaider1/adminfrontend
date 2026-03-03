// admin/src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../api/Azios";

const LoginPage = () => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // don't let them submit empty key
    if (!key.trim()) {
      setError("please enter the admin key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await adminApi.post("/api/admin/verify-key", { key });

      if (response.data.success) {
        // save the key for future requests
        localStorage.setItem("admin_key", key);
        localStorage.setItem("admin_authenticated", "true");
        
        console.log("login successful");
        
        // send them to dashboard
        navigate("/admin", { replace: true });
      } else {
        setError(response.data.message || "wrong key, try again");
      }
    } catch (err) {
      console.log("login error:", err);
      
      // handle different types of errors
      if (err.response?.status === 401) {
        setError("invalid admin key");
      } else if (err.code === 'ERR_NETWORK') {
        setError("can't reach the server - is it running?");
      } else {
        setError(err.response?.data?.message || "something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
        {/* logo and header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-2">enter your key to access dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Admin Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="enter your key here"
              disabled={loading}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                checking...
              </div>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>

        {/* small helper text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          need a key? contact your admin
        </p>
      </div>
    </div>
  );
};

export default LoginPage;