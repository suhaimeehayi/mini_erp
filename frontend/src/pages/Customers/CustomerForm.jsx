function CustomerForm({ formSectionRef, formData, errors, editId, isOpen, onChange, onSubmit, onCancel, onToggle }) {
	const inputClassName = (field) => `border rounded-lg px-3 py-2 w-full ${
		errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
	} focus:outline-none focus:ring-2 focus:ring-blue-400`;

	const renderLabel = (label, isRequired = true) => (
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
						{editId ? "Edit Customer" : "Add Customer"}
					</h2>
					<p className="text-sm text-gray-500">
						Create and update customer records using the original customer form fields.
					</p>
				</div>

				<button
					type="button"
					onClick={onToggle}
					className={`rounded-lg px-4 py-2 text-sm font-medium ${
						isOpen
							? "bg-blue-500 text-white hover:bg-blue-600"
							: "bg-blue-500 text-white hover:bg-blue-600"
					}`}
				>
					{isOpen ? "Hide Panel" : "Show Panel"}
				</button>
			</div>

			<div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
				<span>{isOpen ? "Customer form is open" : "Customer form is hidden"}</span>
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
					{renderLabel("Name")}
					<input
						placeholder="Name"
						value={formData.name}
						onChange={(e) => onChange("name", e.target.value)}
						className={inputClassName("name")}
					/>
					{errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
				</div>

				<div>
					{renderLabel("Phone")}
					<input
						placeholder="Phone"
						value={formData.phone}
						onChange={(e) => onChange("phone", e.target.value)}
						className={inputClassName("phone")}
					/>
					{errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
				</div>

				<div>
					{renderLabel("Email")}
					<input
						placeholder="Email"
						value={formData.email}
						onChange={(e) => onChange("email", e.target.value)}
						className={inputClassName("email")}
					/>
					{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
				</div>

				<div>
					{renderLabel("Company")}
					<input
						placeholder="Company"
						value={formData.company}
						onChange={(e) => onChange("company", e.target.value)}
						className={inputClassName("company")}
					/>
					{errors.company && <p className="mt-1 text-xs text-red-600">{errors.company}</p>}
				</div>

				<div>
					{renderLabel("Tax Number")}
					<input
						placeholder="Tax Number"
						value={formData.taxNumber}
						onChange={(e) => onChange("taxNumber", e.target.value)}
						className={inputClassName("taxNumber")}
					/>
					{errors.taxNumber && <p className="mt-1 text-xs text-red-600">{errors.taxNumber}</p>}
				</div>

				<div>
					{renderLabel("Status", false)}
					<select
						value={formData.status}
						onChange={(e) => onChange("status", e.target.value)}
						className={inputClassName("status")}
					>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</div>

				<div className="md:col-span-2 xl:col-span-3">
					{renderLabel("Address")}
					<textarea
						placeholder="Address"
						value={formData.address}
						onChange={(e) => onChange("address", e.target.value)}
						rows={3}
						className={inputClassName("address")}
					/>
					{errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
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

export default CustomerForm;
