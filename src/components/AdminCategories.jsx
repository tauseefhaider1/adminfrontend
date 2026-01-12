import { useEffect, useState } from "react";
import CategoryForm from "./CategoryForm";
import CategoryTable from "./CategoryTable";
import { getCategories } from "../services/categoryservice";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const data = await getCategories(); // ✅ FIX HERE
      setCategories(data.categories);     // ✅ AND HERE
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <CategoryForm onSuccess={fetchCategories} />
      <CategoryTable categories={categories} onRefresh={fetchCategories} />
    </div>
  );
};

export default AdminCategories;
