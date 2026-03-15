import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import AccountsDetail from "./AccountsDetail";
import AccountsForm from "./AccountsForm";
import {
  createRole,
  createUser,
  deleteRole,
  deleteUser,
  getActivityLogs,
  getPermissions,
  getRoles,
  getUsers,
  updateRole,
  updateUser,
} from "../../services/accountService";

const initialUserForm = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  password_confirm: "",
  role: "",
  permission_ids: [],
  is_active: true,
  is_staff: false,
};

const initialRoleForm = {
  name: "",
  description: "",
  permission_ids: [],
};

function Accounts() {
  const { hasPermission } = useAuth();
  const userFormSectionRef = useRef(null);
  const roleFormSectionRef = useRef(null);
  const selectedUserSectionRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewingUser, setIsViewingUser] = useState(false);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [roleForm, setRoleForm] = useState(initialRoleForm);
  const [userErrors, setUserErrors] = useState({});
  const [roleErrors, setRoleErrors] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const canViewUsers = hasPermission("view_users");
  const canCreateUsers = hasPermission("add_users");
  const canEditUsers = hasPermission("change_users");
  const canDeleteUsers = hasPermission("delete_users");
  const canManageUsers = canCreateUsers || canEditUsers;
  const canViewRoles = hasPermission("view_roles");
  const canCreateRoles = hasPermission("add_roles");
  const canEditRoles = hasPermission("change_roles");
  const canDeleteRoles = hasPermission("delete_roles");
  const canManageRoles = canCreateRoles || canEditRoles;
  const canViewPermissions = canViewUsers || canViewRoles || canManageUsers || canManageRoles;
  const canViewActivityLogs = canViewUsers || canEditUsers || canDeleteUsers;
  const canShowForms = canManageUsers || canManageRoles;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userResult, roleResult, permissionResult, activityResult] = await Promise.allSettled([
        canViewUsers || canManageUsers || canDeleteUsers ? getUsers() : Promise.resolve([]),
        canViewRoles || canManageRoles || canDeleteRoles ? getRoles() : Promise.resolve([]),
        canViewPermissions ? getPermissions() : Promise.resolve([]),
        canViewActivityLogs ? getActivityLogs() : Promise.resolve([]),
      ]);

      const userData = userResult.status === "fulfilled" ? userResult.value : [];
      const roleData = roleResult.status === "fulfilled" ? roleResult.value : [];
      const permissionData = permissionResult.status === "fulfilled" ? permissionResult.value : [];
      const activityData = activityResult.status === "fulfilled" ? activityResult.value : [];

      setUsers(userData);
      setRoles(roleData);
      setPermissions(permissionData);
      setActivityLogs(activityData.slice(0, 10));
      setSelectedUser((previousUser) => {
        if (!canViewUsers && !canManageUsers && !canDeleteUsers) {
          return null;
        }

        if (!previousUser) {
          return userData[0] || null;
        }

        return userData.find((user) => user.id === previousUser.id) || userData[0] || null;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [canDeleteRoles, canDeleteUsers, canManageRoles, canManageUsers, canViewActivityLogs, canViewPermissions, canViewRoles, canViewUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const scrollToSection = useCallback((sectionRef) => {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      sectionRef.current?.focus?.();
    });
  }, []);

  const updateUserForm = (field, value) => {
    setUserForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (userErrors[field]) {
      setUserErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  const updateRoleForm = (field, value) => {
    setRoleForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (roleErrors[field]) {
      setRoleErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  const validateUserForm = useCallback(() => {
    const nextErrors = {};
    const isCreateMode = !editingUserId;

    if (!userForm.username.trim()) {
      nextErrors.username = "Username is required";
    }

    if (!userForm.email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (!userForm.first_name.trim()) {
      nextErrors.first_name = "First name is required";
    }

    if (!userForm.last_name.trim()) {
      nextErrors.last_name = "Last name is required";
    }

    if (!userForm.role) {
      nextErrors.role = "Role is required";
    }

    if (isCreateMode && !userForm.password) {
      nextErrors.password = "Password is required";
    }

    if (isCreateMode && !userForm.password_confirm) {
      nextErrors.password_confirm = "Password confirmation is required";
    }

    if (isCreateMode && userForm.password && userForm.password_confirm && userForm.password !== userForm.password_confirm) {
      nextErrors.password_confirm = "Passwords do not match";
    }

    if (isCreateMode && userForm.permission_ids.length === 0) {
      nextErrors.permission_ids = "Direct permissions are required";
    }

    setUserErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [editingUserId, userForm]);

  const validateRoleForm = useCallback(() => {
    const nextErrors = {};

    if (!roleForm.name.trim()) {
      nextErrors.name = "Role name is required";
    }

    if (roleForm.permission_ids.length === 0) {
      nextErrors.permission_ids = "Permissions are required";
    }

    setRoleErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [roleForm.name, roleForm.permission_ids]);

  const resetUserForm = () => {
    setUserForm(initialUserForm);
    setUserErrors({});
    setEditingUserId(null);
  };

  const resetRoleForm = () => {
    setRoleForm(initialRoleForm);
    setRoleErrors({});
    setEditingRoleId(null);
  };

  const handleViewUser = async (user) => {
    if (!canViewUsers && !canManageUsers && !canDeleteUsers) {
      return;
    }

    setIsDetailOpen(true);
    setIsViewingUser(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSelectedUser(user);
    setIsViewingUser(false);
    scrollToSection(selectedUserSectionRef);
  };

  const handleSubmitUser = async () => {
    if ((!editingUserId && !canCreateUsers) || (editingUserId && !canEditUsers)) {
      return;
    }

    if (!validateUserForm()) {
      return;
    }

    const payload = {
      username: userForm.username,
      email: userForm.email,
      first_name: userForm.first_name,
      last_name: userForm.last_name,
      role: userForm.role || null,
      permission_ids: userForm.permission_ids,
      is_active: userForm.is_active,
      is_staff: userForm.is_staff,
    };

    try {
      let response;

      if (editingUserId) {
        response = await updateUser(editingUserId, payload);
      } else {
        response = await createUser({
          ...payload,
          password: userForm.password,
          password_confirm: userForm.password_confirm,
        });
      }

      resetUserForm();
      setSelectedUser(response);
      setIsFormOpen(false);
      setIsDetailOpen(true);
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditUser = (user) => {
    if (!canEditUsers) {
      return;
    }

    setEditingUserId(user.id);
    setSelectedUser(user);
    setIsFormOpen(true);
    setIsDetailOpen(true);
    setUserErrors({});
    setUserForm({
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      password: "",
      password_confirm: "",
      role: user.role_id || "",
      permission_ids: user.direct_permission_ids || [],
      is_active: user.is_active,
      is_staff: user.is_staff,
    });
    scrollToSection(userFormSectionRef);
  };

  const handleDeleteUser = async (user) => {
    if (!canDeleteUsers) {
      return;
    }

    if (!window.confirm(`Delete user ${user.username}?`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      if (editingUserId === user.id) {
        resetUserForm();
      }
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
      }
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitRole = async () => {
    if ((!editingRoleId && !canCreateRoles) || (editingRoleId && !canEditRoles)) {
      return;
    }

    if (!validateRoleForm()) {
      return;
    }

    try {
      if (editingRoleId) {
        await updateRole(editingRoleId, roleForm);
      } else {
        await createRole(roleForm);
      }

      resetRoleForm();
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditRole = (role) => {
    if (!canEditRoles) {
      return;
    }

    setEditingRoleId(role.id);
    setIsFormOpen(true);
    setRoleErrors({});
    setRoleForm({
      name: role.name || "",
      description: role.description || "",
      permission_ids: role.permissions?.map((permission) => permission.id) || [],
    });
    scrollToSection(roleFormSectionRef);
  };

  const handleDeleteRole = async (role) => {
    if (!canDeleteRoles) {
      return;
    }

    if (!window.confirm(`Delete role ${role.name}?`)) {
      return;
    }

    try {
      await deleteRole(role.id);
      if (editingRoleId === role.id) {
        resetRoleForm();
      }
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Accounts</h1>

      {canShowForms && (
        <AccountsForm
          userFormSectionRef={userFormSectionRef}
          roleFormSectionRef={roleFormSectionRef}
          userForm={userForm}
          roleForm={roleForm}
          userErrors={userErrors}
          roleErrors={roleErrors}
          roles={roles}
          permissions={permissions}
          editingUserId={editingUserId}
          editingRoleId={editingRoleId}
          isOpen={isFormOpen}
          canManageUsers={canManageUsers}
          canManageRoles={canManageRoles}
          onUserChange={updateUserForm}
          onRoleChange={updateRoleForm}
          onSubmitUser={handleSubmitUser}
          onSubmitRole={handleSubmitRole}
          onCancelUser={resetUserForm}
          onCancelRole={resetRoleForm}
          onToggle={() => setIsFormOpen((previous) => !previous)}
        />
      )}

      <AccountsDetail
        selectedUserSectionRef={selectedUserSectionRef}
        users={users}
        roles={roles}
        permissions={permissions}
        activityLogs={activityLogs}
        selectedUser={selectedUser}
        isViewingUser={isViewingUser}
        isOpen={isDetailOpen}
        loading={loading}
        canViewUsers={canViewUsers || canManageUsers || canDeleteUsers}
        canEditUsers={canEditUsers}
        canDeleteUsers={canDeleteUsers}
        canViewRoles={canViewRoles || canManageRoles || canDeleteRoles}
        canEditRoles={canEditRoles}
        canDeleteRoles={canDeleteRoles}
        canViewPermissions={canViewPermissions}
        canViewActivityLogs={canViewActivityLogs}
        onRefresh={loadData}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
        onToggle={() => setIsDetailOpen((previous) => !previous)}
      />
    </div>
  );
}

export default Accounts;