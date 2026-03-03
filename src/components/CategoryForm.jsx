import { useState, useRef } from "react";
import { createCategory } from "../services/categoryservice";

const CategoryForm = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null); // to reset file input after submit

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!title.trim()) {
      return alert("please enter a category title");
    }

    if (!image) {
      return alert("please select an image");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", image); // this should match what backend expects

      await createCategory(formData);

      // reset everything after success
      setTitle("");
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";

      onSuccess();
    } catch (err) {
      console.log("error creating category:", err);
      alert(err.response?.data?.message || "could not create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-3">add category</h2>

      {/* title input */}
      <input
        className="border p-2 w-full mb-2"
        placeholder="category title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* image upload */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="border p-2 w-full mb-2"
        onChange={(e) => setImage(e.target.files[0])}
      />

      {/* show preview if image selected */}
      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="preview"
          className="w-16 h-16 object-cover mb-2 rounded"
        />
      )}

      <button
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800 transition-colors"
      >
        {loading ? "saving..." : "add category"}
      </button>
    </form>
  );
};

export default CategoryForm;