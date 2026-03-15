function AccountsForm({
  userFormSectionRef,
  roleFormSectionRef,
  userForm,
  roleForm,
  userErrors,
  roleErrors,
  roles,
  permissions,
  editingUserId,
  editingRoleId,
  isOpen,
  canManageUsers,
  canManageRoles,
  onUserChange,
  onRoleChange,
  onSubmitUser,
  onSubmitRole,
  onCancelUser,
  onCancelRole,
  onToggle,
}) {
  const userInputClassName = (field) => `rounded-lg border px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${userErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"}`;
  const roleInputClassName = (field) => `rounded-lg border px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${roleErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"}`;
  const isCreateUserMode = !editingUserId;

  const renderLabel = (label, isRequired = false) => (
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label}
      {isRequired && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Accounts Setup</h2>
          <p className="text-sm text-gray-500">
            Manage user accounts and role permissions from the same workspace.
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
        <span>{isOpen ? "Accounts setup is open" : "Accounts setup is hidden"}</span>
        <span className={`rounded-full px-3 py-1 font-medium ${isOpen ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"}`}>
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {canManageUsers && (
            <div ref={userFormSectionRef} tabIndex={-1} className="rounded-xl border border-gray-200 p-5 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUserId ? "Edit User" : "Add User"}
              </h3>
              <p className="text-sm text-gray-500">
                Update identity, role assignment, and staff access flags.
              </p>
            </div>

            {isCreateUserMode && (
              <p className="mb-4 text-sm text-gray-500">
                <span className="font-medium text-red-500">*</span> Required fields
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                {renderLabel("Username", isCreateUserMode)}
                <input className={userInputClassName("username")} placeholder="Username" value={userForm.username} onChange={(event) => onUserChange("username", event.target.value)} />
                {userErrors.username && <p className="mt-1 text-xs text-red-600">{userErrors.username}</p>}
              </div>
              <div>
                {renderLabel("Email", isCreateUserMode)}
                <input className={userInputClassName("email")} placeholder="Email" value={userForm.email} onChange={(event) => onUserChange("email", event.target.value)} />
                {userErrors.email && <p className="mt-1 text-xs text-red-600">{userErrors.email}</p>}
              </div>
              <div>
                {renderLabel("First Name", isCreateUserMode)}
                <input className={userInputClassName("first_name")} placeholder="First name" value={userForm.first_name} onChange={(event) => onUserChange("first_name", event.target.value)} />
                {userErrors.first_name && <p className="mt-1 text-xs text-red-600">{userErrors.first_name}</p>}
              </div>
              <div>
                {renderLabel("Last Name", isCreateUserMode)}
                <input className={userInputClassName("last_name")} placeholder="Last name" value={userForm.last_name} onChange={(event) => onUserChange("last_name", event.target.value)} />
                {userErrors.last_name && <p className="mt-1 text-xs text-red-600">{userErrors.last_name}</p>}
              </div>
              <div>
                {renderLabel("Password", isCreateUserMode)}
                <input className={userInputClassName("password")} placeholder={editingUserId ? "Leave blank to keep password" : "Password"} type="password" value={userForm.password} onChange={(event) => onUserChange("password", event.target.value)} />
                {userErrors.password && <p className="mt-1 text-xs text-red-600">{userErrors.password}</p>}
              </div>
              <div>
                {renderLabel("Confirm Password", isCreateUserMode)}
                <input className={userInputClassName("password_confirm")} placeholder={editingUserId ? "Leave blank to keep password" : "Confirm password"} type="password" value={userForm.password_confirm} onChange={(event) => onUserChange("password_confirm", event.target.value)} />
                {userErrors.password_confirm && <p className="mt-1 text-xs text-red-600">{userErrors.password_confirm}</p>}
              </div>
              <div>
                {renderLabel("Role", isCreateUserMode)}
                <select className={userInputClassName("role")} value={userForm.role} onChange={(event) => onUserChange("role", event.target.value)}>
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                {userErrors.role && <p className="mt-1 text-xs text-red-600">{userErrors.role}</p>}
              </div>
              <div className="md:col-span-2">
                {renderLabel("Direct Permissions", isCreateUserMode)}
                <select
                  multiple
                  className={`min-h-40 rounded-lg border px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${userErrors.permission_ids ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                  value={userForm.permission_ids.map(String)}
                  onChange={(event) => onUserChange(
                    "permission_ids",
                    Array.from(event.target.selectedOptions, (option) => Number(option.value)),
                  )}
                >
                  {permissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {permission.name} ({permission.codename})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Permissions selected here are assigned directly to the user in addition to role permissions.
                </p>
                {userErrors.permission_ids && <p className="mt-1 text-xs text-red-600">{userErrors.permission_ids}</p>}
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-gray-300 px-3 py-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={userForm.is_active} onChange={(event) => onUserChange("is_active", event.target.checked)} />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={userForm.is_staff} onChange={(event) => onUserChange("is_staff", event.target.checked)} />
                  Staff
                </label>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button type="button" onClick={onSubmitUser} className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
                {editingUserId ? "Update User" : "Create User"}
              </button>
              {editingUserId && (
                <button type="button" onClick={onCancelUser} className="rounded-lg bg-gray-500 px-5 py-2 text-white hover:bg-gray-600">
                  Cancel
                </button>
              )}
            </div>
          </div>
          )}

          {canManageRoles && (
            <div ref={roleFormSectionRef} tabIndex={-1} className="rounded-xl border border-gray-200 p-5 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRoleId ? "Edit Role" : "Add Role"}
              </h3>
              <p className="text-sm text-gray-500">
                Maintain role names, descriptions, and permission assignments.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                {renderLabel("Role Name", true)}
                <input className={roleInputClassName("name")} placeholder="Role name" value={roleForm.name} onChange={(event) => onRoleChange("name", event.target.value)} />
                {roleErrors.name && <p className="mt-1 text-xs text-red-600">{roleErrors.name}</p>}
              </div>
              <div>
                {renderLabel("Description")}
                <textarea className={roleInputClassName("description")} rows="3" placeholder="Description" value={roleForm.description} onChange={(event) => onRoleChange("description", event.target.value)} />
              </div>
              <div>
                {renderLabel("Permissions", true)}
                <select
                  multiple
                  className={`min-h-48 rounded-lg border px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${roleErrors.permission_ids ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                  value={roleForm.permission_ids.map(String)}
                  onChange={(event) => onRoleChange(
                    "permission_ids",
                    Array.from(event.target.selectedOptions, (option) => Number(option.value)),
                  )}
                >
                  {permissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {permission.name} ({permission.codename})
                    </option>
                  ))}
                </select>
                {roleErrors.permission_ids && <p className="mt-1 text-xs text-red-600">{roleErrors.permission_ids}</p>}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button type="button" onClick={onSubmitRole} className="rounded-lg bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700">
                {editingRoleId ? "Update Role" : "Create Role"}
              </button>
              {editingRoleId && (
                <button type="button" onClick={onCancelRole} className="rounded-lg bg-gray-500 px-5 py-2 text-white hover:bg-gray-600">
                  Cancel
                </button>
              )}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountsForm;