function ProductForm({
  formSectionRef,
  formData,
  errors,
  editId,
  suppliers,
  isOpen,
  onChange,
  onSubmit,
  onCancel,
  onToggle,
}) {
  const inputClassName = (field) => `border rounded-lg px-3 py-2 w-full ${
    errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-blue-400`;

  const renderLabel = (label, isRequired = false) => (
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label}
      {isRequired && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  return (
    <div ref={formSectionRef} tabIndex={-1} className="bg-white border rounded-xl shadow-sm p-5 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {editId ? "Edit Product" : "Add Product"}
          </h2>
          <p className="text-sm text-gray-500">
            Create and update product records using the existing product fields.
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
        <span>{isOpen ? "Product form is open" : "Product form is hidden"}</span>
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
              {renderLabel("Product Name", true)}
              <input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => onChange("name", e.target.value)}
                className={inputClassName("name")}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              {renderLabel("SKU", true)}
              <input
                placeholder="SKU"
                value={formData.sku}
                onChange={(e) => onChange("sku", e.target.value)}
                className={inputClassName("sku")}
              />
              {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
            </div>

            <div>
              {renderLabel("Price", true)}
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => onChange("price", e.target.value)}
                className={inputClassName("price")}
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>

            <div className="md:col-span-2 xl:col-span-1">
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

            <div className="md:col-span-2 xl:col-span-3">
              {renderLabel("Description")}
              <textarea
                placeholder="Description"
                rows={3}
                value={formData.description}
                onChange={(e) => onChange("description", e.target.value)}
                className={inputClassName("description")}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={onSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition"
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

export default ProductForm;