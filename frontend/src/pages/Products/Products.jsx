import { useCallback, useEffect, useRef, useState } from "react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import ProductDetail from "./ProductDetail";
import ProductForm from "./ProductForm";
import { fetchAllPages } from "../../services/apiHelpers";

const initialFormData = {
  name: "",
  sku: "",
  description: "",
  price: "",
  supplier: "",
};

const getFieldError = (value) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
};

const getProductFormErrors = (error) => {
  const data = error.response?.data;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  return {
    name: getFieldError(data.name),
    sku: getFieldError(data.sku),
    price: getFieldError(data.price),
    supplier: getFieldError(data.supplier_id) || getFieldError(data.supplier),
  };
};

function Products() {
  const { hasPermission } = useAuth();
  const detailSectionRef = useRef(null);
  const formSectionRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewingProduct, setIsViewingProduct] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const canCreateProducts = hasPermission("add_products");
  const canEditProducts = hasPermission("change_products");
  const canDeleteProducts = hasPermission("delete_products");
  const canManageProducts = canCreateProducts || canEditProducts;

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
    if (!canManageProducts) {
      setSuppliers([]);
      return;
    }

    try {
      const supplierData = await fetchAllPages("/suppliers/");
      setSuppliers(supplierData);
    } catch (error) {
      console.error("Supplier fetch error", error);
    }
  }, [canManageProducts]);

  const validateForm = useCallback(() => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Product name required";
    }

     if (!formData.sku.trim()) {
      nextErrors.sku = "SKU required";
    }

    if (!formData.price) {
      nextErrors.price = "Price required";
    } else if (Number(formData.price) <= 0) {
      nextErrors.price = "Price must be greater than 0";
    }

    if (!formData.supplier) {
      nextErrors.supplier = "Supplier required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

  const fetchPage = useCallback(async (
    page,
    searchValue = currentSearch,
    sortKeyParam = sortKey,
    sortDirectionParam = sortDirection,
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);

      if (searchValue) {
        params.append("search", searchValue);
      }

      if (sortKeyParam) {
        const ordering = sortDirectionParam === "desc" ? `-${sortKeyParam}` : sortKeyParam;
        params.append("ordering", ordering);
      }

      const response = await api.get(`/products/?${params.toString()}`);

      setProducts(response.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.data.count / 5));
      setSelectedProduct((previousProduct) => {
        if (!previousProduct) {
          return response.data.results[0] || null;
        }

        return response.data.results.find((product) => product.id === previousProduct.id)
          || response.data.results[0]
          || null;
      });
    } catch (error) {
      console.error(error);
    }
  }, [currentSearch, sortDirection, sortKey]);

  const fetchProducts = useCallback(async () => {
    await fetchPage(1, currentSearch, sortKey, sortDirection);
  }, [currentSearch, fetchPage, sortDirection, sortKey]);

  const searchProducts = async () => {
    setCurrentSearch(search);
    await fetchPage(1, search, sortKey, sortDirection);
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
  };

  const handleSort = (key, direction) => {
    setSortKey(key);
    setSortDirection(direction);
    fetchPage(1, currentSearch, key, direction);
  };

  const handleViewProduct = async (product) => {
    setIsDetailOpen(true);
    setIsViewingProduct(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSelectedProduct(product);
    setIsViewingProduct(false);
    scrollToSection(detailSectionRef);
  };

  const createProduct = async () => {
    if (!canCreateProducts) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const confirmAdd = window.confirm("Create this product?");
    if (!confirmAdd) return;

    try {
      setErrors({});
      const response = await api.post("/products/", {
        name: formData.name,
        sku: formData.sku.trim(),
        description: formData.description,
        price: formData.price,
        supplier_id: formData.supplier,
      });

      await fetchPage(1, currentSearch, sortKey, sortDirection);
      setSelectedProduct(response.data);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      const fieldErrors = getProductFormErrors(error);

      if (Object.values(fieldErrors).some(Boolean)) {
        setErrors((previousErrors) => ({
          ...previousErrors,
          ...fieldErrors,
        }));
      }

      console.error(error);
    }
  };

  const editProduct = (product) => {
    if (!canEditProducts) {
      return;
    }

    setEditId(product.id);
    setSelectedProduct(product);
    setIsFormOpen(true);
    setIsDetailOpen(true);
    setErrors({});
    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      price: product.price || "",
      supplier: product.supplier?.id || "",
    });
    scrollToSection(formSectionRef);
  };

  const updateProduct = async () => {
    if (!canEditProducts) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const confirmUpdate = window.confirm("Update this product?");
    if (!confirmUpdate) return;

    try {
      setErrors({});
      const response = await api.put(`/products/${editId}/`, {
        name: formData.name,
        sku: formData.sku.trim(),
        description: formData.description,
        price: formData.price,
        supplier_id: formData.supplier,
      });

      await fetchPage(currentPage, currentSearch, sortKey, sortDirection);
      setSelectedProduct(response.data);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      resetForm();
    } catch (error) {
      const fieldErrors = getProductFormErrors(error);

      if (Object.values(fieldErrors).some(Boolean)) {
        setErrors((previousErrors) => ({
          ...previousErrors,
          ...fieldErrors,
        }));
      }

      console.error(error);
    }
  };

  const deleteProduct = async (id) => {
    if (!canDeleteProducts) {
      return;
    }

    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}/`);

      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }

      await fetchPage(currentPage, currentSearch, sortKey, sortDirection);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      Promise.all([
        fetchProducts(),
        fetchSuppliers(),
      ]);
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchProducts, fetchSuppliers]);

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Products</h1>

      {canManageProducts && (
        <ProductForm
          formSectionRef={formSectionRef}
          formData={formData}
          errors={errors}
          editId={editId}
          suppliers={suppliers}
          isOpen={isFormOpen}
          onChange={handleInputChange}
          onSubmit={editId ? updateProduct : createProduct}
          onCancel={resetForm}
          onToggle={() => setIsFormOpen((previous) => !previous)}
        />
      )}

      <ProductDetail
        detailRef={detailSectionRef}
        products={products}
        selectedProduct={selectedProduct}
        isViewingProduct={isViewingProduct}
        isOpen={isDetailOpen}
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        onSelectProduct={handleViewProduct}
        onSearchChange={setSearch}
        onSearch={searchProducts}
        onReset={() => {
          setSearch("");
          setCurrentSearch("");
          fetchPage(1, "", sortKey, sortDirection);
        }}
        onEdit={editProduct}
        onDelete={deleteProduct}
        onPageChange={fetchPage}
        onSort={handleSort}
        onToggle={() => setIsDetailOpen((previous) => !previous)}
        canEdit={canEditProducts}
        canDelete={canDeleteProducts}
      />
    </div>
  );
}

export default Products;