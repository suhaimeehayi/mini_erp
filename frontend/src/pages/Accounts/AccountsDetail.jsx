import DataTable from "../../components/DataTable";

function AccountsDetail({
  selectedUserSectionRef,
  users,
  roles,
  permissions,
  activityLogs,
  selectedUser,
  isViewingUser,
  isOpen,
  loading,
  canViewUsers,
  canEditUsers,
  canDeleteUsers,
  canViewRoles,
  canEditRoles,
  canDeleteRoles,
  canViewPermissions,
  canViewActivityLogs,
  onRefresh,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onEditRole,
  onDeleteRole,
  onToggle,
}) {
  const activeUsers = users.filter((user) => user.is_active).length;
  const adminUsers = users.filter((user) => user.role_name === "Admin" || user.is_superuser).length;

  const userColumns = [
    { key: "username", label: "Username" },
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "role_name", label: "Role" },
    {
      key: "is_active",
      label: "Status",
      render: (item) => (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {item.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const roleColumns = [
    { key: "name", label: "Role" },
    { key: "description", label: "Description" },
    {
      key: "permissions",
      label: "Permissions",
      render: (item) => item.permissions?.length || 0,
    },
  ];

  const permissionColumns = [
    { key: "name", label: "Permission" },
    { key: "codename", label: "Code" },
    { key: "description", label: "Description" },
  ];

  const activityColumns = [
    { key: "user_name", label: "User" },
    { key: "action", label: "Action" },
    { key: "model_name", label: "Module" },
    { key: "description", label: "Description" },
    { key: "timestamp", label: "Timestamp" },
  ];

  const userActions = [
    {
      label: "View",
      onClick: onViewUser,
      className: "rounded bg-slate-500 px-3 py-1 text-sm text-white hover:bg-slate-600",
    },
    ...(canEditUsers ? [{
      label: "Edit",
      onClick: onEditUser,
      className: "rounded bg-amber-400 px-3 py-1 text-sm text-white hover:bg-amber-500",
    }] : []),
    ...(canDeleteUsers ? [{
      label: "Delete",
      onClick: onDeleteUser,
      className: "rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600",
    }] : []),
  ];

  const roleActions = [
    ...(canEditRoles ? [{
      label: "Edit",
      onClick: onEditRole,
      className: "rounded bg-amber-400 px-3 py-1 text-sm text-white hover:bg-amber-500",
    }] : []),
    ...(canDeleteRoles ? [{
      label: "Delete",
      onClick: onDeleteRole,
      className: "rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600",
    }] : []),
  ];

  const summaryCards = [
    ...(canViewUsers ? [{
      label: "Users",
      value: users.length,
      valueClassName: "text-gray-900",
    }, {
      label: "Active Users",
      value: activeUsers,
      valueClassName: "text-green-700",
    }] : []),
    ...(canViewRoles ? [{
      label: "Roles",
      value: roles.length,
      valueClassName: "text-gray-900",
    }] : []),
    ...(canViewPermissions ? [{
      label: "Permissions",
      value: permissions.length,
      valueClassName: "text-gray-900",
    }] : []),
    ...(canViewUsers ? [{
      label: "Admin Accounts",
      value: adminUsers,
      valueClassName: "text-blue-700",
      wide: true,
    }] : []),
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 my-6">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-xl border bg-white p-5 shadow-sm ${card.wide ? "md:col-span-4 xl:col-span-1" : ""}`}>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${card.valueClassName}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Accounts Detail</h2>
            <p className="text-sm text-gray-500">
              Review users, roles, permissions, and recent activity from one panel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              {isOpen ? "Hide Panel" : "Show Panel"}
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <span>{isOpen ? "Accounts detail is open" : "Accounts detail is hidden"}</span>
          <span className={`rounded-full px-3 py-1 font-medium ${isOpen ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"}`}>
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {isOpen && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                {loading && <span className="text-sm text-gray-500">Loading...</span>}
              </div>

              {canViewUsers ? <DataTable data={users} columns={userColumns} actions={userActions} /> : <p className="text-sm text-gray-500">You do not have access to view users.</p>}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {canViewRoles && (
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Roles</h3>
                <DataTable data={roles} columns={roleColumns} actions={roleActions} />
              </div>
              )}

              {canViewUsers && (
                <div ref={selectedUserSectionRef} tabIndex={-1} className="rounded-xl border bg-white p-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Selected User</h3>
                {isViewingUser ? (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-5 text-sm text-blue-700">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
                    Loading user detail...
                  </div>
                ) : selectedUser ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-sm">
                    <div>
                      <p className="text-gray-500">Username</p>
                      <p className="font-medium text-gray-900">{selectedUser.username || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{selectedUser.full_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedUser.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Role</p>
                      <p className="font-medium text-gray-900">{selectedUser.role_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Direct Permissions</p>
                      <p className="font-medium text-gray-900">{selectedUser.direct_permissions?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Active</p>
                      <p className="font-medium text-gray-900">{selectedUser.is_active ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Staff</p>
                      <p className="font-medium text-gray-900">{selectedUser.is_staff ? "Yes" : "No"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-500">Effective Permissions</p>
                      {selectedUser.effective_permissions?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedUser.effective_permissions.map((permissionCode) => (
                            <span key={permissionCode} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              {permissionCode}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="font-medium text-gray-900">-</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Select a user from the table to inspect account details.</p>
                )}
              </div>
              )}
            </div>

            {canViewPermissions && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Permissions</h3>
              <DataTable data={permissions} columns={permissionColumns} />
            </div>
            )}

            {canViewActivityLogs && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
              <DataTable data={activityLogs} columns={activityColumns} />
            </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default AccountsDetail;