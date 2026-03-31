import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Send, Check, AlertCircle, X, Ban } from "lucide-react";
import { cn } from "../utils/cn";
import { getAnnouncementList, addAnnouncement, updateAnnouncement, deleteAnnouncement, updateAnnouncementStatus, Announcement } from "../api/announcement";
import { getGiftList } from "../api/gift";

export function Announcements() {
  const viewingChannelStr = localStorage.getItem("viewing_channel");
  const isReadOnly = !!viewingChannelStr;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [packages, setPackages] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchTitle, setSearchTitle] = useState("");
  const [searchStatus, setSearchStatus] = useState("全部状态");
  const [searchPackage, setSearchPackage] = useState("全部礼包");
  const [searchScheduledDate, setSearchScheduledDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    title: "",
    status: "全部状态",
    package: "全部礼包",
    scheduledDate: ""
  });

  const normalizeAnnouncement = (item: any): Announcement => ({
    ...item,
    id: String(item.id),
    status: item.statusDesc || (item.status === 1 ? '已发布' : '草稿'),
    publishedAt: item.publishedTime || '',
    author: item.authorName || '',
    associatedPackages: item.giftIds || [],
    popupFrequency: item.popupFrequency === 2 ? 'every' : 'first',
    scheduledAt: item.scheduledTime || '',
  });

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await getAnnouncementList({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        title: appliedFilters.title || undefined,
        status: appliedFilters.status === "全部状态"
          ? undefined
          : appliedFilters.status === "已发布"
          ? 1
          : appliedFilters.status === "草稿"
          ? 0
          : 2,
      });
      setAnnouncements((res.list || []).map(normalizeAnnouncement));
      setTotal(res.total || 0);
    } catch (error: any) {
      showToast(error.message || "获取公告列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await getGiftList({ pageNum: 1, pageSize: 100 });
      setPackages(res.list?.map((p: any) => ({ id: p.id, name: p.name })) || []);
    } catch (error) {
      console.error("Failed to fetch packages", error);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, itemsPerPage, appliedFilters]);

  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({ 
    title: "", 
    content: "", 
    associatedPackages: [] as string[], 
    popupFrequency: "first" as "first" | "every",
    scheduledAt: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // 提示状态
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 过滤列表 (前端过滤已移除，依赖后端)
  const filteredAnnouncements = announcements;

  // 打开新建/编辑弹窗
  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({ 
        title: announcement.title, 
        content: announcement.content,
        associatedPackages: announcement.associatedPackages || [],
        popupFrequency: (announcement.popupFrequency as any) || "first",
        scheduledAt: announcement.scheduledAt || ""
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({ 
        title: "", 
        content: "", 
        associatedPackages: [], 
        popupFrequency: "first",
        scheduledAt: ""
      });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("请输入公告标题");
      return;
    }
    if (!formData.content.trim()) {
      setFormError("请输入公告内容");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const isScheduled = formData.scheduledAt && new Date(formData.scheduledAt) > new Date();
      const status = isScheduled ? 0 : (publish ? 1 : 0);

      const payload = {
        id: editingAnnouncement?.id,
        title: formData.title,
        content: formData.content,
        giftIds: formData.associatedPackages.map((id) => Number(id)),
        popupFrequency: formData.popupFrequency === 'every' ? 2 : 1,
        scheduledTime: formData.scheduledAt ? new Date(formData.scheduledAt).getTime() : undefined,
        status
      };

      if (editingAnnouncement) {
        await updateAnnouncement(payload);
        showToast(isScheduled ? "已保存为草稿并定时发布" : (publish ? "发布成功" : "保存成功"));
      } else {
        await addAnnouncement(payload);
        showToast(isScheduled ? "已保存为草稿并定时发布" : (publish ? "发布成功" : "草稿已保存"));
      }
      
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (error: any) {
      setFormError(error.message || "保存公告失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 快捷发布
  const handlePublish = async (id: string) => {
    try {
      await updateAnnouncementStatus(id, "已发布");
      showToast("发布成功");
      fetchAnnouncements();
    } catch (error: any) {
      showToast(error.message || "发布失败");
    }
  };

  // 下线公告
  const handleOffline = async (id: string) => {
    try {
      await updateAnnouncementStatus(id, "已下线");
      showToast("公告已下线");
      fetchAnnouncements();
    } catch (error: any) {
      showToast(error.message || "下线失败");
    }
  };

  // 定时发布检查 (前端模拟，实际应由后端定时任务处理)
  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     const now = new Date();
  //     setAnnouncements(prev => prev.map(a => {
  //       if (a.status === "草稿" && a.scheduledAt && new Date(a.scheduledAt) <= now) {
  //         return { ...a, status: "已发布", publishedAt: now.toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-") };
  //       }
  //       return a;
  //     }));
  //   }, 60000); // 每分钟检查一次
  //   return () => clearInterval(interval);
  // }, []);

  // 删除公告
  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAnnouncement(deletingId);
      showToast("删除成功");
      fetchAnnouncements();
    } catch (error: any) {
      showToast(error.message || "删除失败");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
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

      {/* 标题与摘要区 */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            公告管理
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            管理系统公告，支持发布、编辑、删除等操作。
          </p>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="searchTitle" className="block text-sm font-medium text-slate-700 mb-1">公告标题</label>
            <input
              type="text"
              id="searchTitle"
              placeholder="请输入公告标题"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="block w-full rounded-md border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
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
              <option value="已发布">已发布</option>
              <option value="草稿">草稿</option>
              <option value="已下线">已下线</option>
            </select>
          </div>
          <div>
            <label htmlFor="searchPackage" className="block text-sm font-medium text-slate-700 mb-1">关联礼包</label>
            <select
              id="searchPackage"
              value={searchPackage}
              onChange={(e) => setSearchPackage(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="全部礼包">全部礼包</option>
              {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="searchScheduledDate" className="block text-sm font-medium text-slate-700 mb-1">定时发布时间</label>
            <input
              type="date"
              id="searchScheduledDate"
              value={searchScheduledDate}
              onChange={(e) => setSearchScheduledDate(e.target.value)}
              className="block w-full rounded-md border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          <div className="flex items-end justify-end gap-3 sm:col-span-4">
            <button
              type="button"
              onClick={() => {
                setSearchTitle("");
                setSearchStatus("全部状态");
                setSearchPackage("全部礼包");
                setSearchScheduledDate("");
                setAppliedFilters({
                  title: "",
                  status: "全部状态",
                  package: "全部礼包",
                  scheduledDate: ""
                });
              }}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              重置
            </button>
            <button
              type="button"
              onClick={() => setAppliedFilters({
                title: searchTitle,
                status: searchStatus,
                package: searchPackage,
                scheduledDate: searchScheduledDate
              })}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              查询
            </button>
          </div>
        </div>
      </div>

      {/* 列表区 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold leading-6 text-slate-900">公告列表</h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              新建公告
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  标题
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  内容
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  关联礼包
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  弹出频率
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  状态
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  发布/定时时间
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
              ) : filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                    暂无公告数据
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900">
                      {announcement.title}
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                      {announcement.content}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {announcement.associatedPackages.length === 0 ? "全部" : announcement.associatedPackages.map(id => packages.find(p => p.id === id)?.name || id).join(", ")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {announcement.popupFrequency === "first" ? "首次弹出" : "每次弹出"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          announcement.status === "已发布"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : announcement.status === "已下线"
                            ? "bg-red-50 text-red-700 ring-red-600/20"
                            : "bg-slate-50 text-slate-600 ring-slate-500/10"
                        )}
                      >
                        {announcement.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">
                      {announcement.status === "草稿" && announcement.scheduledAt ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400">定时:</span>
                          <span>{announcement.scheduledAt.replace("T", " ")}</span>
                        </div>
                      ) : (
                        announcement.publishedAt
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      {!isReadOnly ? (
                        <div className="flex items-center justify-end gap-3">
                          {announcement.status === "草稿" && (
                            <button
                              onClick={() => handlePublish(announcement.id)}
                              className="text-primary hover:text-primary-hover inline-flex items-center"
                            >
                              <Send className="mr-1 h-4 w-4" />
                              发布
                            </button>
                          )}
                          {announcement.status === "已发布" && (
                            <button
                              onClick={() => handleOffline(announcement.id)}
                              className="text-slate-600 hover:text-slate-900 inline-flex items-center"
                            >
                              <Ban className="mr-1 h-4 w-4" />
                              下线
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(announcement)}
                            className="text-primary hover:text-primary-hover inline-flex items-center"
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            删除
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300 cursor-not-allowed">只读模式</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-700">
            显示 {Math.min((currentPage - 1) * itemsPerPage + 1, total)} 到 {Math.min(currentPage * itemsPerPage, total)} 条，共 {total} 条
          </div>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50">上一页</button>
            <button disabled={currentPage >= Math.ceil(total / itemsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50">下一页</button>
          </div>
        </div>
      </div>

      {/* 新建/编辑弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingAnnouncement ? "编辑公告" : "新建公告"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-5 overflow-y-auto flex-1">
              {formError && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <form id="announcement-form" className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium leading-6 text-slate-900">
                    公告标题 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="请输入公告标题"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium leading-6 text-slate-900">
                    公告内容 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="content"
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="请输入公告内容..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">
                      关联礼包
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                      {packages.map(pkg => (
                        <label key={pkg.id} className="flex items-center text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={formData.associatedPackages.includes(pkg.id)}
                            onChange={(e) => {
                              const newPackages = e.target.checked
                                ? [...formData.associatedPackages, pkg.id]
                                : formData.associatedPackages.filter(id => id !== pkg.id);
                              setFormData({ ...formData, associatedPackages: newPackages });
                            }}
                            className="mr-2 h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                          />
                          {pkg.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">
                      弹出频率
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm text-slate-700">
                        <input
                          type="radio"
                          name="popupFrequency"
                          value="first"
                          checked={formData.popupFrequency === "first"}
                          onChange={(e) => setFormData({ ...formData, popupFrequency: e.target.value as "first" | "every" })}
                          className="mr-2 h-4 w-4 text-primary focus:ring-primary border-slate-300"
                        />
                        首次弹出
                      </label>
                      <label className="flex items-center text-sm text-slate-700">
                        <input
                          type="radio"
                          name="popupFrequency"
                          value="every"
                          checked={formData.popupFrequency === "every"}
                          onChange={(e) => setFormData({ ...formData, popupFrequency: e.target.value as "first" | "every" })}
                          className="mr-2 h-4 w-4 text-primary focus:ring-primary border-slate-300"
                        />
                        每次弹出
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="scheduledAt" className="block text-sm font-medium leading-6 text-slate-900">
                    定时发布时间
                  </label>
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      id="scheduledAt"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={isSubmitting}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-inset ring-primary hover:bg-orange-50 disabled:opacity-70"
              >
                保存草稿
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {isSubmitting ? "处理中..." : "发布公告"}
              </button>
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">确认删除该公告？</h3>
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
