import React, { useState, useCallback } from "react";
import { Search, Plus, Edit, Trash2, Check, AlertCircle, X, Truck, ShoppingBag, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "../utils/cn";
import { ProductSelectorModal } from "../components/ProductSelectorModal";
import { useSort, SortConfig } from "../utils/sort";

export interface ShippingTemplate {
  id: string;
  name: string;
  baseFreight: number;
  freeShippingThreshold: string;
  restrictedAreas: { province: string, cities: string[] }[];
  shippingTimeLimit: string;
  deliveryRegion: { province: string, cities: string[] }[];
  deliveryTimeRestriction: string;
  dateRange: { start: string, end: string };
  timeSlot: string;
  status: string;
  createdAt: string;
  products: string[];
  tenantLabel?: string;
}

// 模拟数据
const initialTemplates: ShippingTemplate[] = [
  {
    id: "TPL-001",
    name: "全国包邮（偏远地区除外）",
    baseFreight: 0,
    freeShippingThreshold: "99",
    restrictedAreas: [{ province: "新疆维吾尔自治区", cities: [] }, { province: "西藏自治区", cities: [] }],
    shippingTimeLimit: "24小时内发货",
    deliveryRegion: [{ province: "北京市", cities: [] }],
    deliveryTimeRestriction: "无",
    dateRange: { start: "", end: "" },
    timeSlot: "",
    status: "启用",
    createdAt: "2026-03-01 10:00:00",
    products: ["P001", "P002"],
    tenantLabel: "默认二级租户"
  },
  {
    id: "TPL-002",
    name: "偏远地区运费",
    baseFreight: 20,
    freeShippingThreshold: "",
    restrictedAreas: [{ province: "新疆维吾尔自治区", cities: [] }, { province: "西藏自治区", cities: [] }],
    shippingTimeLimit: "48小时内发货",
    deliveryRegion: [{ province: "上海市", cities: [] }],
    deliveryTimeRestriction: "无",
    dateRange: { start: "", end: "" },
    timeSlot: "",
    status: "启用",
    createdAt: "2026-03-01 10:05:00",
    products: ["P001", "P002"],
    tenantLabel: "华东大区-南京分部"
  },
  {
    id: "TPL-003",
    name: "顺丰冷链专线",
    baseFreight: 30,
    freeShippingThreshold: "",
    restrictedAreas: [],
    shippingTimeLimit: "24小时内发货",
    deliveryRegion: [{ province: "广东省", cities: [] }],
    deliveryTimeRestriction: "节假日",
    dateRange: { start: "", end: "" },
    timeSlot: "",
    status: "停用",
    createdAt: "2026-02-15 14:30:00",
    products: ["P003"],
    tenantLabel: "默认二级租户"
  },
];

const CHINA_REGIONS = [
  { province: "全部", cities: [] },
  { province: "北京市", cities: ["东城区", "西城区", "朝阳区", "海淀区"] },
  { province: "天津市", cities: ["和平区", "河西区", "南开区"] },
  { province: "河北省", cities: ["石家庄市", "唐山市", "保定市"] },
  { province: "山西省", cities: ["太原市", "大同市", "长治市"] },
  { province: "内蒙古自治区", cities: ["呼和浩特市", "包头市", "鄂尔多斯市"] },
  { province: "辽宁省", cities: ["沈阳市", "大连市", "鞍山市"] },
  { province: "吉林省", cities: ["长春市", "吉林市", "四平市"] },
  { province: "黑龙江省", cities: ["哈尔滨市", "齐齐哈尔市", "大庆市"] },
  { province: "上海市", cities: ["黄浦区", "徐汇区", "静安区", "浦东新区"] },
  { province: "江苏省", cities: ["南京市", "苏州市", "无锡市"] },
  { province: "浙江省", cities: ["杭州市", "宁波市", "温州市"] },
  { province: "安徽省", cities: ["合肥市", "芜湖市", "蚌埠市"] },
  { province: "福建省", cities: ["福州市", "厦门市", "泉州市"] },
  { province: "江西省", cities: ["南昌市", "赣州市", "九江市"] },
  { province: "山东省", cities: ["济南市", "青岛市", "烟台市"] },
  { province: "河南省", cities: ["郑州市", "洛阳市", "开封市"] },
  { province: "湖北省", cities: ["武汉市", "宜昌市", "襄阳市"] },
  { province: "湖南省", cities: ["长沙市", "株洲市", "湘潭市"] },
  { province: "广东省", cities: ["广州市", "深圳市", "东莞市", "佛山市"] },
];

const RegionSelector = ({ 
  selectedRegions = [], 
  onChange 
}: { 
  selectedRegions?: { province: string, cities: string[] }[], 
  onChange: (regions: { province: string, cities: string[] }[]) => void 
}) => {
  const regions = selectedRegions || [];
  
  const isAllSelected = regions.some(r => r.province === "全部");

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([{ province: "全部", cities: [] }]);
    }
  };

  const toggleProvince = (province: string) => {
    if (province === "全部") return toggleAll();
    
    const exists = regions.find(r => r.province === province);
    if (exists) {
      onChange(regions.filter(r => r.province !== province));
    } else {
      const region = CHINA_REGIONS.find(r => r.province === province);
      onChange([...regions.filter(r => r.province !== "全部"), { province, cities: region ? [...region.cities] : [] }]);
    }
  };

  const toggleCity = (province: string, city: string) => {
    const region = regions.find(r => r.province === province);
    const fullRegion = CHINA_REGIONS.find(r => r.province === province);
    if (!region) {
      onChange([...regions.filter(r => r.province !== "全部"), { province, cities: [city] }]);
    } else {
      const cityExists = region.cities.includes(city);
      const newCities = cityExists 
        ? region.cities.filter(c => c !== city)
        : [...region.cities, city];
      
      if (newCities.length === 0) {
        onChange(regions.filter(r => r.province !== province));
      } else {
        onChange(regions.map(r => r.province === province ? { ...r, cities: newCities } : r));
      }
    }
  };

  return (
    <div className="space-y-4 max-h-60 overflow-y-auto border border-slate-200 rounded-md p-3">
      <label className="flex items-center space-x-2 font-bold text-sm text-primary">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={toggleAll}
          className="rounded border-slate-300 text-primary focus:ring-primary"
        />
        <span>全部</span>
      </label>
      {CHINA_REGIONS.filter(r => r.province !== "全部").map((region) => {
        const selectedRegion = regions.find(r => r.province === region.province);
        const isProvinceSelected = !!selectedRegion;

        return (
          <div key={region.province}>
            <label className="flex items-center space-x-2 font-medium text-sm text-slate-900">
              <input
                type="checkbox"
                checked={isProvinceSelected}
                onChange={() => toggleProvince(region.province)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span>{region.province}</span>
            </label>
            <div className="grid grid-cols-2 gap-1 ml-6 mt-1">
              {region.cities.map(city => (
                <label key={city} className="flex items-center space-x-1 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={selectedRegion?.cities.includes(city) || false}
                    onChange={() => toggleCity(region.province, city)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span>{city}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};


export function Shipping() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isSubTenantAdmin = user?.accountType === "二级租户管理员";
  const userTenantLabel = user?.tenantLabel;

  const viewingChannelStr = localStorage.getItem("viewing_channel");
  const isReadOnly = !!viewingChannelStr;

  const [templates, setTemplates] = useState<ShippingTemplate[]>(initialTemplates);

  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("全部状态");

  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    baseFreight: 0 as number | string,
    freeShippingThreshold: "",
    restrictedAreas: [] as { province: string, cities: string[] }[], // 修改：结构化限制地区
    shippingTimeLimit: "24小时内发货",
    deliveryRegion: [] as { province: string, cities: string[] }[], // 修改：结构化配送地区
    deliveryTimeRestriction: "无",
    dateRange: { start: "", end: "" }, // 修改：指定日期范围
    timeSlot: "",
    status: "启用",
    products: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // 提示状态
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 过滤列表
  const filteredTemplates: ShippingTemplate[] = templates.filter((t) => {
    if (isSubTenantAdmin && t.tenantLabel !== userTenantLabel) {
      return false;
    }
    const matchName = t.name.toLowerCase().includes(searchName.toLowerCase());
    const matchStatus = searchStatus === "全部状态" || t.status === searchStatus;
    return matchName && matchStatus;
  });

  // 排序状态
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'default' });
  const sortedTemplates = useSort(filteredTemplates, sortConfig);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'default' ? 'asc' :
                 prev.key === key && prev.direction === 'asc' ? 'desc' : 'default'
    }));
  };

  const SortIcon = ({ sortKey }: { sortKey: string }) => {
    if (sortConfig.key !== sortKey || sortConfig.direction === 'default') return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // 打开弹窗
  const handleOpenModal = (template?: typeof initialTemplates[0]) => {
    if (template) {
      setEditingId(template.id);
      setFormData({
        name: template.name,
        baseFreight: template.baseFreight || 0,
        freeShippingThreshold: template.freeShippingThreshold || "",
        restrictedAreas: template.restrictedAreas || [],
        shippingTimeLimit: template.shippingTimeLimit || "24小时内发货",
        deliveryRegion: template.deliveryRegion && template.deliveryRegion.length > 0 ? template.deliveryRegion : [CHINA_REGIONS[0]],
        deliveryTimeRestriction: template.deliveryTimeRestriction || "无",
        dateRange: template.dateRange || { start: "", end: "" },
        timeSlot: template.timeSlot || "",
        status: template.status,
        products: template.products || []
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        baseFreight: 0,
        freeShippingThreshold: "",
        restrictedAreas: [],
        shippingTimeLimit: "24小时内发货",
        deliveryRegion: [CHINA_REGIONS[0]],
        deliveryTimeRestriction: "无",
        dateRange: { start: "", end: "" },
        timeSlot: "",
        status: "启用",
        products: []
      });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("请输入模板名称");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    setTimeout(() => {
      if (editingId) {
        setTemplates(templates.map(t => 
          t.id === editingId ? { ...t, ...formData } : t
        ));
        showToast("运费模板已更新");
      } else {
        const now = new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");
        const newTemplate = {
          id: `TPL-NEW-${Date.now()}`,
          ...formData,
          createdAt: now,
          tenantLabel: isSubTenantAdmin ? userTenantLabel : "默认二级租户"
        };
        setTemplates([newTemplate, ...templates]);
        showToast("运费模板已创建");
      }
      setIsSubmitting(false);
      setIsModalOpen(false);
    }, 600);
  };

  // 删除模板
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  const handleDelete = (id: string) => {
    setConfirmModal({isOpen: true, id});
  };

  const handleConfirmDelete = () => {
    if (confirmModal.id) {
      setTemplates(templates.filter(t => t.id !== confirmModal.id));
      showToast("运费模板已删除");
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
              <p className="text-sm text-slate-600">确定要删除该运费模板吗？删除后不可恢复。</p>
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
            配送管理
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            设置和管理实物商品的运费模板及配送规则。
          </p>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="searchName" className="block text-sm font-medium text-slate-700 mb-1">模板名称</label>
            <input
              type="text"
              id="searchName"
              placeholder="请输入模板名称"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
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
              <option value="启用">启用</option>
              <option value="停用">停用</option>
            </select>
          </div>
          <div className="flex items-end justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchName("");
                setSearchStatus("全部状态");
              }}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              重置
            </button>
            <button
              type="button"
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
          <h3 className="text-base font-semibold leading-6 text-slate-900">运费模板列表</h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              新建运费模板
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">
                  模板名称
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 cursor-pointer flex items-center gap-1" onClick={() => handleSort('baseFreight')}>
                  基础运费
                  <SortIcon sortKey="baseFreight" />
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 cursor-pointer flex items-center gap-1" onClick={() => handleSort('freeShippingThreshold')}>
                  包邮阈值
                  <SortIcon sortKey="freeShippingThreshold" />
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  限制地区
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
              {sortedTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    暂无运费模板数据
                  </td>
                </tr>
              ) : (
                sortedTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900">
                      <div className="flex items-center">
                        <Truck className="mr-2 h-4 w-4 text-slate-400" />
                        {template.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      ¥{(template.baseFreight || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-500">
                      {template.freeShippingThreshold ? `满¥${template.freeShippingThreshold}包邮` : "-"}
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-500 max-w-xs truncate" title={template.restrictedAreas.map(r => `${r.province}${r.cities.length ? `(${r.cities.join(',')})` : ''}`).join(", ")}>
                      {template.restrictedAreas.map(r => `${r.province}${r.cities.length ? `(${r.cities.join(',')})` : ''}`).join(", ")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          template.status === "启用"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : "bg-slate-50 text-slate-600 ring-slate-500/10"
                        )}
                      >
                        {template.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      {!isReadOnly ? (
                        <>
                          <button
                            onClick={() => handleOpenModal(template)}
                            className="text-primary hover:text-primary-hover mr-4 inline-flex items-center"
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            删除
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">只读模式</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingId ? "编辑运费模板" : "新建运费模板"}
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

              <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                    模板名称 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="例如：全国包邮"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="baseFreight" className="block text-sm font-medium leading-6 text-slate-900">
                      基础运费（¥） <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="baseFreight"
                        value={formData.baseFreight}
                        onChange={(e) => setFormData({ ...formData, baseFreight: parseFloat(e.target.value) || 0 })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="freeShippingThreshold" className="block text-sm font-medium leading-6 text-slate-900">
                      包邮阈值（满¥包邮）
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="freeShippingThreshold"
                        value={formData.freeShippingThreshold}
                        onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value })}
                        className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="例如：99"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="shippingTimeLimit" className="block text-sm font-medium leading-6 text-slate-900">
                      配送时效
                    </label>
                    <div className="mt-2">
                      <select
                        id="shippingTimeLimit"
                        value={formData.shippingTimeLimit}
                        onChange={(e) => setFormData({ ...formData, shippingTimeLimit: e.target.value })}
                        className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                      >
                        <option value="24小时内发货">24小时内发货</option>
                        <option value="48小时内发货">48小时内发货</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 配送地区和限制地区选择 */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      配送地区
                    </label>
                    <RegionSelector
                      selectedRegions={formData.deliveryRegion}
                      onChange={(regions) => setFormData({ ...formData, deliveryRegion: regions })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      限制地区（不发货地区）
                    </label>
                    <RegionSelector
                      selectedRegions={formData.restrictedAreas}
                      onChange={(regions) => setFormData({ ...formData, restrictedAreas: regions })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deliveryTimeRestriction" className="block text-sm font-medium leading-6 text-slate-900">
                    限制配送时间
                  </label>
                  <div className="mt-2">
                    <select
                      id="deliveryTimeRestriction"
                      value={formData.deliveryTimeRestriction}
                      onChange={(e) => setFormData({ ...formData, deliveryTimeRestriction: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    >
                      <option value="无">无</option>
                      <option value="节假日">节假日</option>
                      <option value="指定日期">指定日期</option>
                    </select>
                  </div>
                </div>

                {formData.deliveryTimeRestriction === "指定日期" && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium leading-6 text-slate-900">
                        开始日期
                      </label>
                      <div className="mt-2">
                        <input
                          type="date"
                          id="startDate"
                          value={formData.dateRange.start}
                          onChange={(e) => setFormData({ ...formData, dateRange: { ...formData.dateRange, start: e.target.value } })}
                          className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium leading-6 text-slate-900">
                        结束日期
                      </label>
                      <div className="mt-2">
                        <input
                          type="date"
                          id="endDate"
                          value={formData.dateRange.end}
                          onChange={(e) => setFormData({ ...formData, dateRange: { ...formData.dateRange, end: e.target.value } })}
                          className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="status" className="block text-sm font-medium leading-6 text-slate-900">
                    状态 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    >
                      <option value="启用">启用</option>
                      <option value="停用">停用</option>
                    </select>
                  </div>
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

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                form="template-form"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {isSubmitting ? "保存中..." : "确认保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
