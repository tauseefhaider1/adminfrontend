import adminApi from "../api/Azios";

/* ===============================
   CREATE CATEGORY (ADMIN)
=============================== */
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

/* ===============================
   GET ALL CATEGORIES (PUBLIC)
=============================== */
export const getCategories = async () => {
  const res = await adminApi.get("/api/categories");
  return res.data;
};

/* ===============================
   DELETE CATEGORY (ADMIN)
=============================== */
export const deleteCategory = async (id) => {
  const res = await adminApi.delete(`/api/categories/${id}`);
  return res.data;
};
