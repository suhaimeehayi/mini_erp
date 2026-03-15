import Pagination from "../../components/Pagination";
import ProductTable from "../../components/DataTable";

function InventoryDetail({
  stocks,
  movementHistory,
  lowStockItems,
  isInsightsOpen,
  isLowStockOpen,
  search,
  currentPage,
  totalPages,
  onSearchChange,
  onSearch,
  onReset,
  onEdit,
  onDelete,
  onPageChange,
  onSort,
  onToggleInsights,
  onToggleLowStock,
  canEdit,
  canDelete,
}) {
  const columns = [
    { key: "product_name", label: "Product Name" },
    { key: "sku", label: "SKU" },
    { key: "supplier", label: "Supplier", sortKey: "product__supplier__name" },
    { key: "quantity", label: "Stock Quantity" },
    { key: "minimum_stock", label: "Minimum Stock" },
    {
      key: "stock_status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.stock_status === "In Stock"
            ? "bg-green-100 text-green-800"
            : item.stock_status === "Low Stock"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
        }`}>
          {item.stock_status}
        </span>
      ),
    },
  ];

  const actions = [
    ...(canEdit ? [{
      label: "Edit",
      onClick: onEdit,
      className: "bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm",
    }] : []),
    ...(canDelete ? [{
      label: "Delete",
      onClick: (stock) => onDelete(stock.id),
      className: "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm",
    }] : []),
  ];

  return (
    <>
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Inventory List
            </h3>
            <p className="text-sm text-gray-500">
              Search, sort, and manage inventory records from the table section.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap md:max-w-xl w-full">
            <input
              type="text"
              placeholder="Search inventory..."
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
          data={stocks}
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

      <div className="bg-white border rounded-xl shadow-sm p-5 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Inventory Insights
            </h2>
            <p className="text-sm text-gray-500">
              Review recent stock movement history and low stock alerts in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleInsights}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            {isInsightsOpen ? "Hide Panel" : "Show Panel"}
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <span>
            {isInsightsOpen ? "Inventory insights are open" : "Inventory insights are hidden"}
          </span>
          <span className={`rounded-full px-3 py-1 font-medium ${isInsightsOpen ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"}`}>
            {isInsightsOpen ? "Open" : "Closed"}
          </span>
        </div>

        {isInsightsOpen && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Stock Movement History</h2>
                  <p className="text-sm text-gray-500">Latest inventory changes from sales, purchases, and manual adjustments.</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {movementHistory.length} recent record(s)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Change</th>
                      <th className="px-4 py-3 font-semibold">After</th>
                      <th className="px-4 py-3 font-semibold">Reference</th>
                      <th className="px-4 py-3 font-semibold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movementHistory.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                          No stock movement history yet.
                        </td>
                      </tr>
                    ) : (
                      movementHistory.map((movement) => (
                        <tr key={movement.id} className="border-t">
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(movement.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{movement.product_name}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                              {movement.movement_type_display}
                            </span>
                          </td>
                          <td className={`px-4 py-3 font-semibold ${movement.quantity_change >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {movement.quantity_change >= 0 ? "+" : ""}{movement.quantity_change}
                          </td>
                          <td className="px-4 py-3">{movement.quantity_after}</td>
                          <td className="px-4 py-3 text-gray-600">{movement.reference || "-"}</td>
                          <td className="px-4 py-3 text-gray-600">{movement.note || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {lowStockItems.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-amber-900">
                      Low Stock Notification
                    </h2>
                    <p className="mt-1 text-sm text-amber-800">
                      {lowStockItems.length} item(s) are at or below minimum stock and may need replenishment.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-semibold text-amber-900">
                      {lowStockItems.length} alert(s)
                    </span>
                    <button
                      type="button"
                      onClick={onToggleLowStock}
                      className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                    >
                      {isLowStockOpen ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {isLowStockOpen && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {lowStockItems.slice(0, 6).map((item) => (
                      <div key={item.id} className="rounded-xl border border-amber-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-500">{item.sku}</p>
                          </div>
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                            {item.stock_status}
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-gray-700">
                          <p>Current: <span className="font-semibold">{item.quantity}</span></p>
                          <p>Minimum: <span className="font-semibold">{item.minimum_stock}</span></p>
                          <p>Location: <span className="font-semibold">{item.location}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default InventoryDetail;