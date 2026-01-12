import { deleteCategory } from "../services/categoryservice";

const CategoryTable = ({ categories = [], onRefresh }) => {
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this category?");
    if (!ok) return;

    try {
      await deleteCategory(id);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <table className="w-full mt-4 border">
      <thead>
        <tr className="border-b">
          <th className="p-2">Image</th>
          <th className="p-2">Title</th>
          <th className="p-2">Action</th>
        </tr>
      </thead>

      <tbody>
        {categories.length === 0 ? (
          <tr>
            <td colSpan="3" className="p-4 text-center text-gray-500">
              No categories found
            </td>
          </tr>
        ) : (
          categories.map((cat) => (
            <tr key={cat._id} className="border-t text-center">
              <td className="p-2">
                <img
  src={
    cat.img && cat.img.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${cat.img}`
      : "/placeholder.png"
  }
  alt={cat.title}
  className="w-10 h-10 mx-auto object-cover rounded border"
/>

              </td>

              <td className="p-2">{cat.title}</td>

              <td className="p-2">
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default CategoryTable;
