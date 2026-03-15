import { useRef } from "react";
import { CalendarDays } from "lucide-react";

function PurchaseOrderForm({
  formSectionRef,
  formData,
  errors,
  editId,
  suppliers,
  products,
  isOpen,
  onChange,
  onSubmit,
  onCancel,
  onToggle,
}) {
  const dateInputRef = useRef(null);
  const inputClassName = (field) => `border rounded-lg px-3 py-2 w-full ${
    errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-blue-400`;

  const renderLabel = (label, isRequired = false) => (
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label}
      {isRequired && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  const openDatePicker = () => {
    const dateInput = dateInputRef.current;
    if (!dateInput) {
      return;
    }

    dateInput.focus();
    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
    }
  };

  return (
    <div ref={formSectionRef} tabIndex={-1} className="bg-white border rounded-xl shadow-sm p-5 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {editId ? "Edit Purchase Order" : "Add Purchase Order"}
          </h2>
          <p className="text-sm text-gray-500">
            Create and update purchase orders with supplier, item, and receipt status data.
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
        <span>{isOpen ? "Purchase order form is open" : "Purchase order form is hidden"}</span>
        <span className={`rounded-full px-3 py-1 font-medium ${isOpen ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"}`}>
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      {isOpen && (
        <>
          <p className="mb-4 text-sm text-gray-500">
            <span className="font-medium text-red-500">*</span> Required fields
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              {renderLabel("Supplier", true)}
              <select
                value={formData.supplier}
                onChange={(e) => onChange("supplier", e.target.value)}
                className={inputClassName("supplier")}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplier && <p className="mt-1 text-xs text-red-600">{errors.supplier}</p>}
            </div>

            <div>
              {renderLabel("Order Date", true)}
              <div className="relative">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => onChange("orderDate", e.target.value)}
                  className={`${inputClassName("orderDate")} pr-12`}
                />
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-600"
                  aria-label="Open calendar"
                >
                  <CalendarDays size={18} />
                </button>
              </div>
              {errors.orderDate && <p className="mt-1 text-xs text-red-600">{errors.orderDate}</p>}
            </div>

            <div>
              {renderLabel("Status")}
              <select
                value={formData.status}
                onChange={(e) => onChange("status", e.target.value)}
                className={inputClassName("status")}
              >
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              {renderLabel("Product", true)}
              <select
                value={formData.selectedProduct}
                onChange={(e) => onChange("selectedProduct", e.target.value)}
                className={inputClassName("selectedProduct")}
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {errors.selectedProduct && <p className="mt-1 text-xs text-red-600">{errors.selectedProduct}</p>}
            </div>

            <div>
              {renderLabel("Quantity", true)}
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => onChange("quantity", e.target.value)}
                className={inputClassName("quantity")}
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
            </div>

            <div>
              {renderLabel("Unit Price", true)}
              <input
                type="number"
                step="0.01"
                placeholder="Unit Price"
                value={formData.unitPrice}
                onChange={(e) => onChange("unitPrice", e.target.value)}
                className={inputClassName("unitPrice")}
              />
              {errors.unitPrice && <p className="mt-1 text-xs text-red-600">{errors.unitPrice}</p>}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={onSubmit}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition"
            >
              {editId ? "Update" : "Add"}
            </button>

            {editId && (
              <button
                onClick={onCancel}
                className="bg-gray-400 text-white px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PurchaseOrderForm;