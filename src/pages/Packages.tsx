import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Check, AlertCircle, X, Package as PackageIcon, ShoppingBag, Settings } from "lucide-react";
import { cn } from "../utils/cn";
import { ProductSelectorModal } from "../components/ProductSelectorModal";
import { getGiftList, addGift, updateGift, deleteGift, GiftPackage } from "../api/gift";

export function Packages() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isSubTenantAdmin = user?.accountType === "二级租户管理员";
  const userTenantLabel = user?.tenantLabel;

  const viewingChannelStr = localStorage.getItem("viewing_channel");
  const isReadOnly = !!viewingChannelStr;

  const [packages, setPackages] = useState<GiftPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("全部状态");
  const [searchType, setSearchType] = useState("全部类别");
  const [searchForm, setSearchForm] = useState("全部形态");
  const [searchMinFaceValue, setSearchMinFaceValue] = useState("");
  const [searchMaxFaceValue, setSearchMaxFaceValue] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [searchShowPrice, setSearchShowPrice] = useState("全部");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<GiftPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "储值卡",
    form: "电子卡",
    faceValue: "" as string | number,
    costPrice: "" as string | number,
    validityType: "relative",
    validityStartDate: "",
    validityEndDate: "",
    validityDays: 365 as string | number,
    status: "上架",
    products: [] as string[],
    showPrice: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // 提示状态
  const [toastMessage, setToastMessage] = useState("");

  const normalizePackage = (pkg: any): GiftPackage => ({
    ...pkg,
    id: String(pkg.id),
    description: pkg.description || '',
    type: pkg.typeDesc || String(pkg.type || ''),
    form: pkg.form || '电子卡',
    faceValue: pkg.points ?? 0,
    costPrice: pkg.costPrice ?? 0,
    validityType: pkg.validityType || 'relative',
    validityStartDate: pkg.validityStartDate || '',
    validityEndDate: pkg.validityEndDate || '',
    validityDays: pkg.expireDays ?? 365,
    status: pkg.statusDesc || (pkg.status === 1 ? '上架' : '下架'),
    createdAt: pkg.createdAt || pkg.createTime || '',
    products: Array.isArray(pkg.products) ? pkg.products : [],
    showPrice: Boolean(pkg.showPrice),
    tenantLabel: pkg.tenantLabel || '',
  });

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await getGiftList({
        pageNum: page,
        pageSize,
        name: searchName || undefined,
        status: searchStatus === "全部状态" ? undefined : (searchStatus === "上架" ? 1 : 0),
        type: searchType === "全部类别" ? undefined : (searchType === "储值卡" ? 1 : 2),
      });
      setPackages((res.list || []).map(normalizePackage));
      setTotal(res.total || 0);
    } catch (error: any) {
      showToast(error.message || "获取礼包列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchPackages();
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 过滤列表 (前端过滤保留，以防后端不支持某些过滤)
  const filteredPackages = packages.filter((p) => {
    if (isSubTenantAdmin && p.tenantLabel !== userTenantLabel) {
      return false;
    }
    const matchName = p.name.toLowerCase().includes(searchName.toLowerCase());
    const matchStatus = searchStatus === "全部状态" || p.status === searchStatus;
    const matchType = searchType === "全部类别" || p.type === searchType;
    const matchForm = searchForm === "全部形态" || p.form === searchForm;
    
    const minVal = searchMinFaceValue ? parseFloat(searchMinFaceValue) : 0;
    const maxVal = searchMaxFaceValue ? parseFloat(searchMaxFaceValue) : Infinity;
    const matchFaceValue = p.faceValue >= minVal && p.faceValue <= maxVal;

    let matchShowPrice = true;
    if (searchShowPrice === "是") matchShowPrice = p.showPrice === true;
    if (searchShowPrice === "否") matchShowPrice = p.showPrice === false;

    let matchDate = true;
    if (searchStartDate || searchEndDate) {
      const pkgDate = new Date(p.createdAt.split(" ")[0]);
      if (searchStartDate) {
        matchDate = matchDate && pkgDate >= new Date(searchStartDate);
      }
      if (searchEndDate) {
        matchDate = matchDate && pkgDate <= new Date(searchEndDate);
      }
    }

    return matchName && matchStatus && matchType && matchForm && matchFaceValue && matchShowPrice && matchDate;
  });

  // 打开新建/编辑弹窗
  const handleOpenModal = (pkg?: GiftPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({ 
        name: pkg.name, 
        type: pkg.type as any, 
        form: pkg.form as any,
        faceValue: pkg.faceValue, 
        costPrice: pkg.costPrice || "",
        validityType: pkg.validityType as any,
        validityStartDate: pkg.validityStartDate || "",
        validityEndDate: pkg.validityEndDate || "",
        validityDays: pkg.validityDays || "",
        status: pkg.status, 
        products: pkg.products || [],
        showPrice: pkg.showPrice || false
      });
    } else {
      setEditingPackage(null);
      setFormData({ 
        name: "", 
        type: "储值卡", 
        form: "电子卡",
        faceValue: "", 
        costPrice: "",
        validityType: "relative",
        validityStartDate: "",
        validityEndDate: "",
        validityDays: 365,
        status: "上架", 
        products: [],
        showPrice: false
      });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    const faceValueNum = Number(formData.faceValue);
    const costPriceNum = Number(formData.costPrice);
    const validityDaysNum = Number(formData.validityDays);

    if (!formData.name.trim()) {
      setFormError("请输入礼包名称");
      return;
    }
    if (faceValueNum <= 0) {
      setFormError("面额必须大于0");
      return;
    }
    if (formData.validityType === "fixed" && (!formData.validityStartDate || !formData.validityEndDate)) {
      setFormError("请选择完整的固定日期范围");
      return;
    }
    if (formData.validityType === "relative" && validityDaysNum <= 0) {
      setFormError("相对天数必须大于0");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const finalData = {
        id: editingPackage?.id,
        name: formData.name,
        description: editingPackage?.description || "",
        type: formData.type === "储值卡" ? 1 : 2,
        points: faceValueNum,
        cardCount: 1,
        expireDaysCount: formData.validityType === "relative" ? validityDaysNum : 0,
        status: formData.status === "上架" ? 1 : 0,
        productIds: formData.products.map((id) => Number(id)),
      };

      if (editingPackage) {
        await updateGift(finalData);
        showToast("修改成功");
      } else {
        await addGift(finalData);
        showToast("创建成功");
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (error: any) {
      setFormError(error.message || "保存失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除礼包
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  const handleDelete = (id: string) => {
    setConfirmModal({isOpen: true, id});
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.id) {
      try {
        await deleteGift(confirmModal.id);
        showToast("删除成功");
        fetchPackages();
      } catch (error: any) {
        showToast(error.message || "删除失败");
      }
    }
    setConfirmModal({isOpen: false, id: null});
  };

  return (
    <div className="space-y-6 relative">
      {/* 确认删除弹窗 */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">确认删除</h3>
              <button
                onClick={() => setConfirmModal({isOpen: false, id: null})}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 flex-1">
              <p className="text-sm text-slate-600">确定要删除该礼包吗？删除后不可恢复。</p>
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
                确定删除
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
            礼包管理
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            管理系统中的兑换礼包，支持组合多个商品。
          </p>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div>
            <label htmlFor="searchName" className="block text-sm font-medium text-slate-700 mb-1">礼包名称</label>
            <input
              type="text"
              id="searchName"
              placeholder="请输入礼包名称"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="block w-full rounded-md border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          <div>
            <label htmlFor="searchType" className="block text-sm font-medium text-slate-700 mb-1">类别</label>
            <select
              id="searchType"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="全部类别">全部类别</option>
              <option value="储值卡">储值卡</option>
              <option value="兑换券">兑换券</option>
            </select>
          </div>
          <div>
            <label htmlFor="searchForm" className="block text-sm font-medium text-slate-700 mb-1">形态</label>
            <select
              id="searchForm"
              value={searchForm}
              onChange={(e) => setSearchForm(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="全部形态">全部形态</option>
              <option value="电子卡">电子卡</option>
              <option value="纸质卡">纸质卡</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">面额范围 (¥)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="最低"
                value={searchMinFaceValue}
                onChange={(e) => setSearchMinFaceValue(e.target.value === "" ? "" : e.target.value.replace(/^0+(?=\d)/, ''))}
                className="block w-full rounded-md border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                min="0"
                placeholder="最高"
                value={searchMaxFaceValue}
                onChange={(e) => setSearchMaxFaceValue(e.target.value === "" ? "" : e.target.value.replace(/^0+(?=\d)/, ''))}
                className="block w-full rounded-md border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">创建时间</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={searchStartDate}
                onChange={(e) => setSearchStartDate(e.target.value)}
                className="block w-full rounded-md border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
              <span className="text-slate-400">至</span>
              <input
                type="date"
                value={searchEndDate}
                onChange={(e) => setSearchEndDate(e.target.value)}
                className="block w-full rounded-md border-0 py-2 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <label htmlFor="searchShowPrice" className="block text-sm font-medium text-slate-700 mb-1">显示金额</label>
            <select
              id="searchShowPrice"
              value={searchShowPrice}
              onChange={(e) => setSearchShowPrice(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="全部">全部</option>
              <option value="是">是</option>
              <option value="否">否</option>
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
              <option value="上架">上架</option>
              <option value="下架">下架</option>
            </select>
          </div>
          <div className="flex items-end justify-end gap-3 sm:col-span-2 lg:col-span-3 xl:col-span-4 mt-2">
            <button
              type="button"
              onClick={() => {
                setSearchName("");
                setSearchStatus("全部状态");
                setSearchType("全部类别");
                setSearchForm("全部形态");
                setSearchMinFaceValue("");
                setSearchMaxFaceValue("");
                setSearchStartDate("");
                setSearchEndDate("");
                setSearchShowPrice("全部");
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
          <h3 className="text-base font-semibold leading-6 text-slate-900">礼包列表</h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              创建礼包
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">
                  礼包编号
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  礼包名称
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  类别
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  形态
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  面额 (¥)
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  显示金额
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  有效期
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  状态
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  创建时间
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right text-sm font-semibold text-slate-900">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-sm text-slate-500">
                    加载中...
                  </td>
                </tr>
              ) : filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-sm text-slate-500">
                    暂无礼包数据
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900 font-mono">
                      {pkg.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                      <div className="flex items-center">
                        <PackageIcon className="mr-2 h-4 w-4 text-slate-400" />
                        {pkg.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {pkg.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {pkg.form}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-primary">
                      {pkg.faceValue?.toFixed(2) || "0.00"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {pkg.showPrice ? "是" : "否"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {pkg.validityType === "fixed" 
                        ? `${pkg.validityStartDate} 至 ${pkg.validityEndDate}`
                        : `领取后 ${pkg.validityDays} 天内有效`
                      }
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          pkg.status === "上架"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : "bg-slate-50 text-slate-600 ring-slate-500/10"
                        )}
                      >
                        {pkg.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">
                      {pkg.createdAt}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      {!isReadOnly && (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenModal(pkg)}
                            className="text-primary hover:text-primary-hover inline-flex items-center"
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            删除
                          </button>
                        </div>
                      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingPackage ? "编辑礼包" : "创建礼包"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <form id="package-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                      礼包名称 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="如：尊享金卡、2024新年礼券"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium leading-6 text-slate-900">
                      类别 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                      >
                        <option value="储值卡">储值卡</option>
                        <option value="兑换券">兑换券</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      形态 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-3 flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="form"
                          value="电子卡"
                          checked={formData.form === "电子卡"}
                          onChange={(e) => setFormData({ ...formData, form: e.target.value as any })}
                          className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700">电子卡</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="form"
                          value="纸质卡"
                          checked={formData.form === "纸质卡"}
                          onChange={(e) => setFormData({ ...formData, form: e.target.value as any })}
                          className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700">纸质卡</span>
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="faceValue" className="block text-sm font-medium leading-6 text-slate-900">
                        面额 (¥) <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          id="faceValue"
                          min="0"
                          step="0.01"
                          value={formData.faceValue}
                          onChange={(e) => setFormData({ ...formData, faceValue: e.target.value === "" ? "" : e.target.value.replace(/^0+(?=\d)/, '') })}
                          className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="costPrice" className="block text-sm font-medium leading-6 text-slate-900">
                        成本价 (¥)
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          id="costPrice"
                          min="0"
                          step="0.01"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({ ...formData, costPrice: e.target.value === "" ? "" : e.target.value.replace(/^0+(?=\d)/, '') })}
                          className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h4 className="flex items-center text-sm font-semibold text-slate-900 mb-4">
                    <Settings className="mr-2 h-4 w-4 text-primary" />
                    规则配置
                  </h4>
                  
                  <div className="flex items-start gap-4">
                    <label className="block text-sm font-medium leading-6 text-slate-900 w-24 flex-shrink-0 mt-2">
                      有效期设置 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="validityType"
                            value="fixed"
                            checked={formData.validityType === "fixed"}
                            onChange={(e) => setFormData({ ...formData, validityType: e.target.value as any })}
                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-slate-700">固定日期范围</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            disabled={formData.validityType !== "fixed"}
                            value={formData.validityStartDate}
                            onChange={(e) => setFormData({ ...formData, validityStartDate: e.target.value })}
                            className="block rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="date"
                            disabled={formData.validityType !== "fixed"}
                            value={formData.validityEndDate}
                            onChange={(e) => setFormData({ ...formData, validityEndDate: e.target.value })}
                            className="block rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="validityType"
                            value="relative"
                            checked={formData.validityType === "relative"}
                            onChange={(e) => setFormData({ ...formData, validityType: e.target.value as any })}
                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-slate-700">领取后相对天数</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            disabled={formData.validityType !== "relative"}
                            value={formData.validityDays}
                            onChange={(e) => setFormData({ ...formData, validityDays: e.target.value === "" ? "" : e.target.value.replace(/^0+(?=\d)/, '') })}
                            className="block w-24 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <span className="text-sm text-slate-500">天内有效</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium leading-6 text-slate-900">
                    状态
                  </label>
                  <div className="mt-2">
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    >
                      <option value="上架">上架</option>
                      <option value="下架">下架</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPrice"
                    checked={formData.showPrice}
                    onChange={(e) => setFormData({ ...formData, showPrice: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="showPrice" className="text-sm font-medium text-slate-900">
                    是否展示商品金额
                  </label>
                  <span className="text-xs text-slate-500 ml-2">勾选后，该礼包在H5商城将显示商品金额</span>
                </div>

                <div>
                  <label htmlFor="products" className="block text-sm font-medium leading-6 text-slate-900">
                    关联商品
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.products.length > 0 ? (
                        formData.products.map((id) => (
                          <span key={id} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                            {id}
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, products: formData.products.filter(p => p !== id) })}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">暂未选择商品</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsProductSelectorOpen(true)}
                      className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                      <ShoppingBag className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                      选择商品
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <ProductSelectorModal
              isOpen={isProductSelectorOpen}
              onClose={() => setIsProductSelectorOpen(false)}
              onConfirm={(selectedIds) => {
                setFormData({ ...formData, products: selectedIds });
                setIsProductSelectorOpen(false);
              }}
              initialSelectedIds={formData.products}
            />

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <div className="flex-1">
                {formError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  form="package-form"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
                >
                  {isSubmitting ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
