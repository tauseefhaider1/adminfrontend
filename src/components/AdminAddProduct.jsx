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
    topRated: false, // for the top rated products section
  });

  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // handle both text inputs and checkboxes
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // build form data for file upload
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", Number(product.price));
    formData.append("originalPrice", Number(product.originalPrice));
    formData.append("rating", Number(product.rating));
    formData.append("discount", Number(product.discount));
    formData.append("stockStatus", product.stockStatus);
    formData.append("category", product.category);
    formData.append("topRated", product.topRated);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await adminApi.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("product added!");

      // reset form after successful submission
      setProduct({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        rating: "",
        discount: "",
        stockStatus: "in",
        category: "",
        topRated: false,
      });
      setImageFile(null);

      // let parent component know we added something
      if (onAdded) {
        onAdded();
      }
    } catch (error) {
      // show error message
      console.log("error adding product:", error.response?.data || error);
      alert("something went wrong, try again");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <input
        name="name"
        placeholder="Product Name"
        value={product.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
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
        className="w-full p-2 border rounded"
        rows={4}
      />

      <select
        name="category"
        value={product.category}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select Category</option>
        <option value="electronics">Electronics</option>
        <option value="fashion">Fashion</option>
        <option value="home-garden">Home & Garden</option>
        <option value="sports">Sports</option>
        <option value="books">Books</option>
      </select>

      <div className="grid grid-cols-2 gap-2">
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          name="originalPrice"
          type="number"
          placeholder="Original Price"
          value={product.originalPrice}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          name="rating"
          type="number"
          step="0.1"
          placeholder="Rating (0-5)"
          value={product.rating}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          name="discount"
          type="number"
          placeholder="Discount %"
          value={product.discount}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* top rated checkbox */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="topRated"
          checked={product.topRated}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <span>Mark as Top Rated</span>
      </label>

      <select
        name="stockStatus"
        value={product.stockStatus}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="in">In Stock</option>
        <option value="limited">Limited Stock</option>
        <option value="out">Out of Stock</option>
      </select>

      <button 
        type="submit" 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Product
      </button>
    </form>
  );
}

export default AdminAddProduct;