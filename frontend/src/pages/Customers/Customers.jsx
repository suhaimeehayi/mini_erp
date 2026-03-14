import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import Pagination from "../../components/Pagination";
import ProductTable from "../../components/DataTable";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [status, setStatus] = useState("active");

  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");

  // =========================
  // Pagination
  // =========================

  const fetchPage = useCallback(async (page) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (currentSearch) params.append('search', currentSearch);
      const url = `/customers/?${params.toString()}`;
      const res = await api.get(url);

      setCustomers(res.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(res.data.count / 5));
    } catch (error) {
      console.error(error);
    }
  }, [currentSearch]);

  // =========================
  // Fetch customers
  // =========================

  const fetchCustomers = useCallback(async () => {
    await fetchPage(1);
  }, [fetchPage]);

  // =========================
  // Search
  // =========================

  const searchCustomers = async () => {
    setCurrentSearch(search);
    await fetchPage(1);
  };

  // =========================
  // Reset Form
  // =========================

  const resetForm = () => {
    setEditId(null);
    setName("");
    setPhone("");
    setEmail("");
    setCompany("");
    setAddress("");
    setTaxId("");
    setStatus("active");
  };

  // =========================
  // Create
  // =========================

  const createCustomer = async () => {
    try {
      await api.post("/customers/", {
        name,
        phone,
        email,
        company,
        address,
        tax_id: taxId,
        status,
      });

      toast.success("Customer created successfully");
      await fetchPage(1);
      resetForm();
    } catch (error) {
      toast.error("Failed to create customer");
      console.error(error);
    }
  };

  // =========================
  // Edit
  // =========================

  const editCustomer = (c) => {
    setEditId(c.id);

    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email);
    setCompany(c.company);
    setAddress(c.address);
    setTaxId(c.tax_id);
    setStatus(c.status);
  };

  // =========================
  // Update
  // =========================

  const updateCustomer = async () => {
    try {
      await api.put(`/customers/${editId}/`, {
        name,
        phone,
        email,
        company,
        address,
        tax_id: taxId,
        status,
      });

      toast.success("Customer updated successfully");
      await fetchPage(1);
      resetForm();
    } catch (error) {
      toast.error("Failed to update customer");
      console.error(error);
    }
  };

  // =========================
  // Delete
  // =========================

  const deleteCustomer = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/customers/${id}/`);
      toast.success("Customer deleted successfully");
      await fetchPage(1);
    } catch (error) {
      toast.error("Failed to delete customer");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================
  // ProductTable Columns
  // =========================

  const columns = [
    { key: "name", label: "Name" },

    { key: "company", label: "Company" },

    { key: "phone", label: "Phone" },

    { key: "email", label: "Email" },

    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },

    {
      key: "action",
      label: "Action",
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={() => editCustomer(item)}
            className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm"
          >
            Edit
          </button>

          <button
            onClick={() => deleteCustomer(item.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-semibold mb-6">Customers</h1>

      {/* Search */}
      <div className="bg-white border rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <button
            onClick={searchCustomers}
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

      {/* Form */}

      <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Tax ID"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={editId ? updateCustomer : createCustomer}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition"
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

      {/* Table */}

      <div className="bg-white border rounded-xl shadow-sm p-6">
        <ProductTable data={customers} columns={columns} />
      </div>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchPage} />
    </div>
  );
}

export default Customers;
