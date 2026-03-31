import React, { useState } from "react";
import { Building2, Edit, Trash2, Plus, Search, Check, AlertCircle, X, Eye } from "lucide-react";
import { cn } from "../utils/cn";
import { pinyin } from 'pinyin-pro';
import { useNavigate } from "react-router-dom";

// 模拟数据
const initialChannels = [
  { id: "1", code: "CH_EAST", name: "华东大区渠道", contact: "张经理", phone: "13800138000", status: "启用", createdAt: "2026-01-01 10:00:00" },
  { id: "2", code: "CH_SOUTH", name: "华南大区渠道", contact: "李总", phone: "13900139000", status: "启用", createdAt: "2026-01-15 14:30:00" },
  { id: "3", code: "CH_NORTH", name: "华北大区渠道", contact: "王总", phone: "13700137000", status: "禁用", createdAt: "2026-02-10 09:15:00" },
];

export function Channels() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState(() => {
    const saved = localStorage.getItem("system_channels");
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem("system_channels", JSON.stringify(initialChannels));
    return initialChannels;
  });

  const saveChannels = (newChannels: any[]) => {
    setChannels(newChannels);
    localStorage.setItem("system_channels", JSON.stringify(newChannels));
    window.dispatchEvent(new Event("storage"));
  };
  
  // 搜索状态
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("全部状态");

  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    contact: "",
    phone: "",
    status: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // 提示状态
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 过滤列表
  const filteredChannels = channels.filter((c) => {
    const matchName = c.name.toLowerCase().includes(searchName.toLowerCase()) || c.code.toLowerCase().includes(searchName.toLowerCase());
    const matchStatus = searchStatus === "全部状态" || c.status === searchStatus;
    return matchName && matchStatus;
  });

  // 打开新建弹窗
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      code: "",
      name: "",
      contact: "",
      phone: "",
      status: true,
    });
    setError("");
    setIsModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEditClick = (channel: typeof initialChannels[0]) => {
    setEditingId(channel.id);
    setFormData({
      code: channel.code,
      name: channel.name,
      contact: channel.contact,
      phone: channel.phone,
      status: channel.status === "启用",
    });
    setError("");
    setIsModalOpen(true);
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setError("渠道名称和编码不能为空");
      return;
    }

    // 校验编码唯一性
    const isCodeExists = channels.some(c => c.code === formData.code && c.id !== editingId);
    if (isCodeExists) {
      setError("渠道编码已存在，请修改");
      return;
    }

    setIsSaving(true);
    setError("");

    setTimeout(() => {
      if (editingId) {
        saveChannels(channels.map(c => c.id === editingId ? {
          ...c,
          code: formData.code,
          name: formData.name,
          contact: formData.contact,
          phone: formData.phone,
          status: formData.status ? "启用" : "禁用",
        } : c));
        showToast("渠道修改成功");
      } else {
        const newChannel = {
          id: Date.now().toString(),
          code: formData.code,
          name: formData.name,
          contact: formData.contact,
          phone: formData.phone,
          status: formData.status ? "启用" : "禁用",
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        saveChannels([newChannel, ...channels]);
        
        // 自动创建渠道管理员账号
        if (formData.phone && formData.contact) {
          const savedUsers = localStorage.getItem("system_users");
          let users = savedUsers ? JSON.parse(savedUsers) : [];
          
          const newAdmin = {
            id: Date.now().toString() + "_admin",
            phone: formData.phone,
            name: formData.contact,
            roles: ["渠道管理员"],
            accountType: "渠道管理员",
            tenantLabel: formData.name,
            status: "启用",
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            isFixedAdmin: false,
          };
          
          users = [newAdmin, ...users];
          localStorage.setItem("system_users", JSON.stringify(users));
          // 触发 storage 事件，让 Accounts 页面更新
          window.dispatchEvent(new Event("storage"));
        }

        showToast("渠道创建成功，已自动生成渠道管理员账号");
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 600);
  };

  // 生成渠道编码
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, name: newName };
      // 只有在新增时，且编码为空或者编码是自动生成的时候才自动更新编码
      if (!editingId && (!prev.code || prev.code.startsWith(pinyin(prev.name.substring(0, 1), { pattern: 'first', toneType: 'none' }).toUpperCase()))) {
        if (newName) {
          // 获取中文首字母
          const firstLetter = pinyin(newName.substring(0, 1), { pattern: 'first', toneType: 'none' }).toUpperCase();
          // 生成4位随机序列号
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          newData.code = `${firstLetter}${randomNum}`;
        } else {
          newData.code = "";
        }
      }
      return newData;
    });
  };

  // 进入渠道查看模式
  const handleViewChannel = (channel: any) => {
    localStorage.setItem("viewing_channel", JSON.stringify(channel));
    window.dispatchEvent(new Event("storage"));
    navigate("/products");
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg ring-1 ring-emerald-600/20 animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            渠道管理
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            管理系统中的顶层渠道（如大区、分公司），超级管理员专属功能。
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            新增渠道
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
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="搜索渠道名称或编码"
              />
            </div>
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
      </div>

      {/* 列表区域 */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                  渠道名称/编码
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  联系人
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  联系电话
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  状态
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  创建时间
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredChannels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-10 w-10 text-slate-300 mb-2" />
                      <p>暂无渠道数据</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredChannels.map((channel) => (
                  <tr key={channel.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-slate-900">{channel.name}</div>
                          <div className="text-slate-500 text-xs font-mono mt-0.5">{channel.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {channel.contact || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {channel.phone || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        channel.status === "启用" 
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" 
                          : "bg-slate-50 text-slate-600 ring-slate-500/10"
                      )}>
                        {channel.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {channel.createdAt}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleViewChannel(channel)}
                        className="text-emerald-600 hover:text-emerald-700 mr-4 inline-flex items-center"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        查看渠道
                      </button>
                      <button
                        onClick={() => handleEditClick(channel)}
                        className="text-primary hover:text-primary-hover mr-4 inline-flex items-center"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        编辑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新建/编辑弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingId ? "编辑渠道" : "新增渠道"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <form id="channel-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                      渠道名称 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="请输入渠道名称"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium leading-6 text-slate-900">
                      渠道编码 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 font-mono"
                        placeholder="如: CH_EAST"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium leading-6 text-slate-900">
                      联系人
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="请输入联系人姓名"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-900">
                      联系电话
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="请输入联系电话"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center pt-2">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                      />
                      <div className={cn(
                        "block w-10 h-6 rounded-full transition-colors",
                        formData.status ? "bg-primary" : "bg-slate-300"
                      )}></div>
                      <div className={cn(
                        "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                        formData.status ? "transform translate-x-4" : ""
                      )}></div>
                    </div>
                    <div className="ml-3 text-sm font-medium text-slate-900">
                      {formData.status ? "启用" : "禁用"}
                    </div>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                form="channel-form"
                disabled={isSaving}
                className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
