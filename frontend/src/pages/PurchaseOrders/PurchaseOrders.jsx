import { useCallback, useEffect, useRef, useState } from "react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { createPurchaseOrder, deletePurchaseOrder, updatePurchaseOrder } from "../../services/purchaseOrderService";
import { fetchAllPages } from "../../services/apiHelpers";
import { refreshCurrentPage } from "../../utils/pageRefresh";

const initialFormData = {
  supplier: "",
  orderDate: "",
  status: "pending",
  selectedProduct: "",
  quantity: "",
  unitPrice: "",
};

function PurchaseOrders() {
  const { hasPermission } = useAuth();
  const formSectionRef = useRef(null);
  const detailSectionRef = useRef(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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
  const canCreatePurchaseOrders = hasPermission("add_purchase_orders");
  const canEditPurchaseOrders = hasPermission("change_purchase_orders");
  const canDeletePurchaseOrders = hasPermission("delete_purchase_orders");
  const canManagePurchaseOrders = canCreatePurchaseOrders || canEditPurchaseOrders;

  const scrollToSection = useCallback((sectionRef) => {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      sectionRef.current?.focus?.();
    });
  }, []);

  const fetchSuppliers = useCallback(async () => {
    if (!canManagePurchaseOrders) {
      setSuppliers([]);
      return;
    }

    try {
      const supplierData = await fetchAllPages("/suppliers/");
      setSuppliers(supplierData.filter((supplier) => supplier.status === "active"));
    } catch (error) {
      console.error("Supplier fetch error", error);
    }
  }, [canManagePurchaseOrders]);

  const fetchProducts = useCallback(async () => {
    if (!canManagePurchaseOrders) {
      setProducts([]);
      return;
    }

    try {
      const productData = await fetchAllPages("/products/");
      setProducts(productData);
    } catch (error) {
      console.error("Product fetch error", error);
    }
  }, [canManagePurchaseOrders]);

  const fetchPage = useCallback(async (page, searchValue = currentSearch) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);

      if (searchValue) {
        params.append("search", searchValue);
      }

      const response = await api.get(`/purchase-orders/?${params.toString()}`);

      setPurchaseOrders(response.data.results);
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

  const fetchPurchaseOrders = useCallback(async () => {
    await fetchPage(1, currentSearch);
  }, [currentSearch, fetchPage]);

  const refreshPurchaseData = useCallback(async () => {
    await Promise.all([
      fetchPage(currentPage, currentSearch),
      fetchSuppliers(),
      fetchProducts(),
    ]);
  }, [currentPage, currentSearch, fetchPage, fetchProducts, fetchSuppliers]);

  const validateForm = useCallback(() => {
    const nextErrors = {};

    if (!formData.supplier) {
      nextErrors.supplier = "Supplier required";
    }
    if (!formData.orderDate) {
      nextErrors.orderDate = "Order date required";
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

  const searchPurchaseOrders = async () => {
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
    if (!canCreatePurchaseOrders) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const confirmAdd = window.confirm("Create this purchase order?");
    if (!confirmAdd) return;

    try {
      const response = await createPurchaseOrder({
        supplier: formData.supplier,
        order_date: formData.orderDate,
        status: formData.status,
        items_data: [{
          product: Number(formData.selectedProduct),
          quantity: Number(formData.quantity),
          unit_price: Number(formData.unitPrice),
        }],
      });

      await refreshPurchaseData();
      setSelectedOrder(response);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const editOrder = (order) => {
    if (!canEditPurchaseOrders) {
      return;
    }

    setEditId(order.id);
    setSelectedOrder(order);
    setIsFormOpen(true);
    setIsDetailOpen(true);
    setErrors({});
    setFormData({
      supplier: order.supplier || "",
      orderDate: order.order_date || "",
      status: order.status || "pending",
      selectedProduct: order.items?.[0]?.product || "",
      quantity: order.items?.[0]?.quantity || "",
      unitPrice: order.items?.[0]?.unit_price || "",
    });
    scrollToSection(formSectionRef);
  };

  const updateOrder = async () => {
    if (!canEditPurchaseOrders) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const confirmUpdate = window.confirm("Update this purchase order?");
    if (!confirmUpdate) return;

    try {
      const response = await updatePurchaseOrder(editId, {
        supplier: formData.supplier,
        order_date: formData.orderDate,
        status: formData.status,
        items_data: [{
          product: Number(formData.selectedProduct),
          quantity: Number(formData.quantity),
          unit_price: Number(formData.unitPrice),
        }],
      });

      await refreshPurchaseData();
      setSelectedOrder(response);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteOrder = async (id) => {
    if (!canDeletePurchaseOrders) {
      return;
    }

    const confirmDelete = window.confirm("Delete this purchase order?");
    if (!confirmDelete) return;

    try {
      await deletePurchaseOrder(id);
      refreshCurrentPage();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchPurchaseOrders();
      await fetchSuppliers();
      await fetchProducts();
    };

    loadData();
  }, [fetchProducts, fetchPurchaseOrders, fetchSuppliers]);

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Purchase Orders</h1>

      {canManagePurchaseOrders && (
        <PurchaseOrderForm
          formSectionRef={formSectionRef}
          formData={formData}
          errors={errors}
          editId={editId}
          suppliers={suppliers}
          products={products}
          isOpen={isFormOpen}
          onChange={handleInputChange}
          onSubmit={editId ? updateOrder : createOrder}
          onCancel={resetForm}
          onToggle={() => setIsFormOpen((previous) => !previous)}
        />
      )}

      <PurchaseOrderDetail
        detailSectionRef={detailSectionRef}
        purchaseOrders={purchaseOrders}
        selectedOrder={selectedOrder}
        isViewingOrder={isViewingOrder}
        isOpen={isDetailOpen}
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        onSelectOrder={handleViewOrder}
        onSearchChange={setSearch}
        onSearch={searchPurchaseOrders}
        onReset={() => {
          setSearch("");
          setCurrentSearch("");
          fetchPage(1, "");
        }}
        onEdit={editOrder}
        onDelete={deleteOrder}
        onPageChange={fetchPage}
        onToggle={() => setIsDetailOpen((previous) => !previous)}
        canEdit={canEditPurchaseOrders}
        canDelete={canDeletePurchaseOrders}
      />
    </div>
  );
}

export default PurchaseOrders;