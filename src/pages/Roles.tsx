import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Shield, AlertCircle, X, Check, Settings } from "lucide-react";
import { cn } from "../utils/cn";
import { getRoleList, addRole, updateRole, deleteRole, Role } from "../api/role";

// 模拟数据
const initialRoles = [
  {
    id: "1",
    code: "CHANNEL_ADMIN",
    name: "渠道管理员",
    type: "系统内置",
    roleType: "渠道级",
    summary: "渠道全部权限",
    status: "启用",
    isSystem: true,
    permissions: ["商品列表", "商品分类", "库存盘点", "兑换订单", "退货审核", "物流跟踪", "权限设置", "日志审计"],
    remarks: "系统默认管理员",
  },
  {
    id: "2",
    code: "OP_MANAGER",
    name: "运营主管",
    type: "自定义",
    roleType: "渠道级",
    summary: "礼品审核、兑换核销 +3",
    status: "启用",
    isSystem: false,
    permissions: ["商品列表", "商品分类", "兑换订单", "退货审核"],
    remarks: "负责日常运营",
  },
  {
    id: "3",
    code: "GIFT_STAFF",
    name: "礼品录入员",
    type: "自定义",
    roleType: "租户级",
    summary: "礼品编辑、分类查看",
    status: "禁用",
    isSystem: false,
    permissions: ["商品列表", "商品分类"],
    remarks: "仅负责商品录入",
  },
  {
    id: "4",
    code: "FIN_AUDIT",
    name: "财务审计",
    type: "自定义",
    roleType: "渠道级",
    summary: "对账单下载、统计报表",
    status: "启用",
    isSystem: false,
    permissions: ["兑换订单"],
    remarks: "财务对账专用",
  },
];

const permissionModules = [
  {
    id: "products",
    name: "商品管理",
    actions: ["商品列表", "商品分类", "库存盘点"],
  },
  {
    id: "orders",
    name: "订单管理",
    actions: ["兑换订单", "退货审核", "物流跟踪"],
  },
  {
    id: "system",
    name: "系统维护",
    actions: ["权限设置", "日志审计"],
  },
];

export function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchCode, setSearchCode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchRoleType, setSearchRoleType] = useState("全部作用域");
  const [searchStatus, setSearchStatus] = useState("全部状态");

  const [appliedFilters, setAppliedFilters] = useState({
    code: "",
    name: "",
    roleType: "全部作用域",
    status: "全部状态"
  });

  // 获取角色列表
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        pageSize: itemsPerPage,
      };
      if (appliedFilters.code) params.code = appliedFilters.code;
      if (appliedFilters.name) params.name = appliedFilters.name;
      if (appliedFilters.roleType !== "全部作用域") params.roleType = appliedFilters.roleType;
      if (appliedFilters.status !== "全部状态") params.status = appliedFilters.status;

      const res = await getRoleList(params);
      setRoles(res.list || []);
      setTotal(res.total || 0);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      showToast("获取角色列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, appliedFilters]);

  // 新建/编辑角色弹窗状态
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({
    code: "",
    name: "",
    type: "自定义",
    roleType: "渠道级",
    status: true,
    permissions: [] as string[],
    remarks: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // 提示状态
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 打开新建弹窗
  const handleAddClick = () => {
    setEditingId(null);
    setNewRole({
      code: "",
      name: "",
      type: "自定义",
      roleType: "渠道级",
      status: true,
      permissions: [],
      remarks: "",
    });
    setAddError("");
    setIsAddModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEditClick = (role: Role) => {
    setEditingId(role.id);
    setNewRole({
      code: role.code,
      name: role.name,
      type: role.type,
      roleType: role.roleType,
      status: role.status === "启用",
      permissions: role.permissions || [],
      remarks: role.remarks || "",
    });
    setAddError("");
    setIsAddModalOpen(true);
  };

  // 删除角色
  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteRole(deletingId);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      showToast("角色已删除");
      fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
      showToast("删除角色失败");
    }
  };

  // 切换权限选中状态
  const togglePermission = (action: string) => {
    if (newRole.permissions.includes(action)) {
      setNewRole({ ...newRole, permissions: newRole.permissions.filter((p) => p !== action) });
    } else {
      setNewRole({ ...newRole, permissions: [...newRole.permissions, action] });
    }
  };

  // 提交新建/编辑角色
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.code.trim()) {
      setAddError("请输入角色编码");
      return;
    }
    if (!newRole.name.trim()) {
      setAddError("请输入角色名称");
      return;
    }

    setIsAdding(true);
    setAddError("");

    try {
      const summary = newRole.permissions.length > 0 
        ? newRole.permissions.slice(0, 2).join("、") + (newRole.permissions.length > 2 ? ` +${newRole.permissions.length - 2}` : "") 
        : "无权限";

      const roleData = {
        code: newRole.code,
        name: newRole.name,
        type: newRole.type,
        roleType: newRole.roleType,
        summary,
        status: newRole.status ? "启用" : "禁用",
        permissions: newRole.permissions,
        remarks: newRole.remarks,
      };

      if (editingId) {
        await updateRole(editingId, roleData);
        showToast("角色修改成功");
      } else {
        await addRole(roleData);
        showToast("角色创建成功");
      }
      setIsAddModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      console.error("Failed to save role:", error);
      setAddError(error.response?.data?.message || "保存失败，请重试");
    } finally {
      setIsAdding(false);
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

      {/* 筛选区 */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="searchCode" className="block text-sm font-medium text-slate-700 mb-1">角色编码</label>
            <input
              type="text"
              id="searchCode"
              placeholder="请输入角色编码"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="block w-full rounded-md border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          <div>
            <label htmlFor="searchName" className="block text-sm font-medium text-slate-700 mb-1">角色名称</label>
            <input
              type="text"
              id="searchName"
              placeholder="请输入角色名称"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="block w-full rounded-md border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          <div>
            <label htmlFor="searchRoleType" className="block text-sm font-medium text-slate-700 mb-1">作用域</label>
            <select
              id="searchRoleType"
              value={searchRoleType}
              onChange={(e) => setSearchRoleType(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="全部作用域">全部作用域</option>
              <option value="渠道级">渠道级</option>
              <option value="租户级">租户级</option>
            </select>
          </div>
          <div>
            <label htmlFor="searchStatus" className="block text-sm font-medium text-slate-700 mb-1">状态</label>
            <select
              id="searchStatus"
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
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
              setSearchCode("");
              setSearchName("");
              setSearchRoleType("全部作用域");
              setSearchStatus("全部状态");
              setAppliedFilters({
                code: "",
                name: "",
                roleType: "全部作用域",
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
                code: searchCode,
                name: searchName,
                roleType: searchRoleType,
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

      {/* 列表区 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold leading-6 text-slate-900">角色列表</h3>
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            新建角色
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">
                  角色编码
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  角色名称
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  作用域
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  类型
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  权限摘要
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
                  <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                    加载中...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                    暂无角色数据
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900 font-mono">
                      {role.code}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                      {role.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        role.roleType === "渠道级" 
                          ? "bg-blue-50 text-blue-700 ring-blue-600/20" 
                          : "bg-purple-50 text-purple-700 ring-purple-600/20"
                      )}>
                        {role.roleType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          role.isSystem
                            ? "bg-orange-50 text-orange-700 ring-orange-600/20"
                            : "bg-slate-50 text-slate-600 ring-slate-500/10"
                        )}
                      >
                        {role.type}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-500">
                      <div className="flex flex-wrap gap-1">
                        {role.summary.split("、").map((item, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", role.status === "启用" ? "bg-emerald-500" : "bg-slate-400")} />
                        <span className={role.status === "启用" ? "text-emerald-700" : "text-slate-500"}>{role.status}</span>
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      {role.isSystem ? (
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleEditClick(role)} className="text-primary hover:text-primary-hover">详情</button>
                          <span className="text-slate-300 cursor-not-allowed">修改</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleEditClick(role)} className="text-primary hover:text-primary-hover">配置权限</button>
                          <button onClick={() => handleEditClick(role)} className="text-primary hover:text-primary-hover">修改</button>
                          <button onClick={() => handleDeleteClick(role.id)} className="text-red-600 hover:text-red-900">删除</button>
                        </div>
                      )}
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

      {/* 新建/编辑角色弹窗 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingId ? "编辑角色" : "新建角色"}
              </h3>
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

              <form id="add-role-form" onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="roleCode" className="block text-sm font-medium leading-6 text-slate-900">
                      角色编码 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="roleCode"
                        value={newRole.code}
                        onChange={(e) => setNewRole({ ...newRole, code: e.target.value })}
                        disabled={!!editingId && roles.find(r => r.id === editingId)?.isSystem}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 font-mono disabled:bg-slate-50 disabled:text-slate-500"
                        placeholder="例如: ROLE_MARKETING"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="roleName" className="block text-sm font-medium leading-6 text-slate-900">
                      角色名称 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="roleName"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        disabled={!!editingId && roles.find(r => r.id === editingId)?.isSystem}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 disabled:bg-slate-50 disabled:text-slate-500"
                        placeholder="请输入名称"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="roleType" className="block text-sm font-medium leading-6 text-slate-900">
                      作用域 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <select
                        id="roleType"
                        value={newRole.roleType}
                        onChange={(e) => setNewRole({ ...newRole, roleType: e.target.value })}
                        disabled={!!editingId && roles.find(r => r.id === editingId)?.isSystem}
                        className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 disabled:bg-slate-50 disabled:text-slate-500"
                      >
                        <option value="渠道级">渠道级 (仅本渠道可用)</option>
                        <option value="租户级">租户级 (可分配给二级租户)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      角色状态
                    </label>
                    <div className="mt-2 flex items-center h-9">
                      <button
                        type="button"
                        onClick={() => {
                          if (!(!!editingId && roles.find(r => r.id === editingId)?.isSystem)) {
                            setNewRole({ ...newRole, status: !newRole.status });
                          }
                        }}
                        disabled={!!editingId && roles.find(r => r.id === editingId)?.isSystem}
                        className={cn(
                          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed",
                          newRole.status ? "bg-primary" : "bg-slate-200"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            newRole.status ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                      <span className="ml-3 text-sm text-slate-700">{newRole.status ? "启用" : "禁用"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">
                    权限配置 <span className="text-xs text-slate-500 font-normal ml-2">(勾选赋予该角色的菜单操作权限)</span>
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-6">
                    {permissionModules.map((module) => (
                      <div key={module.id}>
                        <div className="flex items-center mb-3">
                          <input
                            id={`module-${module.id}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-50"
                            checked={module.actions.every(action => newRole.permissions.includes(action))}
                            disabled={!!editingId && roles.find(r => r.id === editingId)?.isSystem}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newPerms = new Set([...newRole.permissions, ...module.actions]);
                                setNewRole({ ...newRole, permissions: Array.from(newPerms) });
                              } else {
                                setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => !module.actions.includes(p)) });
                              }
                            }}
                          />
                          <label htmlFor={`module-${module.id}`} className="ml-2 text-sm font-semibold text-slate-900 cursor-pointer">
                            {module.name}
                          </label>
                        </div>
                        <div className="ml-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {module.actions.map((action) => (
                            <div key={action} className="flex items-center">
                              <input
                                id={`action-${action}`}
                                type="checkbox"
                                checked={newRole.permissions.includes(action)}
                                disabled={!!editingId && roles.find(r => r.id === editingId)?.isSystem}
                                onChange={() => togglePermission(action)}
                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-50"
                              />
                              <label htmlFor={`action-${action}`} className="ml-2 text-sm text-slate-600 cursor-pointer">
                                {action}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium leading-6 text-slate-900">
                    备注
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="remarks"
                      rows={3}
                      value={newRole.remarks}
                      onChange={(e) => setNewRole({ ...newRole, remarks: e.target.value })}
                      disabled={!!editingId && roles.find(r => r.id === editingId)?.isSystem}
                      className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 disabled:bg-slate-50 disabled:text-slate-500"
                      placeholder="填写角色用途说明..."
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                {!!editingId && roles.find(r => r.id === editingId)?.isSystem ? "关闭" : "取消"}
              </button>
              {!(!!editingId && roles.find(r => r.id === editingId)?.isSystem) && (
                <button
                  type="submit"
                  form="add-role-form"
                  disabled={isAdding}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
                >
                  {isAdding ? "保存中..." : (editingId ? "确认修改" : "确认新建")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">确认删除该角色？</h3>
            <p className="text-sm text-slate-500 mb-6">
              此操作不可逆，确定要继续吗？
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 w-full"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 w-full"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
