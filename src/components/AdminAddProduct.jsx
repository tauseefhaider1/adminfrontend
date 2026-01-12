import { useState } from "react";
import adminApi from "../api/Azios";

function AdminAddProduct({ onAdded }) {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    rating: "",
    discount: "",
    stockStatus: "in",
    category: "",
    topRated: false, // ✅ ADD TOP RATED
  });

  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", Number(product.price));
    formData.append("originalPrice", Number(product.originalPrice));
    formData.append("rating", Number(product.rating));
    formData.append("discount", Number(product.discount));
    formData.append("stockStatus", product.stockStatus);
    formData.append("category", product.category);
    formData.append("topRated", product.topRated); // ✅ SEND TOP RATED

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await adminApi.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Product added successfully");

      setProduct({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        rating: "",
        discount: "",
        stockStatus: "in",
        category: "",
        topRated: false, // ✅ reset
      });
      setImageFile(null);

      onAdded?.();
    } catch (error) {
      console.error(error.response?.data || error);
      alert("❌ Failed to add product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <input
        name="name"
        placeholder="Product Name"
        value={product.name}
        onChange={handleChange}
        className="w-full p-2"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="w-full p-2"
        required
      />

      <textarea
        name="description"
        placeholder="Product Description"
        value={product.description}
        onChange={handleChange}
        className="w-full p-2"
        rows={4}
      />

      <select
        name="category"
        value={product.category}
        onChange={handleChange}
        className="w-full p-2"
        required
      >
        <option value="">Select Category</option>
        <option value="electronics">Electronics</option>
        <option value="fashion">Fashion</option>
        <option value="home-garden">Home & Garden</option>
        <option value="sports">Sports</option>
        <option value="books">Books</option>
      </select>

      <input
        name="price"
        type="number"
        placeholder="Price"
        value={product.price}
        onChange={handleChange}
        className="w-full p-2"
        required
      />

      <input
        name="originalPrice"
        type="number"
        placeholder="Original Price"
        value={product.originalPrice}
        onChange={handleChange}
        className="w-full p-2"
      />

      <input
        name="rating"
        type="number"
        step="0.1"
        placeholder="Rating"
        value={product.rating}
        onChange={handleChange}
        className="w-full p-2"
      />

      <input
        name="discount"
        type="number"
        placeholder="Discount %"
        value={product.discount}
        onChange={handleChange}
        className="w-full p-2"
      />

      {/* ✅ TOP RATED CHECKBOX */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="topRated"
          checked={product.topRated}
          onChange={handleChange}
        />
        Top Rated
      </label>

      <select
        name="stockStatus"
        value={product.stockStatus}
        onChange={handleChange}
        className="w-full p-2"
      >
        <option value="in">In Stock</option>
        <option value="limited">Limited Stock</option>
        <option value="out">Out of Stock</option>
      </select>

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Product
      </button>
    </form>
  );
}

export default AdminAddProduct;
