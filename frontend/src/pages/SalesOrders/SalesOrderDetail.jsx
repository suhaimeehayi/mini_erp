import Pagination from "../../components/Pagination";
import ProductTable from "../../components/DataTable";

function SalesOrderDetail({
  detailSectionRef,
  salesOrders,
  selectedOrder,
  isViewingOrder,
  isOpen,
  search,
  currentPage,
  totalPages,
  onSelectOrder,
  onSearchChange,
  onSearch,
  onReset,
  onEdit,
  onDelete,
  onPageChange,
  onToggle,
  canEdit,
  canDelete,
}) {
  const isDeliveredOrder = (order) => order.status === "delivered";
  const pendingOrders = salesOrders.filter((order) => order.status === "pending").length;
  const fulfilledOrders = salesOrders.filter((order) => ["shipping", "delivered"].includes(order.status)).length;

  const getStatusClasses = (status) => {
    if (status === "delivered") {
      return "bg-emerald-100 text-emerald-800";
    }
    if (status === "shipping") {
      return "bg-sky-100 text-sky-800";
    }
    if (status === "paid") {
      return "bg-green-100 text-green-800";
    }
    if (status === "pending") {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-red-100 text-red-800";
  };

  const columns = [
    { key: "order_id", label: "Order ID" },
    { key: "customer_name", label: "Customer" },
    { key: "date", label: "Date" },
    {
      key: "items",
      label: "Items",
      render: (item) => `${item.items.length} item(s) - $${item.total}`,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(item.status)}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "View",
      onClick: onSelectOrder,
      className: "bg-slate-500 hover:bg-slate-600 text-white px-3 py-1 rounded-md text-sm",
    },
    ...(canEdit ? [{
      label: "Edit",
      onClick: onEdit,
      disabled: isDeliveredOrder,
      title: (order) => isDeliveredOrder(order) ? "Delivered orders cannot be edited" : "Edit sales order",
      className: (_, isDisabled) => isDisabled
        ? "bg-gray-200 text-gray-500 px-3 py-1 rounded-md text-sm cursor-not-allowed"
        : "bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm",
    }] : []),
    ...(canDelete ? [{
      label: "Delete",
      onClick: (order) => onDelete(order.id),
      disabled: isDeliveredOrder,
      title: (order) => isDeliveredOrder(order) ? "Delivered orders cannot be deleted" : "Delete sales order",
      className: (_, isDisabled) => isDisabled
        ? "bg-gray-200 text-gray-500 px-3 py-1 rounded-md text-sm cursor-not-allowed"
        : "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm",
    }] : []),
  ];

  return (
    <>
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Sales Order List
            </h3>
            <p className="text-sm text-gray-500">
              Search and manage customer sales orders from the table section.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap md:max-w-xl w-full">
            <input
              type="text"
              placeholder="Search sales orders..."
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

        <ProductTable data={salesOrders} columns={columns} actions={actions} />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Visible Orders</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{salesOrders.length}</p>
        </div>
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-amber-700">{pendingOrders}</p>
        </div>
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Shipping / Delivered</p>
          <p className="mt-2 text-3xl font-semibold text-blue-700">{fulfilledOrders}</p>
        </div>
      </div>

      <div ref={detailSectionRef} tabIndex={-1} className="bg-white border rounded-xl shadow-sm p-5 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Sales Order Detail
            </h2>
            <p className="text-sm text-gray-500">
              Open the panel to inspect the selected sales order and its items.
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
            {isOpen ? "Sales order detail is open" : "Sales order detail is hidden"}
          </span>
          <span className={`rounded-full px-3 py-1 font-medium ${isOpen ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"}`}>
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {isOpen && (
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              {isViewingOrder ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-5 text-sm text-blue-700">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
                  Loading sales order detail...
                </div>
              ) : selectedOrder ? (
                <div className="mt-4 space-y-5 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Order ID</p>
                      <p className="font-medium text-gray-900">{selectedOrder.order_id || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Customer</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customer_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">{selectedOrder.date || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(selectedOrder.status)}`}>
                        {selectedOrder.status || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium text-gray-900">${selectedOrder.total || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Inventory Deducted</p>
                      <p className="font-medium text-gray-900">{selectedOrder.inventory_deducted ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  {selectedOrder.status === "delivered" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      This order is delivered. Inventory has been finalized and editing is locked.
                    </div>
                  )}

                  <div>
                    <p className="text-gray-500 mb-2">Items</p>
                    {selectedOrder.items?.length ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-left text-gray-700">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Product</th>
                              <th className="px-4 py-3 font-semibold">Quantity</th>
                              <th className="px-4 py-3 font-semibold">Unit Price</th>
                              <th className="px-4 py-3 font-semibold">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items.map((item) => (
                              <tr key={item.id} className="border-t">
                                <td className="px-4 py-3 text-gray-900">{item.product_name || "-"}</td>
                                <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                                <td className="px-4 py-3 text-gray-600">${item.unit_price}</td>
                                <td className="px-4 py-3 text-gray-600">${item.total_price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No items in this sales order.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Select a sales order from the table to view detailed information.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SalesOrderDetail;