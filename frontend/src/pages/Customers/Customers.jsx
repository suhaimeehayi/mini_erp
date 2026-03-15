import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

import CustomerForm from "./CustomerForm";
import CustomerDetail from "./CustomerDetail";
import { refreshCurrentPage } from "../../utils/pageRefresh";

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  company: "",
  address: "",
  taxNumber: "",
  status: "active",
};

const extractErrorMessage = (error, fallbackMessage) => {
  const errorData = error?.response?.data;

  if (Array.isArray(errorData) && errorData.length > 0) {
    return errorData[0];
  }

  if (typeof errorData === "string") {
    return errorData;
  }

  if (errorData?.detail) {
    return errorData.detail;
  }

  if (errorData && typeof errorData === "object") {
    const firstValue = Object.values(errorData)[0];
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return firstValue[0];
    }
    if (typeof firstValue === "string") {
      return firstValue;
    }
  }

  return fallbackMessage;
};

function Customers() {
  const { hasPermission } = useAuth();
  const formSectionRef = useRef(null);
  const detailSectionRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewingCustomer, setIsViewingCustomer] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");
  const canCreateCustomers = hasPermission("add_customers");
  const canEditCustomers = hasPermission("change_customers");
  const canDeleteCustomers = hasPermission("delete_customers");
  const canManageCustomers = canCreateCustomers || canEditCustomers;

  const scrollToSection = useCallback((sectionRef) => {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      sectionRef.current?.focus?.();
    });
  }, []);

  const validateForm = useCallback(() => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone is required";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (!formData.company.trim()) {
      nextErrors.company = "Company is required";
    }

    if (!formData.address.trim()) {
      nextErrors.address = "Address is required";
    }

    if (!formData.taxNumber.trim()) {
      nextErrors.taxNumber = "Tax number is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

  const fetchPage = useCallback(async (page, searchValue = currentSearch) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (searchValue) params.append("search", searchValue);

      const res = await api.get(`/customers/?${params.toString()}`);

      setCustomers(res.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(res.data.count / 5));
      setSelectedCustomer((previousCustomer) => {
        if (!previousCustomer) {
          return res.data.results[0] || null;
        }

        return res.data.results.find((customer) => customer.id === previousCustomer.id) || res.data.results[0] || null;
      });
    } catch (error) {
      console.error(error);
    }
  }, [currentSearch]);

  const fetchCustomers = useCallback(async () => {
    await fetchPage(1);
  }, [fetchPage]);

  const searchCustomers = async () => {
    setCurrentSearch(search);
    await fetchPage(1, search);
  };

  const resetForm = () => {
    setEditId(null);
    setErrors({});
    setFormData(initialFormData);
  };

  const handleInputChange = (field, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        [field]: undefined,
      }));
    }

    if (errors.general) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        general: undefined,
      }));
    }
  };

  const handleViewCustomer = async (customer) => {
    setIsDetailOpen(true);
    setIsViewingCustomer(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSelectedCustomer(customer);
    setIsViewingCustomer(false);
    scrollToSection(detailSectionRef);
  };

  const createCustomer = async () => {
    if (!canCreateCustomers) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.post("/customers/", {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        address: formData.address,
        tax_number: formData.taxNumber,
        status: formData.status,
      });

      await fetchPage(1);
      setSelectedCustomer(response.data);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const editCustomer = (customer) => {
    if (!canEditCustomers) {
      return;
    }

    setEditId(customer.id);
    setSelectedCustomer(customer);
    setIsFormOpen(true);
    setIsDetailOpen(true);
    setErrors({});
    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      company: customer.company || "",
      address: customer.address || "",
      taxNumber: customer.tax_number || "",
      status: customer.status || "active",
    });
    scrollToSection(formSectionRef);
  };

  const updateCustomer = async () => {
    if (!canEditCustomers) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.put(`/customers/${editId}/`, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        address: formData.address,
        tax_number: formData.taxNumber,
        status: formData.status,
      });

      await fetchPage(currentPage, currentSearch);
      setSelectedCustomer(response.data);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCustomer = async (id) => {
    if (!canDeleteCustomers) {
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/customers/${id}/`);
      refreshCurrentPage();
    } catch (error) {
      console.error(error);
      setErrors({ general: extractErrorMessage(error, "Unable to delete customer.") });
    }
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchCustomers();
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchCustomers]);

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Customers</h1>

      {canManageCustomers && (
        <CustomerForm
          formSectionRef={formSectionRef}
          formData={formData}
          errors={errors}
          editId={editId}
          isOpen={isFormOpen}
          onChange={handleInputChange}
          onSubmit={editId ? updateCustomer : createCustomer}
          onCancel={resetForm}
          onToggle={() => setIsFormOpen((previous) => !previous)}
        />
      )}

      <CustomerDetail
        detailSectionRef={detailSectionRef}
        customers={customers}
        selectedCustomer={selectedCustomer}
        isViewingCustomer={isViewingCustomer}
        isOpen={isDetailOpen}
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        onSelectCustomer={handleViewCustomer}
        onSearchChange={setSearch}
        onSearch={searchCustomers}
        onReset={() => {
          setSearch("");
          setCurrentSearch("");
          fetchPage(1, "");
        }}
        onEdit={editCustomer}
        onDelete={deleteCustomer}
        onPageChange={fetchPage}
        onToggle={() => setIsDetailOpen((previous) => !previous)}
        canEdit={canEditCustomers}
        canDelete={canDeleteCustomers}
      />
    </div>
  );
}

export default Customers;
