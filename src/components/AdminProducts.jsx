import { useState, useEffect } from "react";
import adminApi from "../api/Azios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stockStatus: "in",
    category: "",
    discount: "",
    originalPrice: "",
    topRated: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatingProduct, setUpdatingProduct] = useState(false);

  const BACKEND_URL = "https://backend-final-project1-production.up.railway.app";

  // Fetch products
  const fetchProducts = async () => {
    try {
      console.log("📦 Fetching products...");
      const res = await adminApi.get("/api/product");
      console.log("✅ Products API response:", res.data);
      
      let productsList = [];
      
      // Handle multiple response formats
      if (Array.isArray(res.data)) {
        productsList = res.data;
      } else if (Array.isArray(res.data?.products)) {
        productsList = res.data.products;
      } else if (Array.isArray(res.data?.data)) {
        productsList = res.data.data;
      } else if (res.data?.success && Array.isArray(res.data?.data)) {
        productsList = res.data.data;
      } else if (Array.isArray(res.data?.data?.products)) {
        productsList = res.data.data.products;
      } else if (res.data?.data && typeof res.data.data === 'object') {
        // If data is an object, extract values
        productsList = Object.values(res.data.data);
      }
      
      console.log("🔄 Processed products:", productsList);
      setProducts(productsList);
      
      if (productsList.length === 0) {
        console.warn("⚠️ No products found in response");
      }
      
    } catch (err) {
      console.error("❌ Fetch products error:", err);
      console.error("Error details:", err.response?.data);
      setError("Failed to load products: " + (err.response?.data?.message || err.message));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log("📋 Fetching categories...");
      const res = await adminApi.get("/api/categories");
      console.log("✅ Categories response:", res.data);
      
      let categoriesData = [];
      if (Array.isArray(res.data)) {
        categoriesData = res.data;
      } else if (Array.isArray(res.data?.categories)) {
        categoriesData = res.data.categories;
      } else if (Array.isArray(res.data?.data)) {
        categoriesData = res.data.data;
      }
      
      setCategories(categoriesData);
    } catch (err) {
      console.error("❌ Fetch categories error:", err);
      console.error("Error details:", err.response?.data);
      setError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        setError("Please select an image file (PNG, JPG, JPEG, GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      stockStatus: "in",
      category: "",
      discount: "",
      originalPrice: "",
      topRated: false,
    });
    setImageFile(null);
    setImagePreview("");
    setEditingProduct(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      await handleUpdate(e);
    } else {
      await handleAdd(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddingProduct(true);
    setError("");

    try {
      // Validation
      if (!formData.name.trim()) {
        setError("Please enter product name");
        setAddingProduct(false);
        return;
      }

      if (!formData.price) {
        setError("Please enter price");
        setAddingProduct(false);
        return;
      }

      if (!formData.category) {
        setError("Please select a category");
        setAddingProduct(false);
        return;
      }

      if (!imageFile) {
        setError("Please select an image");
        setAddingProduct(false);
        return;
      }

      const price = Number(formData.price);
      if (isNaN(price) || price < 0) {
        setError("Price must be a positive number");
        setAddingProduct(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("price", price.toString());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("stockStatus", formData.stockStatus);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("image", imageFile);
      
      // Optional fields
      if (formData.discount) {
        formDataToSend.append("discount", formData.discount);
      }
      if (formData.originalPrice) {
        const originalPrice = Number(formData.originalPrice);
        formDataToSend.append("originalPrice", originalPrice.toString());
      }
      formDataToSend.append("topRated", formData.topRated.toString());

      // Log what we're sending
      console.log("📤 Sending product data:");
      console.log("Name:", formData.name);
      console.log("Price:", price);
      console.log("Category:", formData.category);
      console.log("Stock Status:", formData.stockStatus);
      console.log("Image:", imageFile.name, imageFile.type, `${(imageFile.size / 1024).toFixed(2)} KB`);
      console.log("Top Rated:", formData.topRated);

      // Debug FormData
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      try {
        console.log("🚀 Making POST request to /api/product...");
        const res = await adminApi.post("/api/product", formDataToSend, {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout for large images
        });
        
        console.log("✅ Add product response:", res.data);
        console.log("Response status:", res.status);
        
        if (res.status === 201 || res.status === 200 || res.data?.success) {
          alert("✅ Product added successfully!");
          resetForm();
          await fetchProducts();
        } else {
          setError(res.data?.message || "Failed to add product");
        }
      } catch (apiError) {
        console.error("❌ API Error details:", apiError);
        console.error("❌ Response data:", apiError.response?.data);
        console.error("❌ Response status:", apiError.response?.status);
        console.error("❌ Response headers:", apiError.response?.headers);
        
        if (apiError.response?.status === 500) {
          // Try alternative endpoint
          console.log("🔄 Trying alternative endpoint /product...");
          try {
            const resAlt = await adminApi.post("/product", formDataToSend, {
              headers: { 
                "Content-Type": "multipart/form-data",
              },
            });
            
            console.log("✅ Alternative endpoint response:", resAlt.data);
            if (resAlt.status === 201 || resAlt.status === 200) {
              alert("✅ Product added successfully!");
              resetForm();
              await fetchProducts();
              return;
            }
          } catch (altError) {
            console.error("❌ Alternative endpoint also failed:", altError);
          }
        }
        
        // Show detailed error
        const errorMsg = apiError.response?.data?.message || 
                        apiError.response?.data?.error ||
                        apiError.message ||
                        "Server error (500). Check backend logs.";
        
        setError(`Add failed: ${errorMsg}`);
        
        // Show additional debug info
        if (apiError.response?.data) {
          console.error("Full error response:", apiError.response.data);
        }
      }
      
    } catch (err) {
      console.error("❌ Unexpected error in handleAdd:", err);
      setError("Something went wrong: " + err.message);
    } finally {
      setAddingProduct(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProduct(true);
    setError("");

    try {
      if (!formData.name.trim() || !formData.price || !formData.category) {
        setError("Please fill in all required fields");
        setUpdatingProduct(false);
        return;
      }

      const price = Number(formData.price);
      if (isNaN(price) || price < 0) {
        setError("Price must be a positive number");
        setUpdatingProduct(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("price", price.toString());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("stockStatus", formData.stockStatus);
      formDataToSend.append("category", formData.category);
      
      // Add image only if a new one is selected
      if (imageFile && imageFile !== "existing") {
        formDataToSend.append("image", imageFile);
      }
      
      // Optional fields
      if (formData.discount) formDataToSend.append("discount", formData.discount);
      if (formData.originalPrice) {
        const originalPrice = Number(formData.originalPrice);
        formDataToSend.append("originalPrice", originalPrice.toString());
      }
      formDataToSend.append("topRated", formData.topRated.toString());

      console.log("📤 Updating product:", editingProduct._id);
      
      const res = await adminApi.put(`/api/product/${editingProduct._id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("✅ Update response:", res.data);
      
      if (res.status === 200 || res.data?.success) {
        alert("✅ Product updated successfully!");
        resetForm();
        await fetchProducts();
      } else {
        setError(res.data?.message || "Failed to update product");
      }
    } catch (err) {
      console.error("❌ Update product error:", err);
      console.error("Error details:", err.response?.data);
      setError("Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingProduct(false);
    }
  };

  const editProduct = async (id) => {
    try {
      console.log("✏️ Editing product ID:", id);
      const res = await adminApi.get(`/api/product/${id}`);
      console.log("✅ Product data for edit:", res.data);
      
      const product = res.data.product || res.data.data || res.data;
      
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        price: product.price || "",
        description: product.description || "",
        stockStatus: product.stockStatus || "in",
        category: product.category?._id || product.category || "",
        discount: product.discount || "",
        originalPrice: product.originalPrice || "",
        topRated: product.topRated || false,
      });
      
      if (product.image) {
        const fullImageUrl = product.image.startsWith("http") 
          ? product.image 
          : `${BACKEND_URL}${product.image.startsWith("/") ? "" : "/"}${product.image}`;
        setImagePreview(fullImageUrl);
        setImageFile("existing");
      }
      
      document.getElementById("product-form-section")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("❌ Fetch product for edit error:", err);
      setError("Failed to load product for editing: " + (err.response?.data?.message || err.message));
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await adminApi.delete(`/api/product/${id}`);
      setProducts(products.filter(p => p._id !== id));
      alert("✅ Product deleted successfully!");
    } catch (err) {
      alert("❌ Delete failed: " + (err.response?.data?.message || "Please try again"));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const cancelEdit = () => {
    resetForm();
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
      <h1 className="text-2xl font-bold mb-4">Admin Products Management</h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <strong className="font-bold">Error:</strong> {error}
            </div>
            <button 
              onClick={() => setError("")} 
              className="ml-4 text-red-800 font-bold text-xl hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ADD/EDIT PRODUCT FORM */}
      <div id="product-form-section" className="bg-gray-50 p-6 rounded-lg border mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
          </h2>
          {editingProduct && (
            <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
              Editing Mode
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter product name"
                required
                disabled={addingProduct || updatingProduct}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (Rs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
                disabled={addingProduct || updatingProduct}
              />
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-sm font-medium mb-1">Original Price (Rs)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter original price"
                min="0"
                step="0.01"
                disabled={addingProduct || updatingProduct}
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium mb-1">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter discount percentage"
                min="0"
                max="100"
                step="0.1"
                disabled={addingProduct || updatingProduct}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                disabled={addingProduct || updatingProduct || categoriesLoading}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.title || cat.name}
                  </option>
                ))}
              </select>
              {categoriesLoading && (
                <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
              )}
              {!categoriesLoading && categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No categories found. Please add categories first.</p>
              )}
            </div>

            {/* Stock Status */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock Status <span className="text-red-500">*</span>
              </label>
              <select
                name="stockStatus"
                value={formData.stockStatus}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                disabled={addingProduct || updatingProduct}
              >
                <option value="in">In Stock</option>
                <option value="limited">Limited Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>

            {/* Top Rated */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="topRated"
                id="topRated"
                checked={formData.topRated}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
                disabled={addingProduct || updatingProduct}
              />
              <label htmlFor="topRated" className="ml-2 text-sm font-medium">
                Top Rated Product
              </label>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Product Image {!editingProduct && <span className="text-red-500">*</span>}
              </label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {imageFile === "existing" ? "Current image (click to change)" : `Selected: ${imageFile?.name}`}
                      </p>
                      {imageFile && imageFile !== "existing" && (
                        <p className="text-xs text-gray-500">Size: {(imageFile?.size / 1024).toFixed(2)} KB</p>
                      )}
                    </div>
                  </div>
                ) : null}
                
                <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${imagePreview ? 'mt-4' : ''}`}>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={addingProduct || updatingProduct}
                    required={!editingProduct}
                  />
                  <label htmlFor="image" className="cursor-pointer block">
                    <div className="text-gray-600">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="mt-2">
                        {imagePreview && imageFile === "existing" 
                          ? "Click to change image" 
                          : "Click to upload product image"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, GIF up to 5MB</p>
                      {editingProduct && !imagePreview && (
                        <p className="text-xs text-yellow-600 mt-1">Leave empty to keep current image</p>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows="3"
                placeholder="Enter product description"
                disabled={addingProduct || updatingProduct}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {editingProduct && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2 rounded font-medium border border-gray-300 hover:bg-gray-50"
                disabled={addingProduct || updatingProduct}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className={`px-6 py-2 rounded font-medium ${
                addingProduct || updatingProduct || categoriesLoading || categories.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : editingProduct
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              disabled={addingProduct || updatingProduct || categoriesLoading || categories.length === 0}
            >
              {addingProduct ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Adding...
                </span>
              ) : updatingProduct ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Updating...
                </span>
              ) : editingProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Products ({products.length})</h2>
          <div className="space-x-2">
            <button
              onClick={() => {
                console.log("🔄 Refreshing data...");
                fetchProducts();
                fetchCategories();
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm"
            >
              Refresh Data
            </button>
            <button
              onClick={() => {
                console.log("📊 Current products:", products);
                console.log("📊 Current categories:", categories);
                console.log("🌐 Backend URL:", BACKEND_URL);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm"
            >
              Debug Log
            </button>
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 4H8a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M40 20H28a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V22a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 28H8a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V30a2 2 0 00-2-2z" />
            </svg>
            <p className="mt-2 text-gray-500">No products found. Add your first product above.</p>
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
                            : `${BACKEND_URL}${p.image?.startsWith("/") ? "" : "/"}${p.image || ""}`
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
                      {p.topRated && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded ml-2">
                          ★ Top Rated
                        </span>
                      )}
                      {p.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="border p-3">
                      <div className="font-medium">Rs {p.price?.toLocaleString() || "0"}</div>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="text-sm text-gray-500 line-through">
                          Rs {p.originalPrice?.toLocaleString()}
                        </div>
                      )}
                      {p.discount > 0 && (
                        <div className="text-sm text-green-600">
                          {p.discount}% off
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
                    <td className="border p-3 space-x-2">
                      <button
                        onClick={() => editProduct(p._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <strong>Products Count:</strong> {products.length}
          </div>
          <div>
            <strong>Categories Count:</strong> {categories.length}
          </div>
          <div>
            <strong>Backend URL:</strong> {BACKEND_URL}
          </div>
          <div>
            <strong>Form Data:</strong> {formData.name ? "Filled" : "Empty"}
          </div>
          <div>
            <strong>Image:</strong> {imageFile ? "Selected" : "Not selected"}
          </div>
          <div>
            <strong>Mode:</strong> {editingProduct ? "Editing" : "Adding"}
          </div>
          <div className="md:col-span-2">
            <button
              onClick={async () => {
                console.log("🔍 Debugging API endpoints...");
                
                // Test GET products endpoint
                try {
                  const productsRes = await adminApi.get("/api/product");
                  console.log("✅ GET /api/product - Status:", productsRes.status);
                  console.log("Data:", productsRes.data);
                } catch (err) {
                  console.error("❌ GET /api/product - Error:", err.message);
                }
                
                // Test if there's a different endpoint
                try {
                  const productsRes2 = await adminApi.get("/product");
                  console.log("✅ GET /product - Status:", productsRes2.status);
                  console.log("Data:", productsRes2.data);
                } catch (err) {
                  console.error("❌ GET /product - Error:", err.message);
                }
                
                // Test categories endpoint
                try {
                  const catRes = await adminApi.get("/api/categories");
                  console.log("✅ GET /api/categories - Status:", catRes.status);
                } catch (err) {
                  console.error("❌ GET /api/categories - Error:", err.message);
                }
              }}
              className="text-blue-600 hover:underline mr-4"
            >
              Test Endpoints
            </button>
            
            <button
              onClick={() => {
                console.log("📋 Current state:");
                console.log("- Products:", products);
                console.log("- Categories:", categories);
                console.log("- Form Data:", formData);
                console.log("- Image File:", imageFile);
              }}
              className="text-blue-600 hover:underline"
            >
              Log State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}