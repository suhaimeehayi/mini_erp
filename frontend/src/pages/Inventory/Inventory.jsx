import { useCallback, useEffect, useRef, useState } from "react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import InventoryDetail from "./InventoryDetail";
import InventoryForm from "./InventoryForm";
import { fetchAllPages } from "../../services/apiHelpers";

const initialFormData = {
  product: "",
  quantity: "",
  minimumStock: "",
  location: "",
};

function Inventory() {
  const { hasPermission } = useAuth();
  const formSectionRef = useRef(null);
  const [stocks, setStocks] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [movementHistory, setMovementHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isLowStockOpen, setIsLowStockOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");
  const [ordering, setOrdering] = useState("");
  const canCreateInventory = hasPermission("add_inventory");
  const canEditInventory = hasPermission("change_inventory");
  const canDeleteInventory = hasPermission("delete_inventory");
  const canManageInventory = canCreateInventory || canEditInventory;

  const scrollToSection = useCallback((sectionRef) => {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      sectionRef.current?.focus?.();
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!canManageInventory) {
      setProducts([]);
      return;
    }

    try {
      const productData = await fetchAllPages("/products/");
      setProducts(productData);
    } catch (error) {
      console.error("Product fetch error", error);
    }
  }, [canManageInventory]);

  const fetchLowStockItems = useCallback(async () => {
    try {
      const response = await api.get("/inventory/low_stock/");
      setLowStockItems(response.data.results || []);
    } catch (error) {
      console.error("Low stock fetch error", error);
    }
  }, []);

  const fetchMovementHistory = useCallback(async () => {
    try {
      const response = await api.get("/inventory/movements/");
      setMovementHistory(response.data.results || response.data || []);
    } catch (error) {
      console.error("Movement history fetch error", error);
    }
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

      const response = await api.get(`/inventory/?${params.toString()}`);

      setStocks(response.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.data.count / 5));
    } catch (error) {
      console.error(error);
    }
  }, [currentSearch, ordering]);

  const fetchStocks = useCallback(async () => {
    await fetchPage(1, currentSearch, ordering);
  }, [currentSearch, fetchPage, ordering]);

  const refreshInventoryData = useCallback(async () => {
    await Promise.all([
      fetchStocks(),
      fetchProducts(),
      fetchLowStockItems(),
      fetchMovementHistory(),
    ]);
  }, [fetchLowStockItems, fetchMovementHistory, fetchProducts, fetchStocks]);

  const validateForm = useCallback(() => {
    const nextErrors = {};

    if (!formData.product) {
      nextErrors.product = "Product required";
    }

    if (!formData.quantity || Number(formData.quantity) < 0) {
      nextErrors.quantity = "Quantity must be >= 0";
    }

    if (!formData.minimumStock || Number(formData.minimumStock) < 0) {
      nextErrors.minimumStock = "Minimum stock must be >= 0";
    }

    if (!formData.location.trim()) {
      nextErrors.location = "Location required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setEditId(null);
    setErrors({});
    setFormData(initialFormData);
  }, []);

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

  const searchStocks = async () => {
    setCurrentSearch(search);
    await fetchPage(1, search, ordering);
  };

  const handleSort = (key, direction) => {
    const keyMap = {
      product_name: "product__name",
      sku: "product__sku",
      supplier: "product__supplier__name",
      quantity: "quantity",
      minimum_stock: "minimum_stock",
    };

    const backendKey = keyMap[key] || key;
    const order = direction === "asc" ? backendKey : `-${backendKey}`;
    setOrdering(order);
    fetchPage(1, currentSearch, order);
  };

  const createStock = async () => {
    if (!canCreateInventory) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const confirmAdd = window.confirm("Add this inventory item?");
    if (!confirmAdd) return;

    try {
      await api.post("/inventory/", {
        product: formData.product,
        quantity: formData.quantity,
        minimum_stock: formData.minimumStock,
        location: formData.location,
      });

      await refreshInventoryData();
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const editStock = (stock) => {
    if (!canEditInventory) {
      return;
    }

    setEditId(stock.id);
    setErrors({});
    setIsFormOpen(true);
    setFormData({
      product: stock.product,
      quantity: stock.quantity,
      minimumStock: stock.minimum_stock,
      location: stock.location,
    });
    scrollToSection(formSectionRef);
  };

  const updateStock = async () => {
    if (!canEditInventory) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const confirmUpdate = window.confirm("Update this inventory item?");
    if (!confirmUpdate) return;

    try {
      await api.put(`/inventory/${editId}/`, {
        product: formData.product,
        quantity: formData.quantity,
        minimum_stock: formData.minimumStock,
        location: formData.location,
      });

      await refreshInventoryData();
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteStock = async (id) => {
    if (!canDeleteInventory) {
      return;
    }

    const confirmDelete = window.confirm("Delete this inventory item?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/inventory/${id}/`);
      await refreshInventoryData();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      refreshInventoryData();
    }, 0);

    return () => clearTimeout(timerId);
  }, [refreshInventoryData]);

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Inventory</h1>

      {canManageInventory && (
        <InventoryForm
          formSectionRef={formSectionRef}
          formData={formData}
          errors={errors}
          editId={editId}
          products={products}
          isOpen={isFormOpen}
          onChange={handleInputChange}
          onSubmit={editId ? updateStock : createStock}
          onCancel={resetForm}
          onToggle={() => setIsFormOpen((previous) => !previous)}
        />
      )}

      <InventoryDetail
        stocks={stocks}
        movementHistory={movementHistory}
        lowStockItems={lowStockItems}
        isInsightsOpen={isInsightsOpen}
        isLowStockOpen={isLowStockOpen}
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        onSearchChange={setSearch}
        onSearch={searchStocks}
        onReset={() => {
          setSearch("");
          setCurrentSearch("");
          setOrdering("");
          fetchPage(1, "", "");
        }}
        onEdit={editStock}
        onDelete={deleteStock}
        onPageChange={fetchPage}
        onSort={handleSort}
        onToggleInsights={() => setIsInsightsOpen((previous) => !previous)}
        onToggleLowStock={() => setIsLowStockOpen((previous) => !previous)}
        canEdit={canEditInventory}
        canDelete={canDeleteInventory}
      />
    </div>
  );
}

export default Inventory;