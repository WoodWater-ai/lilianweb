import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Trash2, Check, AlertCircle, X, Key, QrCode, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "../utils/cn";
import { getCardList, batchGenerateCard, importCustomCard, mapPhoneCard, disableCard, CardSecret } from "../api/card";
import { getGiftList, GiftPackage } from "../api/gift";

export function Secrets() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isSubTenantAdmin = user?.accountType === "二级租户管理员";
  const userTenantLabel = user?.tenantLabel;

  const viewingChannelStr = localStorage.getItem("viewing_channel");
  const isReadOnly = !!viewingChannelStr;

  const [secrets, setSecrets] = useState<CardSecret[]>([]);
  const [mockPackages, setMockPackages] = useState<GiftPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSecrets, setSelectedSecrets] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchProduct, setSearchProduct] = useState("");
  const [searchStatus, setSearchStatus] = useState("全部状态");

  const fetchPackages = async () => {
    try {
      const res = await getGiftList({ pageNum: 1, pageSize: 1000 });
      setMockPackages((res.list || []).map((pkg: any) => ({
        ...pkg,
        id: String(pkg.id),
        type: pkg.typeDesc || String(pkg.type || ''),
        faceValue: pkg.points ?? 0,
      })));
    } catch (error) {
      console.error("Failed to fetch packages", error);
    }
  };

  const fetchSecrets = async () => {
    setIsLoading(true);
    try {
      const res = await getCardList({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        giftName: searchProduct || undefined,
        status: searchStatus === "全部状态" ? undefined : (searchStatus === "未使用" ? 0 : searchStatus === "已使用" ? 1 : 2)
      });
      setSecrets((res.list || []).map(normalizeSecret));
      setTotal(res.total || 0);
    } catch (error: any) {
      showToast(error.message || "获取卡密列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, [currentPage, itemsPerPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSecrets();
  };

  // 过滤列表 (前端过滤保留，以防后端不支持某些过滤)
  const filteredSecrets = secrets.filter((s) => {
    if (isSubTenantAdmin && s.tenantLabel !== userTenantLabel) {
      return false;
    }
    const matchProduct = (s.packageName || "").toLowerCase().includes(searchProduct.toLowerCase());
    const matchStatus = searchStatus === "全部状态" || s.status === searchStatus;
    return matchProduct && matchStatus;
  });

  const toggleSelectAll = () => {
    if (selectedSecrets.length === filteredSecrets.length) {
      setSelectedSecrets([]);
    } else {
      setSelectedSecrets(filteredSecrets.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedSecrets.includes(id)) {
      setSelectedSecrets(selectedSecrets.filter(sId => sId !== id));
    } else {
      setSelectedSecrets([...selectedSecrets, id]);
    }
  };

  const paginatedSecrets = filteredSecrets;

  // 弹窗状态
  // mode: 'batch' (批量生成), 'custom' (自定义卡密), 'phone' (手机号映射)
  const [modalMode, setModalMode] = useState<'batch' | 'custom' | 'phone' | null>(null);
  
  const [formData, setFormData] = useState({
    packageId: "",
    amountOrTimes: "" as string | number,
    generateCount: 1,
    validityDays: 365 as string | number,
    prefix: "",
    hasQrCode: false,
    customCodes: "",
    phones: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [qrCodeModal, setQrCodeModal] = useState<{isOpen: boolean, data: any}>({isOpen: false, data: null});

  // 提示状态
  const [toastMessage, setToastMessage] = useState("");

  const normalizeSecret = (card: any): CardSecret => ({
    ...card,
    id: String(card.id),
    packageId: String(card.giftId || ''),
    packageName: card.giftName || '',
    cardNumber: card.cardNo || card.cardNumber || '',
    status: card.statusDesc || String(card.status || ''),
    createdAt: card.createdAt || card.createTime || '',
    usedAt: card.useTime || '',
    usedBy: card.phone || '',
    tenantLabel: card.tenantLabel || '',
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 监听选择礼包，自动填充面额/次数
  const handlePackageChange = (pkgId: string) => {
    const pkg = mockPackages.find(p => p.id === pkgId);
    if (pkg) {
      setFormData(prev => ({
        ...prev,
        packageId: pkgId,
        amountOrTimes: pkg.type === "储值卡" ? pkg.faceValue : 1
      }));
    } else {
      setFormData(prev => ({ ...prev, packageId: "", amountOrTimes: "" }));
    }
  };

  // 打开弹窗
  const handleOpenModal = (mode: 'batch' | 'custom' | 'phone') => {
    setModalMode(mode);
    setFormData({
      packageId: "",
      amountOrTimes: "",
      generateCount: 1,
      validityDays: 365,
      prefix: "",
      hasQrCode: false,
      customCodes: "",
      phones: "",
    });
    setFormError("");
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (!formData.packageId) {
      setFormError("请选择关联礼包");
      return;
    }
    
    const pkg = mockPackages.find(p => p.id === formData.packageId);
    if (!pkg) return;

    const amountOrTimesNum = Number(formData.amountOrTimes);
    if (amountOrTimesNum <= 0) {
      setFormError(pkg.type === "储值卡" ? "面额必须大于0" : "可兑换次数必须大于0");
      return;
    }

    const validityDaysNum = Number(formData.validityDays);
    if (validityDaysNum <= 0) {
      setFormError("有效时间必须大于0");
      return;
    }

    let codeLines: string[] = [];
    let phoneLines: string[] = [];

    if (modalMode === 'custom') {
      codeLines = formData.customCodes.split("\n").filter(line => line.trim() !== "");
      if (codeLines.length === 0) {
        setFormError("请输入自定义卡密");
        return;
      }
    } else if (modalMode === 'phone') {
      phoneLines = formData.phones.split("\n").filter(line => line.trim() !== "");
      if (phoneLines.length === 0) {
        setFormError("请输入手机号");
        return;
      }
    } else if (modalMode === 'batch') {
      if (formData.generateCount <= 0) {
        setFormError("生成数量必须大于0");
        return;
      }
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payloadBase = {
        giftId: Number(pkg.id),
        validityDays: validityDaysNum,
        couponPrefix: formData.prefix || undefined,
        generateQrCode: formData.hasQrCode,
      };

      const count = modalMode === 'batch' ? formData.generateCount : (modalMode === 'custom' ? codeLines.length : phoneLines.length);

      if (modalMode === 'batch') {
        await batchGenerateCard({
          ...payloadBase,
          count: formData.generateCount,
        });
      } else if (modalMode === 'custom') {
        await importCustomCard({
          ...payloadBase,
          customCodes: codeLines,
        });
      } else if (modalMode === 'phone') {
        await mapPhoneCard({
          ...payloadBase,
          phoneList: phoneLines,
        });
      }

      showToast(`成功生成 ${count} 条卡密`);
      setModalMode(null);
      fetchSecrets();
    } catch (error: any) {
      setFormError(error.message || "生成失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除卡密
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  const handleDelete = (id: string) => {
    setConfirmModal({isOpen: true, id});
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.id) {
      try {
        await disableCard({ id: Number(confirmModal.id) });
        showToast("卡密已作废");
        fetchSecrets();
      } catch (error: any) {
        showToast(error.message || "作废失败");
      }
    }
    setConfirmModal({isOpen: false, id: null});
  };

  const handleExportCSV = () => {
    if (filteredSecrets.length === 0) {
      showToast("没有可导出的数据");
      return;
    }

    try {
      const headers = ["关联礼包", "卡密", "券号", "面额/次数", "状态", "批次号", "关联手机号", "导入时间"];
      const csvContent = [
        headers.join(","),
        ...filteredSecrets.map(s => [
          (s.packageName || "").replace(/,/g, " "),
          s.cardNumber || "",
          (s as any).couponCode || "",
          (s as any).amount !== undefined ? `${(s as any).amount}元` : ((s as any).times !== undefined ? `${(s as any).times}次` : ""),
          s.status || "",
          (s as any).batchId || "",
          (s as any).phone || "",
          s.createdAt || ""
        ].join(","))
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `secrets_export_${new Date().getTime()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast("CSV导出成功");
    } catch (error) {
      console.error("Export CSV error:", error);
      showToast("导出失败，请重试");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* 确认作废弹窗 */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">确认作废</h3>
              <button
                onClick={() => setConfirmModal({isOpen: false, id: null})}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 flex-1">
              <p className="text-sm text-slate-600">确定要作废该卡密吗？作废后不可恢复。</p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                onClick={() => setConfirmModal({isOpen: false, id: null})}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              >
                确定作废
              </button>
            </div>
          </div>
        </div>
      )}

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
            卡密管理
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            管理虚拟商品的卡密库存，支持批量导入和状态追踪。
          </p>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="searchProduct" className="block text-sm font-medium text-slate-700 mb-1">关联礼包</label>
            <input
              type="text"
              id="searchProduct"
              placeholder="请输入礼包名称"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
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
              <option value="未使用">未使用</option>
              <option value="已使用">已使用</option>
              <option value="已作废">已作废</option>
            </select>
          </div>
          <div className="flex items-end justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchProduct("");
                setSearchStatus("全部状态");
              }}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              重置
            </button>
            <button
              type="button"
              onClick={handleSearch}
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
          <h3 className="text-base font-semibold leading-6 text-slate-900">卡密列表</h3>
        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenModal('batch')}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              批量生成
            </button>
            <button
              type="button"
              onClick={() => handleOpenModal('custom')}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              自定义卡密
            </button>
            <button
              type="button"
              onClick={() => handleOpenModal('phone')}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              手机号映射
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              导出 CSV
            </button>
          </div>
        )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">
                  <input type="checkbox" checked={selectedSecrets.length === filteredSecrets.length && filteredSecrets.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">关联礼包</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">卡密</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">券号</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">面额/次数</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">状态</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">二维码</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">批次号</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">关联手机号</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">导入时间</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right text-sm font-semibold text-slate-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-sm text-slate-500">
                    加载中...
                  </td>
                </tr>
              ) : paginatedSecrets.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-sm text-slate-500">
                    暂无卡密数据
                  </td>
                </tr>
              ) : (
                paginatedSecrets.map((secret) => (
                  <tr key={secret.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                      <input type="checkbox" checked={selectedSecrets.includes(secret.id)} onChange={() => toggleSelect(secret.id)} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900">
                      <div className="flex items-center">
                        <Key className="mr-2 h-4 w-4 text-slate-400" />
                        {secret.packageName}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">
                      {secret.status === "未使用" ? secret.cardNumber : "********"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">{(secret as any).couponCode || "-"}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {(secret as any).amount !== undefined ? `¥${(secret as any).amount}` : ((secret as any).times !== undefined ? `${(secret as any).times}次` : "-")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          secret.status === "未使用"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : secret.status === "已使用"
                            ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                            : "bg-slate-50 text-slate-600 ring-slate-500/10"
                        )}
                      >
                        {secret.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {(secret as any).hasQrCode ? (
                        <button 
                          onClick={() => setQrCodeModal({isOpen: true, data: secret})}
                          className="text-primary hover:text-primary-hover inline-flex items-center"
                        >
                          <QrCode className="h-5 w-5" />
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">{(secret as any).batchId || "-"}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">{(secret as any).phone || "-"}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">
                      {secret.createdAt}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      {!isReadOnly ? (
                        secret.status === "未使用" ? (
                          <button
                            onClick={() => handleDelete(secret.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            作废
                          </button>
                        ) : (
                          <span className="text-slate-300 cursor-not-allowed">不可操作</span>
                        )
                      ) : (
                        <span className="text-slate-300 cursor-not-allowed">只读模式</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
      </div>

      {/* 统一弹窗 (批量生成 / 自定义卡密 / 手机号映射) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">
                {modalMode === 'batch' ? '批量生成卡密' : modalMode === 'custom' ? '自定义卡密' : '手机号映射生成'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
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

              <form id="secret-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    关联礼包 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <select
                      value={formData.packageId}
                      onChange={(e) => handlePackageChange(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    >
                      <option value="">请选择关联礼包</option>
                      {mockPackages.filter(p => !isSubTenantAdmin || p.tenantLabel === userTenantLabel).map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} ({pkg.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.packageId && (
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      {mockPackages.find(p => p.id === formData.packageId)?.type === "储值卡" ? "卡密面额" : "可兑换次数"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        value={formData.amountOrTimes}
                        onChange={(e) => setFormData({ ...formData, amountOrTimes: e.target.value === "" ? "" : e.target.value.replace(/^0+(?=\d)/, '') })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-slate-500 sm:text-sm">
                          {mockPackages.find(p => p.id === formData.packageId)?.type === "储值卡" ? "元" : "次"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {modalMode === 'batch' && (
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      生成数量 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        min="1"
                        value={formData.generateCount}
                        onChange={(e) => setFormData({ ...formData, generateCount: e.target.value === "" ? "" : parseInt(e.target.value.replace(/^0+(?=\d)/, '')) || 0 })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                )}

                {modalMode === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      自定义卡密内容 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <textarea
                        rows={6}
                        value={formData.customCodes}
                        onChange={(e) => setFormData({ ...formData, customCodes: e.target.value })}
                        placeholder="请输入卡密内容，一行一条数据"
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 font-mono"
                      />
                    </div>
                  </div>
                )}

                {modalMode === 'phone' && (
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      手机号列表 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <textarea
                        rows={6}
                        value={formData.phones}
                        onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
                        placeholder="请输入手机号，一行一条数据（支持重复）"
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    有效时间 (天) <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="number"
                      min="1"
                      value={formData.validityDays}
                      onChange={(e) => setFormData({ ...formData, validityDays: e.target.value === "" ? "" : e.target.value.replace(/^0+(?=\d)/, '') })}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    券号前缀
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                      placeholder="非必填，券号前缀-流水号"
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="hasQrCode"
                    type="checkbox"
                    checked={formData.hasQrCode}
                    onChange={(e) => setFormData({ ...formData, hasQrCode: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="hasQrCode" className="ml-2 block text-sm text-slate-900">
                    生成二维码
                  </label>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                form="secret-form"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {isSubmitting ? "处理中..." : "确定"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 二维码弹窗 */}
      {qrCodeModal.isOpen && qrCodeModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">卡密二维码</h3>
              <button
                onClick={() => setQrCodeModal({isOpen: false, data: null})}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-5 flex-1 text-center">
              <div className="flex justify-center mb-6 bg-slate-50 p-4 rounded-lg">
                <QRCodeSVG 
                  value={`https://example.com/redeem?code=${qrCodeModal.data.cardNumber}&coupon=${qrCodeModal.data.couponCode || ''}`} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="text-left space-y-2 mb-6">
                <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">关联礼包：</span>{qrCodeModal.data.packageName}</p>
                <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">券号：</span>{qrCodeModal.data.couponCode || "-"}</p>
                <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">卡密：</span>{qrCodeModal.data.cardNumber}</p>
              </div>

              <button
                onClick={() => {
                  // 模拟下载
                  showToast("二维码已下载");
                  setQrCodeModal({isOpen: false, data: null});
                }}
                className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
              >
                <Download className="mr-2 h-4 w-4" />
                下载二维码
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
