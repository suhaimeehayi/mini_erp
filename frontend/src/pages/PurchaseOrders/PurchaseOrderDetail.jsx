import Pagination from "../../components/Pagination";
import ProductTable from "../../components/DataTable";

function PurchaseOrderDetail({
  detailSectionRef,
  purchaseOrders,
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
  const pendingOrders = purchaseOrders.filter((order) => order.status === "pending").length;
  const receivedOrders = purchaseOrders.filter((order) => order.status === "received").length;

  const columns = [
    { key: "po_number", label: "PO Number" },
    { key: "supplier_name", label: "Supplier" },
    { key: "order_date", label: "Order Date" },
    {
      key: "items",
      label: "Items",
      render: (item) => `${item.items.length} item(s) - $${item.total_amount}`,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          item.status === "received"
            ? "bg-green-100 text-green-800"
            : item.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
        }`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
    {
      key: "inventory_received",
      label: "Inventory",
      render: (item) => item.inventory_received ? "Updated" : "Pending",
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
      className: "bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm",
    }] : []),
    ...(canDelete ? [{
      label: "Delete",
      onClick: (order) => onDelete(order.id),
      className: "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm",
    }] : []),
  ];

  return (
    <>
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Purchase Order List
            </h3>
            <p className="text-sm text-gray-500">
              Search and manage supplier purchase orders from the table section.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap md:max-w-xl w-full">
            <input
              type="text"
              placeholder="Search purchase orders..."
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

        <ProductTable data={purchaseOrders} columns={columns} actions={actions} />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Visible Orders</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{purchaseOrders.length}</p>
        </div>
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-amber-700">{pendingOrders}</p>
        </div>
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Received</p>
          <p className="mt-2 text-3xl font-semibold text-green-700">{receivedOrders}</p>
        </div>
      </div>

      <div ref={detailSectionRef} tabIndex={-1} className="bg-white border rounded-xl shadow-sm p-5 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Purchase Order Detail
            </h2>
            <p className="text-sm text-gray-500">
              Open the panel to inspect the selected purchase order and its items.
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
            {isOpen ? "Purchase order detail is open" : "Purchase order detail is hidden"}
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
                  Loading purchase order detail...
                </div>
              ) : selectedOrder ? (
                <div className="mt-4 space-y-5 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">PO Number</p>
                      <p className="font-medium text-gray-900">{selectedOrder.po_number || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Supplier</p>
                      <p className="font-medium text-gray-900">{selectedOrder.supplier_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Order Date</p>
                      <p className="font-medium text-gray-900">{selectedOrder.order_date || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedOrder.status || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <p className="font-medium text-gray-900">${selectedOrder.total_amount || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Inventory Updated</p>
                      <p className="font-medium text-gray-900">{selectedOrder.inventory_received ? "Yes" : "No"}</p>
                    </div>
                  </div>

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
                      <p className="text-gray-500">No items in this purchase order.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Select a purchase order from the table to view detailed information.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PurchaseOrderDetail;