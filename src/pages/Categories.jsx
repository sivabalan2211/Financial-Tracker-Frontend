import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !type.trim()) {
      setError("Please fill in both name and type.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.createCategory({
        name: name.trim(),
        type: type.trim(),
      });

      setName("");
      setType("");
      setSuccess("Category created successfully.");

      await fetchCategories();
    } catch (err) {
      setError(err.message || "Unable to create category.");
    } finally {
      setSubmitting(false);
    }
  };


  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await api.deleteCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));

      setSuccess("Category deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page heading */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Categories
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create, view, and manage your categories.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-lg
                       border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-lg
                       border border-green-200 bg-green-50 p-4 text-sm
                       text-green-700"
          >
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="font-bold"
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {/* Add category form */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            Add New Category
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the category name and type below.
          </p>

          <form onSubmit={handleSubmit} className="mt-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Name input */}
              <div>
                <label
                  htmlFor="categoryName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category Name
                </label>

                <input
                  id="categoryName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-gray-300
                             bg-white px-4 py-3 text-sm text-gray-900
                             outline-none transition placeholder:text-gray-400
                             focus:border-blue-500 focus:ring-2
                             focus:ring-blue-100"
                />
              </div>

              {/* Type input */}
              <div>
                <label
                  htmlFor="categoryType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category Type
                </label>

                <input
                  id="categoryType"
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Enter category type"
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-gray-300
                             bg-white px-4 py-3 text-sm text-gray-900
                             outline-none transition placeholder:text-gray-400
                             focus:border-blue-500 focus:ring-2
                             focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg
                           bg-blue-600 px-6 py-3 text-sm font-semibold text-white
                           shadow-sm transition hover:bg-blue-700
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:ring-offset-2 disabled:cursor-not-allowed
                           disabled:opacity-60"
              >
                {submitting ? "Adding..." : "+ Add Category"}
              </button>
            </div>
          </form>
        </section>

        {/* Categories list */}
        <section
          className="overflow-hidden rounded-xl border border-gray-200
                            bg-white shadow-sm"
        >
          <div
            className="flex flex-col gap-3 border-b border-gray-200 p-6
                          sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                All Categories
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage existing categories.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="rounded-full bg-blue-50 px-3 py-1.5
                               text-sm font-medium text-blue-700"
              >
                {categories.length} total
              </span>

              <button
                type="button"
                onClick={fetchCategories}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2
                           text-sm font-medium text-gray-700 transition
                           hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div
                className="mx-auto h-8 w-8 animate-spin rounded-full
                              border-4 border-gray-200 border-t-blue-600"
              />
              <p className="mt-3 text-sm text-gray-500">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center
                              justify-center rounded-full bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-7 w-7 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0
                       1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No categories found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first category using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      ID
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      Category Name
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      Type
                    </th>
                    <th
                      className="whitespace-nowrap px-6 py-4 text-right
                                   font-semibold"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                        {category.id}
                      </td>

                      <td
                        className="whitespace-nowrap px-6 py-4
                                     font-medium text-gray-900"
                      >
                        {category.name}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className="inline-flex rounded-full bg-indigo-50
                                         px-3 py-1 text-xs font-medium
                                         text-indigo-700"
                        >
                          {category.type}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          disabled={deletingId === category.id}
                          aria-label={`Delete ${category.name}`}
                          className="rounded-lg px-3 py-2 text-sm font-medium
                                     text-red-600 transition hover:bg-red-50
                                     disabled:cursor-not-allowed
                                     disabled:opacity-50"
                        >
                          {deletingId === category.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
            <p className="text-xs text-gray-500">
              Showing {categories.length} categories
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
