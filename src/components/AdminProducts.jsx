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

  const BACKEND_URL = "http://localhost:4534";

  // fetch all products
  const fetchProducts = async () => {
    try {
      console.log("fetching products...");
      const res = await adminApi.get("/api/product");
      console.log("products api response:", res.data);
      
      let productsList = [];
      
      // handle different response formats
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
        // if data is an object, get the values
        productsList = Object.values(res.data.data);
      }
      
      console.log("processed products:", productsList);
      setProducts(productsList);
      
      if (productsList.length === 0) {
        console.log("no products found");
      }
      
    } catch (err) {
      console.log("fetch products error:", err);
      console.log("error details:", err.response?.data);
      setError("could not load products: " + (err.response?.data?.message || err.message));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // fetch categories
  const fetchCategories = async () => {
    try {
      console.log("fetching categories...");
      const res = await adminApi.get("/api/categories");
      console.log("categories response:", res.data);
      
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
      console.log("fetch categories error:", err);
      console.log("error details:", err.response?.data);
      setError("could not load categories");
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
      // check if it's actually an image
      if (!file.type.match("image.*")) {
        setError("please select an image file (png, jpg, jpeg, gif)");
        return;
      }
      // check file size (5mb limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("image size must be less than 5mb");
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
    // clear file input
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
      // basic validation
      if (!formData.name.trim()) {
        setError("please enter product name");
        setAddingProduct(false);
        return;
      }

      if (!formData.price) {
        setError("please enter price");
        setAddingProduct(false);
        return;
      }

      if (!formData.category) {
        setError("please select a category");
        setAddingProduct(false);
        return;
      }

      if (!imageFile) {
        setError("please select an image");
        setAddingProduct(false);
        return;
      }

      const price = Number(formData.price);
      if (isNaN(price) || price < 0) {
        setError("price must be a positive number");
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
      
      // optional fields
      if (formData.discount) {
        formDataToSend.append("discount", formData.discount);
      }
      if (formData.originalPrice) {
        const originalPrice = Number(formData.originalPrice);
        formDataToSend.append("originalPrice", originalPrice.toString());
      }
      formDataToSend.append("topRated", formData.topRated.toString());

      // log what we're sending
      console.log("sending product data:");
      console.log("name:", formData.name);
      console.log("price:", price);
      console.log("category:", formData.category);
      console.log("image:", imageFile.name);

      try {
        console.log("making post request to /api/product...");
        const res = await adminApi.post("/api/product", formDataToSend, {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout for big images
        });
        
        console.log("add product response:", res.data);
        
        if (res.status === 201 || res.status === 200 || res.data?.success) {
          alert("product added!");
          resetForm();
          await fetchProducts();
        } else {
          setError(res.data?.message || "could not add product");
        }
      } catch (apiError) {
        console.log("api error:", apiError);
        console.log("response data:", apiError.response?.data);
        
        // try alternative endpoint if first one fails
        if (apiError.response?.status === 500) {
          console.log("trying alternative endpoint /product...");
          try {
            const resAlt = await adminApi.post("/product", formDataToSend, {
              headers: { 
                "Content-Type": "multipart/form-data",
              },
            });
            
            console.log("alternative endpoint response:", resAlt.data);
            if (resAlt.status === 201 || resAlt.status === 200) {
              alert("product added!");
              resetForm();
              await fetchProducts();
              return;
            }
          } catch (altError) {
            console.log("alternative endpoint also failed:", altError);
          }
        }
        
        const errorMsg = apiError.response?.data?.message || 
                        apiError.response?.data?.error ||
                        apiError.message ||
                        "server error (500). check backend logs.";
        
        setError(`add failed: ${errorMsg}`);
      }
      
    } catch (err) {
      console.log("unexpected error:", err);
      setError("something went wrong: " + err.message);
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
        setError("please fill in all required fields");
        setUpdatingProduct(false);
        return;
      }

      const price = Number(formData.price);
      if (isNaN(price) || price < 0) {
        setError("price must be a positive number");
        setUpdatingProduct(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("price", price.toString());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("stockStatus", formData.stockStatus);
      formDataToSend.append("category", formData.category);
      
      // only add image if new one selected
      if (imageFile && imageFile !== "existing") {
        formDataToSend.append("image", imageFile);
      }
      
      // optional fields
      if (formData.discount) formDataToSend.append("discount", formData.discount);
      if (formData.originalPrice) {
        const originalPrice = Number(formData.originalPrice);
        formDataToSend.append("originalPrice", originalPrice.toString());
      }
      formDataToSend.append("topRated", formData.topRated.toString());

      console.log("updating product:", editingProduct._id);
      
      const res = await adminApi.put(`/api/product/${editingProduct._id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("update response:", res.data);
      
      if (res.status === 200 || res.data?.success) {
        alert("product updated!");
        resetForm();
        await fetchProducts();
      } else {
        setError(res.data?.message || "could not update product");
      }
    } catch (err) {
      console.log("update error:", err);
      console.log("error details:", err.response?.data);
      setError("update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingProduct(false);
    }
  };

  const editProduct = async (id) => {
    try {
      console.log("editing product id:", id);
      const res = await adminApi.get(`/api/product/${id}`);
      console.log("product data for edit:", res.data);
      
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
      
      // scroll to form
      document.getElementById("product-form-section")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.log("fetch product for edit error:", err);
      setError("could not load product for editing: " + (err.response?.data?.message || err.message));
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("are you sure you want to delete this product?")) return;
    try {
      await adminApi.delete(`/api/product/${id}`);
      setProducts(products.filter(p => p._id !== id));
      alert("product deleted!");
    } catch (err) {
      alert("delete failed: " + (err.response?.data?.message || "please try again"));
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
          <p className="mt-2">loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products Management</h1>

      {/* error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <strong className="font-bold">error:</strong> {error}
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

      {/* add/edit product form */}
      <div id="product-form-section" className="bg-gray-50 p-6 rounded-lg border mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingProduct ? `editing: ${editingProduct.name}` : "add new product"}
          </h2>
          {editingProduct && (
            <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
              editing mode
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                product name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="enter product name"
                required
                disabled={addingProduct || updatingProduct}
              />
            </div>

            {/* price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="enter price"
                min="0"
                step="0.01"
                required
                disabled={addingProduct || updatingProduct}
              />
            </div>

            {/* original price */}
            <div>
              <label className="block text-sm font-medium mb-1">original price (₹)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="enter original price"
                min="0"
                step="0.01"
                disabled={addingProduct || updatingProduct}
              />
            </div>

            {/* discount */}
            <div>
              <label className="block text-sm font-medium mb-1">discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="enter discount"
                min="0"
                max="100"
                step="0.1"
                disabled={addingProduct || updatingProduct}
              />
            </div>

            {/* category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white"
                required
                disabled={addingProduct || updatingProduct || categoriesLoading}
              >
                <option value="">select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.title || cat.name}
                  </option>
                ))}
              </select>
              {categoriesLoading && (
                <p className="text-xs text-gray-500 mt-1">loading categories...</p>
              )}
              {!categoriesLoading && categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">no categories found. add categories first.</p>
              )}
            </div>

            {/* stock status */}
            <div>
              <label className="block text-sm font-medium mb-1">
                stock status <span className="text-red-500">*</span>
              </label>
              <select
                name="stockStatus"
                value={formData.stockStatus}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white"
                required
                disabled={addingProduct || updatingProduct}
              >
                <option value="in">in stock</option>
                <option value="limited">limited stock</option>
                <option value="out">out of stock</option>
              </select>
            </div>

            {/* top rated checkbox */}
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
                top rated product
              </label>
            </div>

            {/* image upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                product image {!editingProduct && <span className="text-red-500">*</span>}
              </label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="preview" 
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
                        {imageFile === "existing" ? "current image" : `selected: ${imageFile?.name}`}
                      </p>
                      {imageFile && imageFile !== "existing" && (
                        <p className="text-xs text-gray-500">size: {(imageFile?.size / 1024).toFixed(2)} kb</p>
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
                  />
                  <label htmlFor="image" className="cursor-pointer block">
                    <div className="text-gray-600">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="mt-2">
                        {imagePreview && imageFile === "existing" 
                          ? "click to change image" 
                          : "click to upload image"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">png, jpg, jpeg, gif (max 5mb)</p>
                      {editingProduct && !imagePreview && (
                        <p className="text-xs text-yellow-600 mt-1">leave empty to keep current image</p>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows="3"
                placeholder="enter product description"
                disabled={addingProduct || updatingProduct}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {editingProduct && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2 rounded font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={addingProduct || updatingProduct}
              >
                cancel
              </button>
            )}
            <button
              type="submit"
              className={`px-6 py-2 rounded font-medium transition-colors ${
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
                  adding...
                </span>
              ) : updatingProduct ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  updating...
                </span>
              ) : editingProduct ? "update product" : "add product"}
            </button>
          </div>
        </form>
      </div>

      {/* products table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">all products ({products.length})</h2>
          <div className="space-x-2">
            <button
              onClick={() => {
                console.log("refreshing data...");
                fetchProducts();
                fetchCategories();
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm transition-colors"
            >
              refresh
            </button>
            <button
              onClick={() => {
                console.log("current products:", products);
                console.log("current categories:", categories);
                console.log("backend url:", BACKEND_URL);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm transition-colors"
            >
              debug
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
            <p className="mt-2 text-gray-500">no products yet. add your first one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3 text-left">image</th>
                  <th className="border p-3 text-left">name</th>
                  <th className="border p-3 text-left">price</th>
                  <th className="border p-3 text-left">stock</th>
                  <th className="border p-3 text-left">category</th>
                  <th className="border p-3 text-left">actions</th>
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
                          ★ top rated
                        </span>
                      )}
                      {p.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="border p-3">
                      <div className="font-medium">₹{p.price?.toLocaleString() || "0"}</div>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{p.originalPrice?.toLocaleString()}
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
                        {p.stockStatus === "in" ? "in stock" : 
                         p.stockStatus === "limited" ? "limited" : 
                         "out of stock"}
                      </span>
                    </td>
                    <td className="border p-3">
                      {p.category ? (
                        typeof p.category === "object" ? (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {p.category.title || p.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">id: {p.category}</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">no category</span>
                      )}
                    </td>
                    <td className="border p-3 space-x-2">
                      <button
                        onClick={() => editProduct(p._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* debug info section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border text-sm">
        <h3 className="font-medium mb-2">debug info:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <strong>products:</strong> {products.length}
          </div>
          <div>
            <strong>categories:</strong> {categories.length}
          </div>
          <div>
            <strong>backend:</strong> {BACKEND_URL}
          </div>
          <div>
            <strong>form:</strong> {formData.name ? "filled" : "empty"}
          </div>
          <div>
            <strong>image:</strong> {imageFile ? "selected" : "none"}
          </div>
          <div>
            <strong>mode:</strong> {editingProduct ? "editing" : "adding"}
          </div>
          <div className="md:col-span-2">
            <button
              onClick={async () => {
                console.log("testing api endpoints...");
                
                // test get products
                try {
                  const productsRes = await adminApi.get("/api/product");
                  console.log("get /api/product - status:", productsRes.status);
                  console.log("data:", productsRes.data);
                } catch (err) {
                  console.log("get /api/product failed:", err.message);
                }
                
                // try alternative endpoint
                try {
                  const productsRes2 = await adminApi.get("/product");
                  console.log("get /product - status:", productsRes2.status);
                  console.log("data:", productsRes2.data);
                } catch (err) {
                  console.log("get /product failed:", err.message);
                }
                
                // test categories
                try {
                  const catRes = await adminApi.get("/api/categories");
                  console.log("get /api/categories - status:", catRes.status);
                } catch (err) {
                  console.log("get /api/categories failed:", err.message);
                }
              }}
              className="text-blue-600 hover:underline mr-4"
            >
              test endpoints
            </button>
            
            <button
              onClick={() => {
                console.log("current state:");
                console.log("- products:", products);
                console.log("- categories:", categories);
                console.log("- form data:", formData);
                console.log("- image file:", imageFile);
              }}
              className="text-blue-600 hover:underline"
            >
              log state
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}