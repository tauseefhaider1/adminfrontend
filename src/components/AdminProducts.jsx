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
      console.log("Fetching products...");
      const res = await adminApi.get("/api/product");
      console.log("Products API response:", res.data);
      
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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await adminApi.get("/api/categories");
      console.log("Categories response:", res.data);
      
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
      console.error("Fetch categories error:", err);
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
      if (!formData.name.trim() || !formData.price || !formData.category) {
        setError("Please fill in all required fields (Name, Price, Category)");
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
      formDataToSend.append("price", price);
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("stockStatus", formData.stockStatus);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("image", imageFile);
      
      // Optional fields
      if (formData.discount) formDataToSend.append("discount", formData.discount);
      if (formData.originalPrice) formDataToSend.append("originalPrice", formData.originalPrice);
      formDataToSend.append("topRated", formData.topRated);

      console.log("Adding product...", {
        name: formData.name,
        price: price,
        category: formData.category,
        image: imageFile.name
      });

      const res = await adminApi.post("/api/product", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Add product response:", res.data);
      
      if (res.data.success || res.status === 201) {
        alert("✅ Product added successfully!");
        resetForm();
        await fetchProducts();
      } else {
        setError(res.data.message || "Failed to add product");
      }
    } catch (err) {
      console.error("Add product error:", err);
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setAddingProduct(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProduct(true);
    setError("");

    try {
      // Validation
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
      formDataToSend.append("price", price);
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("stockStatus", formData.stockStatus);
      formDataToSend.append("category", formData.category);
      
      // Add image only if a new one is selected
      if (imageFile && imageFile !== "existing") {
        formDataToSend.append("image", imageFile);
      }
      
      // Optional fields
      if (formData.discount) formDataToSend.append("discount", formData.discount);
      if (formData.originalPrice) formDataToSend.append("originalPrice", formData.originalPrice);
      formDataToSend.append("topRated", formData.topRated);

      const res = await adminApi.put(`/api/product/${editingProduct._id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (res.data.success || res.status === 200) {
        alert("✅ Product updated successfully!");
        resetForm();
        await fetchProducts();
      } else {
        setError(res.data.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Update product error:", err);
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setUpdatingProduct(false);
    }
  };

  const editProduct = async (id) => {
    try {
      const res = await adminApi.get(`/api/product/${id}`);
      const product = res.data.product || res.data.data || res.data;
      
      console.log("Product data for edit:", product);
      
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
        setImageFile("existing"); // Mark as existing image
      }
      
      // Scroll to form
      document.getElementById("product-form-section")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Fetch product for edit error:", err);
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
          {error}
          <button 
            onClick={() => setError("")} 
            className="float-right text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* ADD/EDIT PRODUCT FORM */}
      <div id="product-form-section" className="bg-gray-50 p-6 rounded-lg border mb-8">
        <h2 className="text-xl font-bold mb-4">
          {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

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
              {addingProduct ? "Adding..." : 
               updatingProduct ? "Updating..." : 
               editingProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Products ({products.length})</h2>
          <button
            onClick={() => {
              fetchProducts();
              fetchCategories();
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Refresh Data
          </button>
        </div>
        
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
                          Top Rated
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
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
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
            <strong>Categories Count:</strong> {categories.length}
          </div>
          <div>
            <strong>Backend:</strong> {BACKEND_URL}
          </div>
          <div>
            <button
              onClick={() => {
                console.log("Current products:", products);
                console.log("Current categories:", categories);
                fetchProducts();
                fetchCategories();
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