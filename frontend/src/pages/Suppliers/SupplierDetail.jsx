import Pagination from "../../components/Pagination";
import DataTable from "../../components/DataTable";

function SupplierDetail({
  detailSectionRef,
  suppliers,
  selectedSupplier,
  isViewingSupplier,
  isOpen,
  search,
  currentPage,
  totalPages,
  onSelectSupplier,
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
  const activeSuppliers = suppliers.filter((supplier) => supplier.status === "active").length;
  const inactiveSuppliers = suppliers.length - activeSuppliers;

  const columns = [
    { key: "name", label: "Name" },
    { key: "company_name", label: "Company" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {item.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "View",
      className: "bg-slate-500 hover:bg-slate-600 text-white px-3 py-1 rounded-md text-sm",
      onClick: onSelectSupplier,
    },
    ...(canEdit ? [{
      label: "Edit",
      className: "bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm",
      onClick: onEdit,
    }] : []),
    ...(canDelete ? [{
      label: "Delete",
      className: "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm",
      onClick: (item) => onDelete(item.id),
    }] : []),
  ];

  return (
    <>
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Supplier List</h3>
            <p className="text-sm text-gray-500">Search, sort, and manage supplier records from the table section.</p>
          </div>

          <div className="flex gap-3 flex-wrap md:max-w-xl w-full">
            <input type="text" placeholder="Search suppliers..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="border rounded-lg px-3 py-2 flex-1" />
            <button onClick={onSearch} className="bg-blue-500 text-white px-5 py-2 rounded-lg">Search</button>
            <button onClick={onReset} className="bg-gray-500 text-white px-5 py-2 rounded-lg">Reset</button>
          </div>
        </div>

        <DataTable data={suppliers} columns={columns} actions={actions} onSort={onSort} />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Visible Suppliers</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{suppliers.length}</p>
        </div>
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Active</p>
          <p className="mt-2 text-3xl font-semibold text-green-700">{activeSuppliers}</p>
        </div>
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="mt-2 text-3xl font-semibold text-red-700">{inactiveSuppliers}</p>
        </div>
      </div>

      <div ref={detailSectionRef} tabIndex={-1} className="bg-white border rounded-xl shadow-sm p-5 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Supplier Detail</h2>
            <p className="text-sm text-gray-500">Open the panel to inspect the selected supplier and contact data.</p>
          </div>

          <button type="button" onClick={onToggle} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
            {isOpen ? "Hide Panel" : "Show Panel"}
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <span>{isOpen ? "Supplier detail is open" : "Supplier detail is hidden"}</span>
          <span className={`rounded-full px-3 py-1 font-medium ${isOpen ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"}`}>
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {isOpen && (
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              {isViewingSupplier ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-5 text-sm text-blue-700">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
                  Loading supplier detail...
                </div>
              ) : selectedSupplier ? (
                <div className="mt-4 space-y-4 text-sm">
                  {selectedSupplier.status === "inactive" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      This supplier is inactive and cannot be used for new products or purchase orders.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-500">Name</p><p className="font-medium text-gray-900">{selectedSupplier.name || "-"}</p></div>
                    <div><p className="text-gray-500">Company</p><p className="font-medium text-gray-900">{selectedSupplier.company_name || "-"}</p></div>
                    <div><p className="text-gray-500">Contact Person</p><p className="font-medium text-gray-900">{selectedSupplier.contact_person || "-"}</p></div>
                    <div><p className="text-gray-500">Email</p><p className="font-medium text-gray-900">{selectedSupplier.email || "-"}</p></div>
                    <div><p className="text-gray-500">Phone</p><p className="font-medium text-gray-900">{selectedSupplier.phone || "-"}</p></div>
                    <div><p className="text-gray-500">Tax Number</p><p className="font-medium text-gray-900">{selectedSupplier.tax_number || "-"}</p></div>
                    <div><p className="text-gray-500">Website</p><p className="font-medium text-gray-900">{selectedSupplier.website || "-"}</p></div>
                    <div><p className="text-gray-500">Status</p><p className="font-medium text-gray-900 capitalize">{selectedSupplier.status || "-"}</p></div>
                    <div className="md:col-span-2"><p className="text-gray-500">Address</p><p className="font-medium text-gray-900 whitespace-pre-wrap">{selectedSupplier.address || "-"}</p></div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">Select a supplier from the table to view detailed information.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SupplierDetail;