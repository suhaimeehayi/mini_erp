import { useCallback, useEffect, useRef, useState } from "react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import SalesOrderDetail from "./SalesOrderDetail";
import SalesOrderForm from "./SalesOrderForm";
import { createSalesOrder, deleteSalesOrder, updateSalesOrder } from "../../services/salesOrderService";
import { fetchAllPages } from "../../services/apiHelpers";

const initialFormData = {
  customer: "",
  date: "",
  status: "pending",
  selectedProduct: "",
  quantity: "",
  unitPrice: "",
};

function SalesOrders() {
  const { hasPermission } = useAuth();
  const formSectionRef = useRef(null);
  const detailSectionRef = useRef(null);
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewingOrder, setIsViewingOrder] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");
  const canCreateSalesOrders = hasPermission("add_sales_orders");
  const canEditSalesOrders = hasPermission("change_sales_orders");
  const canDeleteSalesOrders = hasPermission("delete_sales_orders");
  const canManageSalesOrders = canCreateSalesOrders || canEditSalesOrders;

  const scrollToSection = useCallback((sectionRef) => {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      sectionRef.current?.focus?.();
    });
  }, []);

  const fetchCustomers = useCallback(async () => {
    if (!canManageSalesOrders) {
      setCustomers([]);
      return;
    }

    try {
      const customerData = await fetchAllPages("/customers/");
      setCustomers(customerData);
    } catch (error) {
      console.error("Customer fetch error", error);
    }
  }, [canManageSalesOrders]);

  const fetchProducts = useCallback(async () => {
    if (!canManageSalesOrders) {
      setProducts([]);
      return;
    }

    try {
      const productData = await fetchAllPages("/products/");
      setProducts(productData);
    } catch (error) {
      console.error("Product fetch error", error);
    }
  }, [canManageSalesOrders]);

  const fetchPage = useCallback(async (page, searchValue = currentSearch) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);

      if (searchValue) {
        params.append("search", searchValue);
      }

      const response = await api.get(`/sales-orders/?${params.toString()}`);

      setSalesOrders(response.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.data.count / 5));
      setSelectedOrder((previousOrder) => {
        if (!previousOrder) {
          return response.data.results[0] || null;
        }

        return response.data.results.find((order) => order.id === previousOrder.id) || response.data.results[0] || null;
      });
    } catch (error) {
      console.error(error);
    }
  }, [currentSearch]);

  const fetchSalesOrders = useCallback(async () => {
    await fetchPage(1, currentSearch);
  }, [currentSearch, fetchPage]);

  const refreshSalesData = useCallback(async () => {
    await Promise.all([
      fetchPage(currentPage, currentSearch),
      fetchCustomers(),
      fetchProducts(),
    ]);
  }, [currentPage, currentSearch, fetchCustomers, fetchPage, fetchProducts]);

  const validateForm = useCallback(() => {
    const nextErrors = {};

    if (!formData.customer) {
      nextErrors.customer = "Customer required";
    }
    if (!formData.date) {
      nextErrors.date = "Date required";
    }
    if (!formData.selectedProduct) {
      nextErrors.selectedProduct = "Product required";
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      nextErrors.quantity = "Quantity must be greater than 0";
    }
    if (!formData.unitPrice || Number(formData.unitPrice) <= 0) {
      nextErrors.unitPrice = "Unit price must be greater than 0";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

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
  };

  const searchSalesOrders = async () => {
    setCurrentSearch(search);
    await fetchPage(1, search);
  };

  const handleViewOrder = async (order) => {
    setIsDetailOpen(true);
    setIsViewingOrder(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSelectedOrder(order);
    setIsViewingOrder(false);
    scrollToSection(detailSectionRef);
  };

  const createOrder = async () => {
    if (!canCreateSalesOrders) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const confirmAdd = window.confirm("Create this sales order?");
    if (!confirmAdd) return;

    try {
      const response = await createSalesOrder({
        customer: formData.customer,
        date: formData.date,
        status: formData.status,
        items_data: [{
          product: Number(formData.selectedProduct),
          quantity: Number(formData.quantity),
          unit_price: Number(formData.unitPrice),
        }],
      });

      await refreshSalesData();
      setSelectedOrder(response);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const editOrder = (order) => {
    if (!canEditSalesOrders) {
      return;
    }

    setEditId(order.id);
    setSelectedOrder(order);
    setIsFormOpen(true);
    setIsDetailOpen(true);
    setErrors({});
    setFormData({
      customer: order.customer || "",
      date: order.date || "",
      status: order.status || "pending",
      selectedProduct: order.items?.[0]?.product || "",
      quantity: order.items?.[0]?.quantity || "",
      unitPrice: order.items?.[0]?.unit_price || "",
    });
    scrollToSection(formSectionRef);
  };

  const updateOrder = async () => {
    if (!canEditSalesOrders) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const confirmUpdate = window.confirm("Update this sales order?");
    if (!confirmUpdate) return;

    try {
      const response = await updateSalesOrder(editId, {
        customer: formData.customer,
        date: formData.date,
        status: formData.status,
        items_data: [{
          product: Number(formData.selectedProduct),
          quantity: Number(formData.quantity),
          unit_price: Number(formData.unitPrice),
        }],
      });

      await refreshSalesData();
      setSelectedOrder(response);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteOrder = async (id) => {
    if (!canDeleteSalesOrders) {
      return;
    }

    const confirmDelete = window.confirm("Delete this sales order?");
    if (!confirmDelete) return;

    try {
      await deleteSalesOrder(id);

      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }

      await refreshSalesData();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchSalesOrders();
      await fetchCustomers();
      await fetchProducts();
    };

    loadData();
  }, [fetchCustomers, fetchProducts, fetchSalesOrders]);

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Sales Orders</h1>

      {canManageSalesOrders && (
        <SalesOrderForm
          formSectionRef={formSectionRef}
          formData={formData}
          errors={errors}
          editId={editId}
          customers={customers}
          products={products}
          isOpen={isFormOpen}
          onChange={handleInputChange}
          onSubmit={editId ? updateOrder : createOrder}
          onCancel={resetForm}
          onToggle={() => setIsFormOpen((previous) => !previous)}
        />
      )}

      <SalesOrderDetail
        detailSectionRef={detailSectionRef}
        salesOrders={salesOrders}
        selectedOrder={selectedOrder}
        isViewingOrder={isViewingOrder}
        isOpen={isDetailOpen}
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        onSelectOrder={handleViewOrder}
        onSearchChange={setSearch}
        onSearch={searchSalesOrders}
        onReset={() => {
          setSearch("");
          setCurrentSearch("");
          fetchPage(1, "");
        }}
        onEdit={editOrder}
        onDelete={deleteOrder}
        onPageChange={fetchPage}
        onToggle={() => setIsDetailOpen((previous) => !previous)}
        canEdit={canEditSalesOrders}
        canDelete={canDeleteSalesOrders}
      />
    </div>
  );
}

export default SalesOrders;