import { useState, useRef } from "react";
import { createCategory } from "../services/categoryservice";

const CategoryForm = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null); // ✅ reset file input

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return alert("Category title is required");
    }

    if (!image) {
      return alert("Please select an image");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", image); // MUST match upload.single("image")

      await createCategory(formData);

      // ✅ reset form
      setTitle("");
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";

      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-3">Add Category</h2>

      {/* TITLE */}
      <input
        className="border p-2 w-full mb-2"
        placeholder="Category title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* IMAGE */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="border p-2 w-full mb-2"
        onChange={(e) => setImage(e.target.files[0])}
      />

      {/* IMAGE PREVIEW */}
      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="Preview"
          className="w-16 h-16 object-cover mb-2 rounded"
        />
      )}

      <button
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Saving..." : "Add"}
      </button>
    </form>
  );
};

export default CategoryForm;
