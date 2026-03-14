import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

import Pagination from '../components/Pagination';
import ProductTable from '../components/DataTable';
import { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from '../services/purchaseOrderService';

function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [supplier, setSupplier] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [editId, setEditId] = useState(null);

  // Item fields
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");

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
  // Fetch Products
  // =========================

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/products/");

      setProducts(res.data.results);
    } catch (error) {
      console.error("Product fetch error", error);
    }
  }, []);

  // =========================
  // Pagination
  // =========================

  const fetchPage = useCallback(async (page) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (currentSearch) params.append('search', currentSearch);
      const url = `/purchase-orders/?${params.toString()}`;
      const res = await api.get(url);

      setPurchaseOrders(res.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(res.data.count / 5));
    } catch (error) {
      console.error(error);
    }
  }, [currentSearch]);

  // =========================
  // Fetch Purchase Orders
  // =========================

  const fetchPurchaseOrders = useCallback(async () => {
    await fetchPage(1);
  }, [fetchPage]);

  // =========================
  // Search
  // =========================

  const searchPurchaseOrders = async () => {
    setCurrentSearch(search);
    await fetchPage(1);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!supplier) {
      newErrors.supplier = "Supplier required";
    }

    if (!orderDate) {
      newErrors.orderDate = "Order date required";
    }

    if (!selectedProduct) {
      newErrors.selectedProduct = "Product required";
    }

    if (!quantity || Number(quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!unitPrice || Number(unitPrice) <= 0) {
      newErrors.unitPrice = "Unit price must be greater than 0";
    }

    if (!status) {
      newErrors.status = "Status required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // Reset Form
  // =========================

  const resetForm = () => {
    setEditId(null);

    setSupplier("");
    setOrderDate("");
    setStatus("pending");
    setSelectedProduct("");
    setQuantity("");
    setUnitPrice("");
  };

  // =========================
  // Create
  // =========================

  const createOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fill required fields ❌");
      return;
    }
    const confirmAdd = window.confirm("Create this purchase order?");

    if (!confirmAdd) return;

    try {
      await createPurchaseOrder({
        supplier,
        order_date: orderDate,
        status,
        item_product: selectedProduct,
        item_quantity: quantity,
        item_unit_price: unitPrice,
      });

      toast.success("Purchase order created");
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

  const editOrder = (order) => {
    setEditId(order.id);

    setSupplier(order.supplier);
    setOrderDate(order.order_date);
    setTotalAmount(order.total_amount);
    setStatus(order.status);
  };

  // =========================
  // Update
  // =========================

  const updateOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fill required fields ❌");
      return;
    }
    const confirmUpdate = window.confirm("Update this purchase order?");

    if (!confirmUpdate) return;

    try {
      await updatePurchaseOrder(editId, {
        supplier,
        order_date: orderDate,
        total_amount: totalAmount,
        status,
      });

      toast.success("Purchase order updated");
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

  const deleteOrder = async (id) => {
    const confirmDelete = window.confirm("Delete this purchase order?");

    if (!confirmDelete) return;

    try {
      await deletePurchaseOrder(id);

      toast.success("Purchase order deleted");
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
      await fetchPurchaseOrders();
      await fetchSuppliers();
      await fetchProducts();
    };
    loadData();
  }, [fetchPurchaseOrders, fetchSuppliers, fetchProducts]);

  const columns = [
    { key: 'po_number', label: 'PO Number' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'order_date', label: 'Order Date' },
    { key: 'items', label: 'Items', render: (item) => `${item.items.length} item(s) - $${item.total_amount}` },
    { key: 'status', label: 'Status', render: (item) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        item.status === 'received' ? 'bg-green-100 text-green-800' :
        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </span>
    )}
  ];

  const actions = [
    { label: 'Edit', onClick: editOrder, className: 'bg-yellow-400 text-white px-3 py-1 rounded' },
    { label: 'Delete', onClick: (order) => deleteOrder(order.id), className: 'bg-red-500 text-white px-3 py-1 rounded' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-semibold mb-6">Purchase Orders</h1>

      {/* ===================== */}
      {/* Search */}
      {/* ===================== */}

      <div className="bg-white border rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search purchase order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <button
            onClick={searchPurchaseOrders}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg"
          >
            Search
          </button>

          <button
            onClick={() => {
              setSearch("");
              setCurrentSearch("");
              fetchPage(1);
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

          <input
            type="date"
            placeholder="Order Date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className={`border rounded-lg px-3 py-2 flex-1
            ${errors.orderDate ? "border-red-500 bg-red-50" : "border-gray-300"}
            focus:outline-none focus:ring-2 focus:ring-blue-400`}
          />

          {/* Product Dropdown */}
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className={`border rounded-lg px-3 py-2 flex-1
            ${errors.selectedProduct ? "border-red-500 bg-red-50" : "border-gray-300"}
            focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={`border rounded-lg px-3 py-2 flex-1
            ${errors.quantity ? "border-red-500 bg-red-50" : "border-gray-300"}
            focus:outline-none focus:ring-2 focus:ring-blue-400`}
          />

          <input
            type="number"
            step="0.01"
            placeholder="Unit Price"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className={`border rounded-lg px-3 py-2 flex-1
            ${errors.unitPrice ? "border-red-500 bg-red-50" : "border-gray-300"}
            focus:outline-none focus:ring-2 focus:ring-blue-400`}
          />

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`border rounded-lg px-3 py-2 flex-1
            ${errors.status ? "border-red-500 bg-red-50" : "border-gray-300"}
            focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={editId ? updateOrder : createOrder}
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

      <ProductTable data={purchaseOrders} columns={columns} actions={actions} />

      {/* ===================== */}
      {/* Pagination */}
      {/* ===================== */}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchPage} />
    </div>
  );
}

export default PurchaseOrders;