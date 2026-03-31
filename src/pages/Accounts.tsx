import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, Edit, Trash2, UserPlus, AlertCircle, X, Check, Search } from "lucide-react";
import { cn } from "../utils/cn";
import { getAccountList, addAccount, updateAccount, deleteAccount, updateAccountStatus, resetPassword as resetPasswordApi, Account } from "../api/account";

// 模拟数据
const defaultUsers = [
  { id: "1", phone: "18800000000", name: "张三", roles: ["渠道管理员"], accountType: "渠道管理员", tenantLabel: "华东大区渠道", status: "启用", createdAt: "2026-01-01 10:00:00", isFixedAdmin: true },
  { id: "2", phone: "13812345678", name: "李四", roles: ["运营专员", "客服"], accountType: "普通员工", tenantLabel: "华东大区渠道", status: "启用", createdAt: "2026-02-15 14:30:00", isFixedAdmin: false },
  { id: "3", phone: "13987654321", name: "王五", roles: ["二级租户管理员"], accountType: "二级租户管理员", tenantLabel: "上海徐汇分店", status: "启用", createdAt: "2026-03-10 09:15:00", isFixedAdmin: false },
  { id: "4", phone: "13700000000", name: "赵六", roles: [], accountType: "普通员工", tenantLabel: "华东大区渠道", status: "禁用", createdAt: "2026-03-16 16:45:00", isFixedAdmin: false },
];

const availableRoles = ["渠道管理员", "运营专员", "客服", "财务专员", "仓管员"];
const allAccountTypes = ["渠道管理员", "二级租户管理员", "普通员工"];

// 模拟渠道和二级租户数据供选择
const getMockChannels = () => {
  const saved = localStorage.getItem("system_channels");
  if (saved) {
    return JSON.parse(saved).map((c: any) => c.name);
  }
  return ["华东大区渠道", "华南大区渠道", "华北大区渠道"];
};

const getMockSubTenants = () => {
  const saved = localStorage.getItem("system_sub_tenants");
  if (saved) {
    return JSON.parse(saved).map((st: any) => st.name);
  }
  return ["上海徐汇分店", "杭州西湖分店", "广州天河分店"];
};

export function Accounts() {
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isSuperAdmin = currentUser?.role === "系统超级管理员";

  // 根据当前登录角色决定可创建的账号类型
  const accountTypes = isSuperAdmin ? ["渠道管理员"] : ["二级租户管理员", "普通员工"];

  const [users, setUsers] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 筛选状态
  const [searchPhone, setSearchPhone] = useState("");
  const [searchRole, setSearchRole] = useState("全部角色");
  const [searchAccountType, setSearchAccountType] = useState("全部类型");
  const [searchStatus, setSearchStatus] = useState("全部状态");

  const [appliedFilters, setAppliedFilters] = useState({
    phone: "",
    role: "全部角色",
    accountType: "全部类型",
    status: "全部状态"
  });

  // 获取账号列表
  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        pageSize: itemsPerPage,
      };
      if (appliedFilters.phone) params.phone = appliedFilters.phone;
      if (appliedFilters.role !== "全部角色") params.role = appliedFilters.role;
      if (appliedFilters.accountType !== "全部类型") params.accountType = appliedFilters.accountType;
      if (appliedFilters.status !== "全部状态") params.status = appliedFilters.status;

      const res = await getAccountList(params);
      setUsers(res.list || []);
      setTotal(res.total || 0);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      showToast("获取账号列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [currentPage, appliedFilters]);

  // 编辑账号弹窗状态
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Account | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", phone: "", roles: [] as string[] });
  const [isSaving, setIsSaving] = useState(false);

  // 重置密码弹窗状态
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState<Account | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  // 删除确认弹窗状态
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<Account | null>(null);

  // 新增账号弹窗状态
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    phone: "",
    roles: [] as string[],
    accountType: "普通员工",
    tenantLabel: "",
    password: "",
    confirmPassword: "",
    status: "启用",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // 成功提示状态
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 打开新增弹窗
  const handleAddClick = () => {
    setNewAccount({
      name: "",
      phone: "",
      roles: [],
      accountType: isSuperAdmin ? "渠道管理员" : "普通员工",
      tenantLabel: "",
      password: "",
      confirmPassword: "",
      status: "启用",
    });
    setAddError("");
    setIsAddModalOpen(true);
  };

  // 切换新增账号角色选中状态
  const toggleNewAccountRole = (role: string) => {
    if (newAccount.roles.includes(role)) {
      setNewAccount({ ...newAccount, roles: newAccount.roles.filter((r) => r !== role) });
    } else {
      setNewAccount({ ...newAccount, roles: [...newAccount.roles, role] });
    }
  };

  // 提交新增账号
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.phone.trim()) {
      setAddError("请输入手机号码");
      return;
    }
    if (newAccount.roles.length === 0) {
      setAddError("请至少选择一个角色");
      return;
    }
    if (!newAccount.password) {
      setAddError("请输入登录密码");
      return;
    }
    if (newAccount.password !== newAccount.confirmPassword) {
      setAddError("两次输入的密码不一致");
      return;
    }

    if (newAccount.accountType === "二级租户管理员" && !newAccount.tenantLabel) {
      setAddError("请选择所属二级租户");
      return;
    }
    if (newAccount.accountType === "渠道管理员" && isSuperAdmin && !newAccount.tenantLabel) {
      setAddError("请选择所属渠道");
      return;
    }

    setIsAdding(true);
    setAddError("");

    try {
      const accountData = {
        name: newAccount.name || "新用户",
        phone: newAccount.phone,
        roles: newAccount.roles,
        accountType: newAccount.accountType,
        tenantLabel: newAccount.tenantLabel || (isSuperAdmin ? "新分配渠道" : "当前渠道"),
        status: newAccount.status,
        password: newAccount.password,
      };
      
      await addAccount(accountData);
      setIsAddModalOpen(false);
      showToast("账号添加成功");
      fetchAccounts();
    } catch (error: any) {
      console.error("Failed to add account:", error);
      setAddError(error.response?.data?.message || "添加账号失败，请重试");
    } finally {
      setIsAdding(false);
    }
  };

  // 打开编辑弹窗
  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      phone: user.phone,
      roles: [...user.roles]
    });
    setIsEditModalOpen(true);
  };

  // 切换编辑账号角色选中状态
  const toggleEditRole = (role: string) => {
    if (editFormData.roles.includes(role)) {
      setEditFormData({ ...editFormData, roles: editFormData.roles.filter((r) => r !== role) });
    } else {
      setEditFormData({ ...editFormData, roles: [...editFormData.roles, role] });
    }
  };

  // 保存账号修改
  const handleSaveAccount = async () => {
    if (!editingUser) return;
    if (!editFormData.name.trim() || !editFormData.phone.trim()) {
      showToast("姓名和手机号不能为空");
      return;
    }
    setIsSaving(true);
    
    try {
      await updateAccount(editingUser.id, {
        name: editFormData.name,
        phone: editFormData.phone,
        roles: editFormData.roles
      });
      setIsEditModalOpen(false);
      showToast("账号修改成功");
      fetchAccounts();
    } catch (error) {
      console.error("Failed to update account:", error);
      showToast("账号修改失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 重置密码
  const handleResetPassword = async (user: Account) => {
    try {
      const res = await resetPasswordApi(user.id);
      setResettingUser(user);
      // 假设后端返回了新密码，或者前端生成规则一致
      const last6 = user.phone.slice(-6);
      const newPass = `MM${last6}`;
      setResetPassword(newPass);
      setIsResetModalOpen(true);
    } catch (error) {
      console.error("Failed to reset password:", error);
      showToast("重置密码失败");
    }
  };

  // 打开删除弹窗
  const handleDeleteClick = (user: Account) => {
    if (user.isFixedAdmin) return;
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  // 确认删除
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await deleteAccount(deletingUser.id);
      setIsDeleteModalOpen(false);
      showToast("用户已删除");
      fetchAccounts();
    } catch (error) {
      console.error("Failed to delete account:", error);
      showToast("删除用户失败");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* 全局 Toast 提示 */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg ring-1 ring-emerald-600/20 animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            账号管理
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isSuperAdmin 
              ? "系统超级管理员可以创建渠道管理员账号并分配所属渠道。" 
              : "在当前渠道内创建后台账号并分配角色，二级租户管理员账号将会有特殊标识。"}
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            新建账号
          </button>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full sm:w-64">
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="搜索姓名或手机号"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="全部角色">全部角色</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={searchAccountType}
              onChange={(e) => setSearchAccountType(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="全部类型">全部类型</option>
              {allAccountTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="全部状态">全部状态</option>
              <option value="启用">启用</option>
              <option value="禁用">禁用</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setSearchPhone("");
              setSearchRole("全部角色");
              setSearchAccountType("全部类型");
              setSearchStatus("全部状态");
              setAppliedFilters({
                phone: "",
                role: "全部角色",
                accountType: "全部类型",
                status: "全部状态"
              });
              setCurrentPage(1);
            }}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            重置
          </button>
          <button
            type="button"
            onClick={() => {
              setAppliedFilters({
                phone: searchPhone,
                role: searchRole,
                accountType: searchAccountType,
                status: searchStatus
              });
              setCurrentPage(1);
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            查询
          </button>
        </div>
      </div>

      {/* 账号列表 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">
                  姓名 / 手机号
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  角色
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  账号类型
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  所属租户
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  状态
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right text-sm font-semibold text-slate-900">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    加载中...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    暂无匹配账号
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <span className="text-slate-500 font-medium text-sm">
                            {user.name ? user.name.charAt(0) : user.phone.substring(0, 1)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-slate-900 flex items-center gap-2">
                            {user.name || "未命名"}
                            {user.isFixedAdmin && (
                              <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                <Shield className="mr-1 h-3 w-3" />
                                内置
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 font-mono mt-0.5">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-500">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {user.roles.length > 0 ? (
                          user.roles.map((role: string) => (
                            <span
                              key={role}
                              className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">暂无角色</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        user.accountType === "二级租户管理员" 
                          ? "bg-purple-50 text-purple-700 ring-purple-600/20" 
                          : user.accountType === "渠道管理员"
                          ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                          : "bg-slate-50 text-slate-600 ring-slate-500/10"
                      )}>
                        {user.accountType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          user.accountType === "二级租户管理员" ? "bg-purple-500" : "bg-blue-500"
                        )} />
                        {user.tenantLabel}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        user.status === "启用" 
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" 
                          : "bg-slate-50 text-slate-600 ring-slate-500/10"
                      )}>
                        {user.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="text-orange-600 hover:text-orange-900 mr-4 inline-flex items-center"
                      >
                        <ShieldAlert className="mr-1 h-4 w-4" />
                        重置密码
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-primary hover:text-primary-hover mr-4 inline-flex items-center"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        编辑账号
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        disabled={user.isFixedAdmin}
                        className={cn(
                          "inline-flex items-center",
                          user.isFixedAdmin
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-red-600 hover:text-red-900"
                        )}
                        title={user.isFixedAdmin ? "内置管理员不可禁用" : "禁用账号"}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        禁用
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            显示 {Math.min((currentPage - 1) * itemsPerPage + 1, total)} 到 {Math.min(currentPage * itemsPerPage, total)} 条，共 {total} 条记录
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-slate-300 text-slate-500 hover:bg-slate-50 text-sm disabled:opacity-50"
            >
              上一页
            </button>
            <button className="px-3 py-1 rounded bg-primary text-white text-sm">{currentPage}</button>
            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(total / itemsPerPage)}
              className="px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 新增账号弹窗 (Modal) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">新增账号</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-5 overflow-y-auto flex-1">
              {addError && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {addError}
                </div>
              )}

              <form id="add-account-form" onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="name"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="请输入真实姓名"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-900">
                    手机号码 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="phone"
                      value={newAccount.phone}
                      onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="请输入手机号"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="accountType" className="block text-sm font-medium leading-6 text-slate-900">
                    账号类型 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <select
                      id="accountType"
                      value={newAccount.accountType}
                      onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    >
                      {accountTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {newAccount.accountType === "二级租户管理员" && !isSuperAdmin && (
                  <div>
                    <label htmlFor="tenantLabel" className="block text-sm font-medium leading-6 text-slate-900">
                      所属二级租户 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <select
                        id="tenantLabel"
                        value={newAccount.tenantLabel}
                        onChange={(e) => setNewAccount({ ...newAccount, tenantLabel: e.target.value })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      >
                        <option value="">请选择二级租户</option>
                        {getMockSubTenants().map((t: string) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {newAccount.accountType === "渠道管理员" && isSuperAdmin && (
                  <div>
                    <label htmlFor="tenantLabel" className="block text-sm font-medium leading-6 text-slate-900">
                      所属渠道 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <select
                        id="tenantLabel"
                        value={newAccount.tenantLabel}
                        onChange={(e) => setNewAccount({ ...newAccount, tenantLabel: e.target.value })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      >
                        <option value="">请选择渠道</option>
                        {getMockChannels().map((c: string) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">
                    所属角色 (多选) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 border border-slate-200 rounded-md p-3 max-h-40 overflow-y-auto">
                    {availableRoles.map((role) => (
                      <div key={role} className="flex items-center">
                        <input
                          id={`new-role-${role}`}
                          type="checkbox"
                          checked={newAccount.roles.includes(role)}
                          onChange={() => toggleNewAccountRole(role)}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={`new-role-${role}`} className="ml-2 text-sm text-slate-700 cursor-pointer">
                          {role}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">勾选账号所属角色</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                      登录密码 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="password"
                        id="password"
                        value={newAccount.password}
                        onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="请输入密码"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-slate-900">
                      确认密码 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="password"
                        id="confirmPassword"
                        value={newAccount.confirmPassword}
                        onChange={(e) => setNewAccount({ ...newAccount, confirmPassword: e.target.value })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="请再次输入密码"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className="text-sm font-medium text-slate-900">账号状态</label>
                    <p className="text-xs text-slate-500">禁用后该账号将无法登录系统</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewAccount({ ...newAccount, status: newAccount.status === "启用" ? "禁用" : "启用" })}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      newAccount.status === "启用" ? "bg-primary" : "bg-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        newAccount.status === "启用" ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                form="add-account-form"
                disabled={isAdding}
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {isAdding ? "添加中..." : "确认添加"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 账号编辑弹窗 (Modal) */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">编辑账号</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">姓名</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">手机号码</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">选择角色</label>
                <div className="grid grid-cols-2 gap-3 border border-slate-200 rounded-md p-3 max-h-40 overflow-y-auto">
                  {availableRoles.map((role) => (
                    <div key={role} className="flex items-center">
                      <input
                        id={`edit-role-${role}`}
                        type="checkbox"
                        checked={editFormData.roles.includes(role)}
                        onChange={() => toggleEditRole(role)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`edit-role-${role}`} className="ml-2 text-sm text-slate-700 cursor-pointer">
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveAccount}
                disabled={isSaving}
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {isSaving ? "保存中..." : "保存修改"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重置密码弹窗 */}
      {isResetModalOpen && resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">重置密码成功</h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm text-slate-600 mb-2">已成功为账号 <span className="font-semibold text-slate-900">{resettingUser.name}</span> 重置密码</p>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">新密码为：</p>
                <p className="text-xl font-mono font-bold text-primary tracking-wider">{resetPassword}</p>
              </div>
              <p className="mt-4 text-xs text-slate-400 italic">请告知用户及时修改初始密码</p>
            </div>
            <div className="flex items-center justify-center border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 (Modal) */}
      {isDeleteModalOpen && deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">确认禁用账号</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm text-slate-600">您确定要禁用账号 <span className="font-semibold text-slate-900">{deletingUser.name} ({deletingUser.phone})</span> 吗？</p>
              <p className="mt-2 text-xs text-slate-400">禁用后该账号将无法登录系统，您可以在账号列表中重新启用。</p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              >
                确认禁用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
