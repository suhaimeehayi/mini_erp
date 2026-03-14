import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

import Pagination from '../components/Pagination';
import ProductTable from '../components/DataTable';

function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");

  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // =========================
  // Fetch Suppliers
  // =========================

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api.get("/suppliers/");

      setSuppliers(res.data.results);
    } catch (error) {
      console.error("Supplier fetch error", error);
    }
  }, []);

  // =========================
  // Pagination
  // =========================

  const fetchPage = useCallback(async (page, sortKeyParam = sortKey, sortDirectionParam = sortDirection) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (currentSearch) params.append('search', currentSearch);
      if (sortKeyParam) {
        const ordering = sortDirectionParam === "desc" ? `-${sortKeyParam}` : sortKeyParam;
        params.append('ordering', ordering);
      }
      const url = `/products/?${params.toString()}`;
      const res = await api.get(url);

      setProducts(res.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(res.data.count / 5));
    } catch (error) {
      console.error(error);
    }
  }, [currentSearch, sortKey, sortDirection]);

  // =========================
  // Fetch Products
  // =========================

  const fetchProducts = useCallback(async () => {
    await fetchPage(1);
  }, [fetchPage]);

  // =========================
  // Handle Sort
  // =========================

  const handleSort = (key, direction) => {
    setSortKey(key);
    setSortDirection(direction);
    fetchPage(1, key, direction);
  };

  // =========================
  // Search
  // =========================

  const searchProducts = async () => {
    setCurrentSearch(search);
    await fetchPage(1, sortKey, sortDirection);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Product name required";
    }

    if (!price) {
      newErrors.price = "Price required";
    } else if (Number(price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!supplier) {
      newErrors.supplier = "Supplier required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // Reset Form
  // =========================

  const resetForm = () => {
    setEditId(null);

    setName("");
    setSku("");
    setDescription("");
    setPrice("");
    setSupplier("");
  };

  // =========================
  // Create
  // =========================

  const createProduct = async () => {
    if (!validateForm()) {
      toast.error("Please fill required fields ❌");
      return;
    }
    const confirmAdd = window.confirm("Create this product?");

    if (!confirmAdd) return;

    try {
      await api.post("/products/", {
        name,
        sku,
        description,
        price,
        supplier,
      });

      toast.success("Product created");
      window.location.reload();

      resetForm();
    } catch (error) {
      toast.error("Create failed");
      console.error(error);
    }
  };

  // =========================
  // Edit
  // =========================

  const editProduct = (product) => {
    setEditId(product.id);

    setName(product.name);
    setSku(product.sku);
    setDescription(product.description);
    setPrice(product.price);
    setSupplier(product.supplier);
  };

  // =========================
  // Update
  // =========================

  const updateProduct = async () => {
    if (!validateForm()) {
      toast.error("Please fill required fields ❌");
      return;
    }
    const confirmUpdate = window.confirm("Update this product?");

    if (!confirmUpdate) return;

    try {
      await api.put(`/products/${editId}/`, {
        name,
        sku,
        description,
        price,
        supplier,
      });

      toast.success("Product updated");
      window.location.reload();

      resetForm();
    } catch (error) {
      toast.error("Update failed");
      console.error(error);
    }
  };

  // =========================
  // Delete
  // =========================

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm("Delete this product?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}/`);

      toast.success("Product deleted");
      window.location.reload();
    } catch (error) {
      toast.error("Delete failed");
      console.error(error);
    }
  };

  // =========================
  // Load data
  // =========================

  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      await fetchSuppliers();
    };
    loadData();
  }, [fetchProducts, fetchSuppliers]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'description', label: 'Description' },
    { key: 'price', label: 'Price', render: (item) => `$${item.price}` },
    { key: 'supplier', label: 'Supplier', render: (item) => item.supplier.name, sortKey: 'supplier__name' }
  ];

  const actions = [
    { label: 'Edit', onClick: editProduct, className: 'bg-yellow-400 text-white px-3 py-1 rounded' },
    { label: 'Delete', onClick: (product) => deleteProduct(product.id), className: 'bg-red-500 text-white px-3 py-1 rounded' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-semibold mb-6">Products</h1>

      {/* ===================== */}
      {/* Search */}
      {/* ===================== */}

      <div className="bg-white border rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <button
            onClick={searchProducts}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg"
          >
            Search
          </button>

          <button
            onClick={() => {
              setSearch("");
              setCurrentSearch("");
              fetchPage(1, sortKey, sortDirection);
            }}
            className="bg-gray-500 text-white px-5 py-2 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ===================== */}
      {/* Form */}
      {/* ===================== */}

      <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`border rounded-lg px-3 py-2 flex-1
  ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"}
  focus:outline-none focus:ring-2 focus:ring-blue-400`}
          />

          <input
            type="text"
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`border rounded-lg px-3 py-2 flex-1
            ${errors.price ? "border-red-500 bg-red-50" : "border-gray-300"}
            focus:outline-none focus:ring-2 focus:ring-blue-400`}
          />

          {/* Supplier Dropdown */}

          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className={`border rounded-lg px-3 py-2 flex-1
            ${errors.supplier ? "border-red-500 bg-red-50" : "border-gray-300"}
            focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            <option value="">Select Supplier</option>

            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={editId ? updateProduct : createProduct}
            className="bg-green-500 text-white px-5 py-2 rounded-lg"
          >
            {editId ? "Update" : "Add"}
          </button>

          {editId && (
            <button
              onClick={resetForm}
              className="bg-gray-400 text-white px-5 py-2 rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ===================== */}
      {/* Table */}
      {/* ===================== */}

      <ProductTable data={products} columns={columns} actions={actions} onSort={handleSort} />

      {/* ===================== */}
      {/* Pagination */}
      {/* ===================== */}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchPage} />
    </div>
  );
}

export default Products;
