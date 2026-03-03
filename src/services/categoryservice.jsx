import adminApi from "../api/Azios";

// create new category - admin only
export const createCategory = async (formData) => {
  const res = await adminApi.post(
    "/api/categories",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};

// get all categories - public endpoint
export const getCategories = async () => {
  const res = await adminApi.get("/api/categories");
  return res.data;
};

// delete category - admin only
export const deleteCategory = async (id) => {
  const res = await adminApi.delete(`/api/categories/${id}`);
  return res.data;
};