import { deleteCategory } from "../services/categoryservice";

const CategoryTable = ({ categories = [], onRefresh }) => {
  const handleDelete = async (id) => {
    // ask for confirmation first
    const confirmDelete = window.confirm("are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      await deleteCategory(id);
      onRefresh(); // reload the list
    } catch (err) {
      console.log("delete error:", err);
      alert(err.response?.data?.message || "could not delete category");
    }
  };

  return (
    <table className="w-full mt-4 border">
      <thead>
        <tr className="border-b">
          <th className="p-2">image</th>
          <th className="p-2">title</th>
          <th className="p-2">actions</th>
        </tr>
      </thead>

      <tbody>
        {categories.length === 0 ? (
          <tr>
            <td colSpan="3" className="p-4 text-center text-gray-500">
              no categories found
            </td>
          </tr>
        ) : (
          categories.map((cat) => (
            <tr key={cat._id} className="border-t text-center hover:bg-gray-50">
              <td className="p-2">
                <img
                  src={
                    cat.img && cat.img.startsWith("/uploads")
                      ? `${import.meta.env.VITE_API_URL}${cat.img}`
                      : "/placeholder.png"
                  }
                  alt={cat.title}
                  className="w-10 h-10 mx-auto object-cover rounded border"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.png";
                  }}
                />
              </td>

              <td className="p-2">{cat.title}</td>

              <td className="p-2">
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-red-500 hover:text-red-700 hover:underline transition-colors"
                >
                  delete
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