import { useEffect, useState } from "react";
import CategoryForm from "./CategoryForm";
import CategoryTable from "./CategoryTable";
import { getCategories } from "../services/categoryservice";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      // data has categories array inside it
      setCategories(data.categories);
    } catch (err) {
      console.log("could not load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // load categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div className="space-y-6">
      <CategoryForm onSuccess={fetchCategories} />
      <CategoryTable categories={categories} onRefresh={fetchCategories} />
    </div>
  );
};

export default AdminCategories;