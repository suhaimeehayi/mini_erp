import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import Pagination from "../components/Pagination";
import DataTable from "../components/DataTable";
import toast, { Toaster } from "react-hot-toast";

function Suppliers() {

  const [suppliers, setSuppliers] = useState([]);

  const [search, setSearch] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [ordering, setOrdering] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("active");

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // =========================
  // Fetch Page
  // =========================

  const fetchPage = useCallback(async (page) => {

    try {

      const params = new URLSearchParams();

      params.append("page", page);

      if (currentSearch)
        params.append("search", currentSearch);

      if (ordering)
        params.append("ordering", ordering);

      const res = await api.get(`/suppliers/?${params.toString()}`);

      setSuppliers(res.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(res.data.count / 5));

    } catch (error) {

      console.error(error);

    }

  }, [currentSearch, ordering]);

  // =========================
  // Initial Load
  // =========================

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(1);

  }, [fetchPage]);

  // =========================
  // Search
  // =========================

  const searchSuppliers = async () => {

    setCurrentSearch(search);
    fetchPage(1);

  };

  // =========================
  // Reset Form
  // =========================

  const resetForm = () => {

    setName("");
    setCompanyName("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setAddress("");
    setTaxNumber("");
    setWebsite("");
    setStatus("active");
    setIsEditing(false);
    setEditId(null);

  };

  // =========================
  // CRUD Operations
  // =========================

  const createSupplier = async () => {

    try {

      await api.post("/suppliers/", {
        name,
        company_name: companyName,
        contact_person: contactPerson,
        email,
        phone,
        address,
        tax_number: taxNumber,
        website,
        status
      });

      toast.success("Supplier created successfully");
      await fetchPage(1);
      resetForm();

    } catch (error) {
      toast.error("Failed to create supplier");
      console.error(error);
    }

  };

  const updateSupplier = async () => {

    try {

      await api.put(`/suppliers/${editId}/`, {
        name,
        company_name: companyName,
        contact_person: contactPerson,
        email,
        phone,
        address,
        tax_number: taxNumber,
        website,
        status
      });

      toast.success("Supplier updated successfully");
      await fetchPage(1);
      resetForm();

    } catch (error) {
      toast.error("Failed to update supplier");
      console.error(error);
    }

  };

  const deleteSupplier = async (id) => {

    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    try {

      await api.delete(`/suppliers/${id}/`);

      toast.success("Supplier deleted successfully");
      await fetchPage(1);

    } catch (error) {
      toast.error("Failed to delete supplier");
      console.error(error);
    }

  };

  const editSupplier = (supplier) => {

    setName(supplier.name);
    setCompanyName(supplier.company_name);
    setContactPerson(supplier.contact_person);
    setEmail(supplier.email);
    setPhone(supplier.phone);
    setAddress(supplier.address);
    setTaxNumber(supplier.tax_number);
    setWebsite(supplier.website);
    setStatus(supplier.status);
    setIsEditing(true);
    setEditId(supplier.id);

  };

  // =========================
  // Table Columns
  // =========================

  const columns = [

    { key: "name", label: "Name" },

    { key: "company_name", label: "Company" },

    { key: "phone", label: "Phone" },

    { key: "email", label: "Email" },

    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {item.status === "active" ? "Active" : "Inactive"}
        </span>
      )
    }

  ];

  const actions = [

    {
      label: "Edit",
      className: "bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm",
      onClick: (item) => editSupplier(item)
    },

    {
      label: "Delete",
      className: "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm",
      onClick: (item) => deleteSupplier(item.id)
    }

  ];

  return (

    <div className="max-w-6xl mx-auto p-6 text-gray-800">

      <h1 className="text-3xl font-semibold mb-6">
        Suppliers
      </h1>

      {/* Form */}

      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">

        <h2 className="text-xl font-semibold mb-4">

          {isEditing ? "Edit Supplier" : "Add New Supplier"}

        </h2>

        <form onSubmit={(e) => { e.preventDefault(); isEditing ? updateSupplier() : createSupplier(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input

            type="text"

            placeholder="Name"

            value={name}

            onChange={(e) => setName(e.target.value)}

            className="border rounded-lg px-3 py-2"

            required

          />

          <input

            type="text"

            placeholder="Company Name"

            value={companyName}

            onChange={(e) => setCompanyName(e.target.value)}

            className="border rounded-lg px-3 py-2"

          />

          <input

            type="text"

            placeholder="Contact Person"

            value={contactPerson}

            onChange={(e) => setContactPerson(e.target.value)}

            className="border rounded-lg px-3 py-2"

          />

          <input

            type="email"

            placeholder="Email"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            className="border rounded-lg px-3 py-2"

            required

          />

          <input

            type="text"

            placeholder="Phone"

            value={phone}

            onChange={(e) => setPhone(e.target.value)}

            className="border rounded-lg px-3 py-2"

          />

          <input

            type="text"

            placeholder="Tax Number"

            value={taxNumber}

            onChange={(e) => setTaxNumber(e.target.value)}

            className="border rounded-lg px-3 py-2"

          />

          <input

            type="url"

            placeholder="Website"

            value={website}

            onChange={(e) => setWebsite(e.target.value)}

            className="border rounded-lg px-3 py-2"

          />

          <select

            value={status}

            onChange={(e) => setStatus(e.target.value)}

            className="border rounded-lg px-3 py-2"

          >

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>

          </select>

          <textarea

            placeholder="Address"

            value={address}

            onChange={(e) => setAddress(e.target.value)}

            className="border rounded-lg px-3 py-2 md:col-span-2"

            rows="3"

          ></textarea>

          <div className="md:col-span-2 flex gap-3">

            <button

              type="submit"

              className="bg-blue-500 text-white px-5 py-2 rounded-lg"

            >

              {isEditing ? "Update" : "Create"}

            </button>

            {isEditing && (

              <button

                type="button"

                onClick={resetForm}

                className="bg-gray-500 text-white px-5 py-2 rounded-lg"

              >

                Cancel

              </button>

            )}

          </div>

        </form>

      </div>

      {/* Search */}

      <div className="bg-white border rounded-xl shadow-sm p-4 mb-6">

        <div className="flex gap-3">

          <input
            type="text"
            placeholder="Search supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <button
            onClick={searchSuppliers}
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

      {/* Table */}

      <div className="bg-white border rounded-xl shadow-sm p-6">

        <DataTable
          data={suppliers}
          columns={columns}
          actions={actions}
          onSort={(key, direction) => {

            const order = direction === "asc"
              ? key
              : `-${key}`;

            setOrdering(order);
            fetchPage(1);

          }}
        />

      </div>

      {/* Pagination */}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchPage}
      />

      <Toaster />

    </div>

  );

}

export default Suppliers;