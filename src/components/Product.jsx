import { useEffect, useState } from "react";
import adminApi from "../api/Azios";
import AdminAddProduct from "./AdminAddProduct";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      console.log("Fetching products...");
      const res = await adminApi.get("/api/product");
      console.log("Products API response:", res.data);
      
      let productsList = [];
      
      // Handle multiple response formats
      if (Array.isArray(res.data)) {
        // Direct array response
        productsList = res.data;
      } else if (Array.isArray(res.data?.products)) {
        // {products: [...]}
        productsList = res.data.products;
      } else if (Array.isArray(res.data?.data)) {
        // {data: [...]}
        productsList = res.data.data;
      } else if (res.data?.success && Array.isArray(res.data?.data)) {
        // {success: true, data: [...]}
        productsList = res.data.data;
      } else if (Array.isArray(res.data?.data?.products)) {
        // {data: {products: [...]}}
        productsList = res.data.data.products;
      }
      
      console.log("Processed products:", productsList);
      setProducts(productsList);
      
      if (productsList.length === 0) {
        console.warn("No products found in response");
      }
      
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Failed to load products: " + (err.response?.data?.message || err.message));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await adminApi.delete(`/product/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      alert("Product deleted successfully!");
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || "Please try again"));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Products</h1>
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Products</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <AdminAddProduct onAdded={fetchProducts} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">All Products ({products.length})</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border">
            <p className="text-gray-500">No products found. Add your first product above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3 text-left">Image</th>
                  <th className="border p-3 text-left">Name</th>
                  <th className="border p-3 text-left">Price</th>
                  <th className="border p-3 text-left">Stock</th>
                  <th className="border p-3 text-left">Category</th>
                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="border p-3">
                      <img
                        src={
                          p.image?.startsWith("http") 
                            ? p.image 
                            : `http://localhost:4534${p.image || ""}`
                        }
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/64?text=No+Image";
                        }}
                      />
                    </td>
                    <td className="border p-3">
                      <div className="font-medium">{p.name}</div>
                      {p.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="border p-3 font-medium">
                      Rs {p.price?.toLocaleString() || "0"}
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="text-sm text-gray-500 line-through">
                          Rs {p.originalPrice?.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="border p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.stockStatus === "in"
                          ? "bg-green-100 text-green-800"
                          : p.stockStatus === "limited"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {p.stockStatus === "in" ? "In Stock" : 
                         p.stockStatus === "limited" ? "Limited" : 
                         "Out of Stock"}
                      </span>
                    </td>
                    <td className="border p-3">
                      {p.category ? (
                        typeof p.category === "object" ? (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {p.category.title || p.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">ID: {p.category}</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">No category</span>
                      )}
                    </td>
                    <td className="border p-3">
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border text-sm">
        <h3 className="font-medium mb-2">Debug Information:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <strong>Products Count:</strong> {products.length}
          </div>
          <div>
            <strong>Backend:</strong> http://localhost:4534
          </div>
          <div>
            <strong>Endpoint:</strong> /product
          </div>
          <div>
            <button
              onClick={() => {
                console.log("Current products:", products);
                fetchProducts();
              }}
              className="text-blue-600 hover:underline"
            >
              Refresh & Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}