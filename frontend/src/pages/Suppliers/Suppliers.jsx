import { useCallback, useEffect, useRef, useState } from "react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import SupplierDetail from "./SupplierDetail";
import SupplierForm from "./SupplierForm";
import { refreshCurrentPage } from "../../utils/pageRefresh";

const initialFormData = {
  name: "",
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  taxNumber: "",
  website: "",
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

function Suppliers() {
  const { hasPermission } = useAuth();
  const formSectionRef = useRef(null);
  const detailSectionRef = useRef(null);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isViewingSupplier, setIsViewingSupplier] = useState(false);
  const [search, setSearch] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ordering, setOrdering] = useState("");
  const [editId, setEditId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const canCreateSuppliers = hasPermission("add_suppliers");
  const canEditSuppliers = hasPermission("change_suppliers");
  const canDeleteSuppliers = hasPermission("delete_suppliers");
  const canManageSuppliers = canCreateSuppliers || canEditSuppliers;

  const scrollToSection = useCallback((sectionRef) => {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      sectionRef.current?.focus?.();
    });
  }, []);

  const fetchPage = useCallback(async (page, searchValue = currentSearch, orderingValue = ordering) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);

      if (searchValue) {
        params.append("search", searchValue);
      }

      if (orderingValue) {
        params.append("ordering", orderingValue);
      }

      const response = await api.get(`/suppliers/?${params.toString()}`);

      setSuppliers(response.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.data.count / 5));
      setSelectedSupplier((previousSupplier) => {
        if (!previousSupplier) {
          return response.data.results[0] || null;
        }

        return response.data.results.find((supplier) => supplier.id === previousSupplier.id) || response.data.results[0] || null;
      });
    } catch (error) {
      console.error(error);
    }
  }, [currentSearch, ordering]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchPage(1);
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchPage]);

  const validateForm = useCallback(() => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!formData.companyName.trim()) {
      nextErrors.companyName = "Company name is required";
    }

    if (!formData.contactPerson.trim()) {
      nextErrors.contactPerson = "Contact person is required";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone is required";
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

  const handleInputChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
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

  const searchSuppliers = async () => {
    setCurrentSearch(search);
    await fetchPage(1, search, ordering);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setEditId(null);
  };

  const createSupplier = async () => {
    if (!canCreateSuppliers) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.post("/suppliers/", {
        name: formData.name,
        company_name: formData.companyName,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        tax_number: formData.taxNumber,
        website: formData.website,
        status: formData.status,
      });

      await fetchPage(1, currentSearch, ordering);
      setSelectedSupplier(response.data);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const updateSupplier = async () => {
    if (!canEditSuppliers) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.put(`/suppliers/${editId}/`, {
        name: formData.name,
        company_name: formData.companyName,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        tax_number: formData.taxNumber,
        website: formData.website,
        status: formData.status,
      });

      await fetchPage(currentPage, currentSearch, ordering);
      setSelectedSupplier(response.data);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSupplier = async (id) => {
    if (!canDeleteSuppliers) {
      return;
    }

    if (!window.confirm("Are you sure you want to delete this supplier?")) {
      return;
    }

    try {
      await api.delete(`/suppliers/${id}/`);
      refreshCurrentPage();
    } catch (error) {
      console.error(error);
      setErrors({ general: extractErrorMessage(error, "Unable to delete supplier.") });
    }
  };

  const editSupplier = (supplier) => {
    if (!canEditSuppliers) {
      return;
    }

    setEditId(supplier.id);
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
    setIsDetailOpen(true);
    setErrors({});
    setFormData({
      name: supplier.name || "",
      companyName: supplier.company_name || "",
      contactPerson: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      taxNumber: supplier.tax_number || "",
      website: supplier.website || "",
      status: supplier.status || "active",
    });
    scrollToSection(formSectionRef);
  };

  const handleViewSupplier = async (supplier) => {
    setIsDetailOpen(true);
    setIsViewingSupplier(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSelectedSupplier(supplier);
    setIsViewingSupplier(false);
    scrollToSection(detailSectionRef);
  };

  const handleSort = (key, direction) => {
    const order = direction === "asc" ? key : `-${key}`;
    setOrdering(order);
    fetchPage(1, currentSearch, order);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Suppliers</h1>

      {canManageSuppliers && (
        <SupplierForm
          formSectionRef={formSectionRef}
          formData={formData}
          errors={errors}
          editId={editId}
          isOpen={isFormOpen}
          onChange={handleInputChange}
          onSubmit={editId ? updateSupplier : createSupplier}
          onCancel={resetForm}
          onToggle={() => setIsFormOpen((previous) => !previous)}
        />
      )}

      <SupplierDetail
        detailSectionRef={detailSectionRef}
        suppliers={suppliers}
        selectedSupplier={selectedSupplier}
        isViewingSupplier={isViewingSupplier}
        isOpen={isDetailOpen}
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        onSelectSupplier={handleViewSupplier}
        onSearchChange={setSearch}
        onSearch={searchSuppliers}
        onReset={() => {
          setSearch("");
          setCurrentSearch("");
          setOrdering("");
          fetchPage(1, "", "");
        }}
        onEdit={editSupplier}
        onDelete={deleteSupplier}
        onPageChange={fetchPage}
        onSort={handleSort}
        onToggle={() => setIsDetailOpen((previous) => !previous)}
        canEdit={canEditSuppliers}
        canDelete={canDeleteSuppliers}
      />
    </div>
  );
}

export default Suppliers;