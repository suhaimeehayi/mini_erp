import Pagination from "../../components/Pagination";
import ProductTable from "../../components/DataTable";

function ProductDetail({
  detailRef,
  products,
  selectedProduct,
  isViewingProduct,
  isOpen,
  search,
  currentPage,
  totalPages,
  onSelectProduct,
  onSearchChange,
  onSearch,
  onReset,
  onEdit,
  onDelete,
  onPageChange,
  onSort,
  onToggle,
  canEdit,
  canDelete,
}) {
  const columns = [
    { key: "name", label: "Name" },
    { key: "sku", label: "SKU" },
    { key: "description", label: "Description" },
    {
      key: "price",
      label: "Price",
      render: (item) => `$${item.price}`,
    },
    {
      key: "supplier_name",
      label: "Supplier",
      render: (item) => item.supplier_name || item.supplier?.name || "-",
      sortKey: "supplier__name",
    },
  ];

  const actions = [
    {
      label: "View",
      onClick: onSelectProduct,
      className:
        "bg-slate-500 hover:bg-slate-600 text-white px-3 py-1 rounded-md text-sm",
    },
    ...(canEdit ? [{
      label: "Edit",
      onClick: onEdit,
      className:
        "bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm",
    }] : []),
    ...(canDelete ? [{
      label: "Delete",
      onClick: (product) => onDelete(product.id),
      className:
        "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm",
    }] : []),
  ];

  return (
    <>
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Product List
            </h3>
            <p className="text-sm text-gray-500">
              Search, sort, and manage product records from the table section.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap md:max-w-xl w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border rounded-lg px-3 py-2 flex-1"
            />

            <button
              onClick={onSearch}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg"
            >
              Search
            </button>

            <button
              onClick={onReset}
              className="bg-gray-500 text-white px-5 py-2 rounded-lg"
            >
              Reset
            </button>
          </div>
        </div>

        <ProductTable
          data={products}
          columns={columns}
          actions={actions}
          onSort={onSort}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <div
        ref={detailRef}
        tabIndex={-1}
        className="bg-white border rounded-xl shadow-sm p-5 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Product Detail
            </h2>
            <p className="text-sm text-gray-500">
              Open the panel to inspect the selected product and related supplier data.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            {isOpen ? "Hide Panel" : "Show Panel"}
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <span>
            {isOpen ? "Product detail is open" : "Product detail is hidden"}
          </span>
          <span className={`rounded-full px-3 py-1 font-medium ${isOpen ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"}`}>
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {isOpen && (
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              {isViewingProduct ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-5 text-sm text-blue-700">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
                  Loading product detail...
                </div>
              ) : selectedProduct ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedProduct.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">SKU</p>
                    <p className="font-medium text-gray-900">
                      {selectedProduct.sku || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="font-medium text-gray-900">
                      {selectedProduct.price ? `$${selectedProduct.price}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Supplier</p>
                    <p className="font-medium text-gray-900">
                      {selectedProduct.supplier_name || selectedProduct.supplier?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created At</p>
                    <p className="font-medium text-gray-900">
                      {selectedProduct.created_at
                        ? new Date(selectedProduct.created_at).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Supplier ID</p>
                    <p className="font-medium text-gray-900">
                      {selectedProduct.supplier?.id || "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Description</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">
                      {selectedProduct.description || "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Select a product from the table to view detailed information.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDetail;