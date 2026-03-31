import React, { useState, useEffect } from "react";
import { Search, Truck, Package, Check, AlertCircle, X, Eye, Upload, Download, Edit2 } from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "../utils/cn";
import { getOrderList, shipOrder, updateOrderOpRemark, exportOrders, importOrders, Order } from "../api/order";

export function Orders() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isSubTenantAdmin = user?.accountType === "二级租户管理员";
  const userTenantLabel = user?.tenantLabel;

  const viewingChannelStr = localStorage.getItem("viewing_channel");
  const isReadOnly = !!viewingChannelStr;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await getOrderList({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        keyword: searchQuery || undefined,
        status: statusFilter === "全部"
          ? undefined
          : statusFilter === "待发货"
          ? 1
          : statusFilter === "已发货"
          ? 2
          : statusFilter === "已完成"
          ? 3
          : 4
      });
      setOrders((res.list || []).map(normalizeOrder));
      setTotal(res.total || 0);
    } catch (error: any) {
      showToast(error.message || "获取订单列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  // 发货弹窗状态
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [shippingPackageIndex, setShippingPackageIndex] = useState<number | null>(null);
  const [logisticsCompany, setLogisticsCompany] = useState("顺丰速运");
  const [trackingNo, setTrackingNo] = useState("");
  const [shippingRemarkInput, setShippingRemarkInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shipError, setShipError] = useState("");

  // 详情弹窗状态
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [activePackageTab, setActivePackageTab] = useState(0);
  const [isEditingOpRemarkInDetails, setIsEditingOpRemarkInDetails] = useState(false);
  const [editingOpRemarkValueInDetails, setEditingOpRemarkValueInDetails] = useState("");

  // 运营备注编辑状态
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [editingRemarkValue, setEditingRemarkValue] = useState("");

  // 批量发货弹窗状态
  const [isBulkShipModalOpen, setIsBulkShipModalOpen] = useState(false);
  const [bulkShipStep, setBulkShipStep] = useState<"upload" | "preview">("upload");
  const [bulkShipData, setBulkShipData] = useState<any[]>([]);
  const [bulkShipError, setBulkShipError] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // 提示状态
  const [toastMessage, setToastMessage] = useState("");

  const normalizeOrder = (order: any): Order => ({
    id: String(order.id),
    orderNo: order.orderNo || '',
    productName: order.items?.[0]?.productName || order.productName || order.giftPackageName || '-',
    quantity: order.items?.length || order.quantity || 1,
    status: order.statusDesc || String(order.status || ''),
    points: order.pointsUsed ?? order.points ?? 0,
    recipientName: order.recipientName || '',
    recipientPhone: order.recipientPhone || '',
    recipientAddress: [order.provinceName, order.cityName, order.districtName, order.detailAddress].filter(Boolean).join(' '),
    logisticsCompany: order.logisticsCompany || '',
    trackingNo: order.trackingNo || '',
    createdAt: order.createdAt || order.createTime || '',
    batchId: order.batchNo || order.batchId || '',
    ticketNo: order.ticketNo || '',
    secretCode: order.password || order.secretCode || '',
    packageName: order.giftPackageName || order.packageName || '',
    userRemark: order.userRemark || '',
    shippingRemark: order.shippingRemark || '',
    opRemark: order.opRemark || '',
    redeemerPhone: order.redeemerPhone || '',
    tenantLabel: order.tenantLabel || '',
    subPackages: Array.isArray(order.items) ? order.items : [],
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 过滤列表 (保留前端过滤以防后端不支持某些字段搜索)
  const filteredOrders = orders.filter((o) => {
    if (isSubTenantAdmin && o.tenantLabel !== userTenantLabel) {
      return false;
    }
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      (o.orderNo || "").toLowerCase().includes(query) || 
      (o.productName || "").toLowerCase().includes(query) || 
      (o.recipientPhone || "").includes(query) ||
      (o.recipientName || "").toLowerCase().includes(query) ||
      (o.recipientAddress || "").toLowerCase().includes(query) ||
      (o.batchId || "").toLowerCase().includes(query) ||
      (o.ticketNo || "").toLowerCase().includes(query) ||
      (o.secretCode || "").toLowerCase().includes(query) ||
      (o.packageName || "").toLowerCase().includes(query) ||
      (o.redeemerPhone && o.redeemerPhone.includes(query));
    const matchStatus = statusFilter === "全部" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // 打开发货弹窗
  const handleOpenShipModal = (order: Order, pkgIndex: number | null = null) => {
    setShippingOrder(order);
    setShippingPackageIndex(pkgIndex);
    if (pkgIndex !== null && order.subPackages?.[pkgIndex]?.logistics?.trackingNo) {
      setLogisticsCompany(order.subPackages[pkgIndex].logistics.company || "顺丰速运");
      setTrackingNo(order.subPackages[pkgIndex].logistics.trackingNo);
      setShippingRemarkInput(order.subPackages[pkgIndex].remark || "");
    } else if (pkgIndex === null && order.trackingNo) {
      setLogisticsCompany(order.logisticsCompany || "顺丰速运");
      setTrackingNo(order.trackingNo);
      setShippingRemarkInput(order.shippingRemark || "");
    } else {
      setLogisticsCompany("顺丰速运");
      setTrackingNo("");
      setShippingRemarkInput("");
    }
    setShipError("");
    setIsShipModalOpen(true);
  };

  // 打开详情弹窗
  const handleOpenDetailsModal = (order: Order) => {
    setDetailsOrder(order);
    setActivePackageTab(0);
    setIsEditingOpRemarkInDetails(false);
    setEditingOpRemarkValueInDetails(order.opRemark || "");
    setIsDetailsModalOpen(true);
  };

  // 保存运营备注
  const handleSaveRemark = async (orderId: string) => {
    try {
      await updateOrderOpRemark({ orderId, opRemark: editingRemarkValue });
      showToast("运营备注已更新");
      fetchOrders();
      setEditingRemarkId(null);
      if (detailsOrder && detailsOrder.id === orderId) {
        setDetailsOrder({ ...detailsOrder, opRemark: editingRemarkValue });
      }
    } catch (error: any) {
      showToast(error.message || "更新运营备注失败");
    }
  };

  // 详情弹窗保存运营备注
  const handleSaveRemarkInDetails = async () => {
    if (!detailsOrder) return;
    try {
      await updateOrderOpRemark({ orderId: detailsOrder.id, opRemark: editingOpRemarkValueInDetails });
      showToast("运营备注已更新");
      fetchOrders();
      setDetailsOrder({ ...detailsOrder, opRemark: editingOpRemarkValueInDetails });
      setIsEditingOpRemarkInDetails(false);
    } catch (error: any) {
      showToast(error.message || "更新运营备注失败");
    }
  };

  // 提交发货
  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNo.trim()) {
      setShipError("请输入物流单号");
      return;
    }
    if (!shippingOrder) return;

    setIsSubmitting(true);
    setShipError("");

    try {
      await shipOrder({
        orderId: shippingOrder.id,
        logisticsCompany,
        trackingNo,
        shippingRemark: shippingRemarkInput
      });
      
      showToast("发货成功");
      setIsShipModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      setShipError(error.message || "发货失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 批量发货 - 下载模板
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["订单号", "商品编码", "物流公司", "物流单号", "发货备注"],
      ["ORD-20260317-001", "PROD-001", "顺丰速运", "SF1234567890", "加急"],
      ["ORD-20260317-001", "PROD-002", "京东物流", "JD0987654321", "拆单发货示例"]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "批量发货模板");
    XLSX.writeFile(wb, "批量发货模板.xlsx");
  };

  // 批量发货 - 上传文件
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await importOrders(file);
      setBulkShipData(res || []); // request 已经解包 data
      setBulkShipStep("preview");
      setBulkShipError("");
    } catch (error: any) {
      setBulkShipError(error.message || "文件上传或解析失败");
    } finally {
      e.target.value = "";
    }
  };

  // 批量发货 - 确认提交
  const handleBulkShipSubmit = async () => {
    setIsBulkSubmitting(true);
    setBulkShipError("");

    try {
      // 实际项目中这里可能调用一个确认批量发货的接口
      // await confirmBulkShip(bulkShipData);
      showToast(`成功处理批量发货`);
      setIsBulkShipModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      setBulkShipError(error.message || "批量发货失败");
    } finally {
      setIsBulkSubmitting(false);
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
            订单列表
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            按状态和关键词查找订单，并对“待发货”订单完成发货录入。
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0 flex gap-3">
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => {
                setBulkShipStep("upload");
                setBulkShipData([]);
                setBulkShipError("");
                setIsBulkShipModalOpen(true);
              }}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
            >
              <Upload className="mr-1.5 h-4 w-4" />
              批量发货
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const headers = ["订单号", "商品名称", "数量", "状态", "积分", "收件人", "收件电话", "收货地址", "使用人手机", "卡密批次", "券号", "卡密", "礼包", "用户备注", "发货备注", "物流公司", "物流单号", "下单时间"];
              const csvContent = [
                headers.join(","),
                ...orders.map(o => [
                  o.orderNo,
                  o.productName,
                  o.quantity,
                  o.status,
                  o.points,
                  o.recipientName,
                  o.recipientPhone,
                  (o.recipientAddress || '').replace(/,/g, " "),
                  o.redeemerPhone || "-",
                  o.batchId,
                  o.ticketNo,
                  o.secretCode,
                  o.packageName,
                  (o.userRemark || '').replace(/,/g, " "),
                  (o.shippingRemark || '').replace(/,/g, " "),
                  o.logisticsCompany || "-",
                  o.trackingNo || "-",
                  o.createdAt
                ].join(","))
              ].join("\n");

              const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", `订单报表_${new Date().toLocaleDateString()}.csv`);
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showToast("订单报表导出成功");
            }}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            导出订单
          </button>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <label htmlFor="status" className="sr-only">状态</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
          >
            <option value="全部">全部状态</option>
            <option value="待发货">待发货</option>
            <option value="部分发货">部分发货</option>
            <option value="已拆分">已拆分</option>
            <option value="已发货">已发货</option>
            <option value="已完成">已完成</option>
            <option value="已取消">已取消</option>
          </select>
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="搜索订单号 / 商品 / 姓名 / 手机号 / 卡密 / 礼包..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {/* 列表区 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">
                  订单信息
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  卡密/礼包
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  状态
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  收件信息
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  备注
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  物流信息
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right text-sm font-semibold text-slate-900">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">加载中...</h3>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">暂无匹配订单</h3>
                    <p className="mt-1 text-sm text-slate-500">请尝试调整搜索关键词或状态筛选</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3">
                      <div className="font-medium text-slate-900">{order.orderNo}</div>
                      <div className="text-sm text-slate-500 mt-1 flex items-center">
                        <Package className="mr-1.5 h-3.5 w-3.5" />
                        {order.productName} <span className="mx-1 text-slate-300">|</span> x{order.quantity}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{order.createdAt}</div>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <div className="text-slate-900 font-medium">{order.packageName}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        批次: {order.batchId}
                      </div>
                      <div className="text-xs text-slate-400">
                        券号: {order.ticketNo}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        卡密: {order.secretCode}
                      </div>
                      {order.redeemerPhone && (
                        <div className="text-xs text-blue-600 mt-1">
                          使用人: {order.redeemerPhone}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          order.status === "已完成"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : order.status === "已发货"
                            ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                            : order.status === "部分发货"
                            ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                            : order.status === "已拆分"
                            ? "bg-purple-50 text-purple-700 ring-purple-600/20"
                            : order.status === "待发货"
                            ? "bg-orange-50 text-orange-700 ring-orange-600/20"
                            : "bg-slate-50 text-slate-600 ring-slate-500/10"
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <div className="font-medium text-slate-900">{order.recipientName}</div>
                      <div className="text-slate-500">{order.recipientPhone}</div>
                      <div className="text-xs text-slate-400 mt-1 max-w-[200px] break-words line-clamp-2" title={order.recipientAddress}>
                        {order.recipientAddress}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm max-w-[150px]">
                      {order.userRemark && (
                        <div className="text-xs text-slate-600 mb-1 truncate" title={`用户备注: ${order.userRemark}`}>
                          <span className="text-slate-400">用:</span> {order.userRemark}
                        </div>
                      )}
                      {order.shippingRemark && (
                        <div className="text-xs text-orange-600 mb-1 truncate" title={`发货备注: ${order.shippingRemark}`}>
                          <span className="text-slate-400">发:</span> {order.shippingRemark}
                        </div>
                      )}
                      
                      {/* 运营备注编辑区 */}
                      {editingRemarkId === order.id && !isReadOnly ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="text"
                            value={editingRemarkValue}
                            onChange={(e) => setEditingRemarkValue(e.target.value)}
                            className="block w-full rounded-sm border-0 py-0.5 px-1.5 text-xs text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary"
                            placeholder="运营备注..."
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRemark(order.id);
                              if (e.key === 'Escape') setEditingRemarkId(null);
                            }}
                          />
                          <button onClick={() => handleSaveRemark(order.id)} className="text-emerald-600 hover:text-emerald-700">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setEditingRemarkId(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className={cn(
                            "text-xs text-primary p-1 rounded transition-colors truncate group flex items-center border border-primary/20 bg-primary/5 mt-1",
                            !isReadOnly ? "cursor-pointer hover:bg-primary/10" : "cursor-default"
                          )} 
                          title={`运营备注: ${order.opRemark || (isReadOnly ? '无' : '点击添加')}`}
                          onClick={() => {
                            if (isReadOnly) return;
                            setEditingRemarkId(order.id);
                            setEditingRemarkValue(order.opRemark || "");
                          }}
                        >
                          {!isReadOnly && <Edit2 className="h-3 w-3 mr-1 text-primary/70" />}
                          <span className="font-medium mr-1">营:</span> 
                          <span className={order.opRemark ? "" : "text-slate-400 italic"}>{order.opRemark || (isReadOnly ? "-" : "点击添加")}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {order.subPackages && order.subPackages.length > 0 ? (
                        <div className="space-y-2">
                          {order.subPackages.map((pkg: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <div className="text-xs font-medium text-slate-700 flex justify-between">
                                <span>包裹 {idx + 1}</span>
                                {pkg.productCode && <span className="text-slate-400 font-normal">{pkg.productCode}</span>}
                              </div>
                              {pkg.logistics?.trackingNo ? (
                                <>
                                  <div className="font-medium text-slate-900 mt-0.5">{pkg.logistics.company}</div>
                                  <div className="text-slate-500 font-mono text-xs mt-0.5">{pkg.logistics.trackingNo}</div>
                                </>
                              ) : (
                                <div className="mt-1 flex items-center justify-between">
                                  <span className="text-orange-500 text-xs">未发货</span>
                                  {!isReadOnly && (
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenShipModal(order, idx); }} className="text-primary hover:underline text-xs">去发货</button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : order.trackingNo ? (
                        <div>
                          <div className="font-medium text-slate-900">{order.logisticsCompany}</div>
                          <div className="text-slate-500 font-mono text-xs mt-0.5">{order.trackingNo}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenDetailsModal(order)}
                          className="text-primary hover:text-primary-hover inline-flex items-center px-2 py-1.5 rounded-md transition-colors"
                        >
                          <Eye className="mr-1.5 h-4 w-4" />
                          详情
                        </button>
                        {!isReadOnly && (
                          <>
                            {(!order.subPackages || order.subPackages.length === 0) && (order.status === "待发货" || order.status === "部分发货" || order.status === "已拆分") ? (
                              <button
                                onClick={() => handleOpenShipModal(order)}
                                className="text-primary hover:text-primary-hover inline-flex items-center bg-orange-50 px-3 py-1.5 rounded-md transition-colors"
                              >
                                <Truck className="mr-1.5 h-4 w-4" />
                                发货
                              </button>
                            ) : (!order.subPackages || order.subPackages.length === 0) ? (
                              <span className="text-slate-300 cursor-not-allowed inline-flex items-center px-3 py-1.5">
                                <Truck className="mr-1.5 h-4 w-4" />
                                发货
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 发货弹窗 */}
      {isShipModalOpen && shippingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">
                订单发货
              </h3>
              <button
                onClick={() => setIsShipModalOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-5 overflow-y-auto flex-1">
              {/* 订单摘要 */}
              <div className="mb-6 rounded-lg bg-slate-50 p-4 border border-slate-100">
                <div className="text-sm font-medium text-slate-900 mb-2">订单摘要</div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">订单号：</span>
                    <span className="font-mono">{shippingOrder.orderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">商品：</span>
                    <span className="text-right">{shippingOrder.productName} x{shippingOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                    <span className="text-slate-500">收件信息：</span>
                    <span className="text-right">{shippingOrder.recipientName} ({shippingOrder.recipientPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">地址：</span>
                    <span className="text-right break-words max-w-[200px]">{shippingOrder.recipientAddress}</span>
                  </div>
                </div>
              </div>

              {/* 错误提示 */}
              {shipError && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {shipError}
                </div>
              )}

              <form id="ship-form" onSubmit={handleShipSubmit} className="space-y-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium leading-6 text-slate-900">
                    物流公司 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <select
                      id="company"
                      value={logisticsCompany}
                      onChange={(e) => setLogisticsCompany(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    >
                      <option value="顺丰速运">顺丰速运</option>
                      <option value="京东物流">京东物流</option>
                      <option value="中通快递">中通快递</option>
                      <option value="圆通速递">圆通速递</option>
                      <option value="申通快递">申通快递</option>
                      <option value="韵达速递">韵达速递</option>
                      <option value="极兔速递">极兔速递</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="trackingNo" className="block text-sm font-medium leading-6 text-slate-900">
                    物流单号 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="trackingNo"
                      value={trackingNo}
                      onChange={(e) => setTrackingNo(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="请输入物流单号"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shippingRemark" className="block text-sm font-medium leading-6 text-slate-900">
                    发货备注
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="shippingRemark"
                      rows={2}
                      value={shippingRemarkInput}
                      onChange={(e) => setShippingRemarkInput(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="请输入发货备注（可选）"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsShipModalOpen(false)}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                form="ship-form"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {isSubmitting ? "提交中..." : "确认发货"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 订单详情弹窗 */}
      {isDetailsModalOpen && detailsOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">
                订单详情
              </h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6">
              {/* 订单状态 */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 border border-slate-100">
                <div>
                  <div className="text-sm font-medium text-slate-500">订单状态</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ring-1 ring-inset",
                        detailsOrder.status === "已完成"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                          : detailsOrder.status === "已发货"
                          ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                          : detailsOrder.status === "部分发货"
                          ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                          : detailsOrder.status === "已拆分"
                          ? "bg-purple-50 text-purple-700 ring-purple-600/20"
                          : detailsOrder.status === "待发货"
                          ? "bg-orange-50 text-orange-700 ring-orange-600/20"
                          : "bg-slate-50 text-slate-600 ring-slate-500/10"
                      )}
                    >
                      {detailsOrder.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-500">下单时间</div>
                  <div className="mt-1 text-sm text-slate-900 font-mono">{detailsOrder.createdAt}</div>
                </div>
              </div>

              {/* 订单信息 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">基本信息</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <span className="text-slate-500">订单编号：</span>
                    <span className="text-slate-900 font-mono ml-1">{detailsOrder.orderNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">消耗积分：</span>
                    <span className="text-primary font-medium ml-1">{detailsOrder.points} 积分</span>
                  </div>
                  <div>
                    <span className="text-slate-500">卡密批次：</span>
                    <span className="text-slate-900 ml-1">{detailsOrder.batchId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">卡密券号：</span>
                    <span className="text-slate-900 ml-1">{detailsOrder.ticketNo}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">兑换卡密：</span>
                    <span className="text-slate-900 font-mono ml-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{detailsOrder.secretCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">所属礼包：</span>
                    <span className="text-slate-900 ml-1">{detailsOrder.packageName}</span>
                  </div>
                  {detailsOrder.redeemerPhone && (
                    <div className="col-span-2">
                      <span className="text-slate-500">使用人手机：</span>
                      <span className="text-blue-600 font-medium ml-1">{detailsOrder.redeemerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 备注信息 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">备注信息</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex">
                    <span className="text-slate-500 w-20">用户备注：</span>
                    <span className="text-slate-900 flex-1">{detailsOrder.userRemark || <span className="text-slate-300">无</span>}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-20">发货备注：</span>
                    <span className="text-orange-600 flex-1 font-medium">{detailsOrder.shippingRemark || <span className="text-slate-300">无</span>}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-slate-500 w-20 pt-1">运营备注：</span>
                    <div className="flex-1">
                      {isEditingOpRemarkInDetails ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingOpRemarkValueInDetails}
                            onChange={(e) => setEditingOpRemarkValueInDetails(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary"
                            placeholder="运营备注..."
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRemarkInDetails();
                              if (e.key === 'Escape') setIsEditingOpRemarkInDetails(false);
                            }}
                          />
                          <button onClick={handleSaveRemarkInDetails} className="text-emerald-600 hover:text-emerald-700 p-1">
                            <Check className="h-5 w-5" />
                          </button>
                          <button onClick={() => setIsEditingOpRemarkInDetails(false)} className="text-slate-400 hover:text-slate-600 p-1">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="group flex items-center gap-2 text-primary cursor-pointer hover:bg-primary/5 p-1.5 -m-1.5 rounded transition-colors border border-transparent hover:border-primary/20"
                          onClick={() => {
                            setEditingOpRemarkValueInDetails(detailsOrder.opRemark || "");
                            setIsEditingOpRemarkInDetails(true);
                          }}
                        >
                          <span className={detailsOrder.opRemark ? "font-medium" : "text-slate-300 italic"}>
                            {detailsOrder.opRemark || "点击添加备注"}
                          </span>
                          <Edit2 className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary/70" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 商品信息 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">商品信息</h4>
                <div className="flex items-start gap-4 rounded-lg border border-slate-200 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-100 flex-shrink-0">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{detailsOrder.productName}</div>
                    <div className="mt-1 text-sm text-slate-500">数量: {detailsOrder.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">{detailsOrder.points / detailsOrder.quantity} 积分/件</div>
                  </div>
                </div>
              </div>

              {/* 收件信息 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">收件信息</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex">
                    <span className="text-slate-500 w-20">收件人：</span>
                    <span className="text-slate-900">{detailsOrder.recipientName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-20">联系电话：</span>
                    <span className="text-slate-900">{detailsOrder.recipientPhone}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-20">收件地址：</span>
                    <span className="text-slate-900">{detailsOrder.recipientAddress}</span>
                  </div>
                </div>
              </div>

              {/* 物流信息 */}
              {detailsOrder.subPackages && detailsOrder.subPackages.length > 0 ? (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">物流信息 (拆分发货)</h4>
                  
                  {/* Tabs */}
                  <div className="flex border-b border-slate-200 mb-4 overflow-x-auto">
                    {detailsOrder.subPackages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePackageTab(idx)}
                        className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap", activePackageTab === idx ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700")}
                      >
                        包裹 {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Active Tab Content */}
                  {detailsOrder.subPackages[activePackageTab] && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="font-medium text-slate-900 mb-3 flex justify-between items-center">
                        <span>包裹 {activePackageTab + 1} 信息</span>
                        {detailsOrder.subPackages[activePackageTab].productCode && <span className="text-slate-500 text-sm font-normal">商品编码: {detailsOrder.subPackages[activePackageTab].productCode}</span>}
                      </div>
                      
                      {detailsOrder.subPackages[activePackageTab].logistics?.trackingNo ? (
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex">
                                <span className="text-slate-500 w-20">物流公司：</span>
                                <span className="text-slate-900">{detailsOrder.subPackages[activePackageTab].logistics.company}</span>
                              </div>
                              <div className="flex">
                                <span className="text-slate-500 w-20">物流单号：</span>
                                <span className="text-slate-900 font-mono">{detailsOrder.subPackages[activePackageTab].logistics.trackingNo}</span>
                              </div>
                              {detailsOrder.subPackages[activePackageTab].remark && (
                                <div className="flex">
                                  <span className="text-slate-500 w-20">发货备注：</span>
                                  <span className="text-orange-600">{detailsOrder.subPackages[activePackageTab].remark}</span>
                                </div>
                              )}
                            </div>
                            {detailsOrder.status !== "已完成" && (
                              <button 
                                onClick={() => { setIsDetailsModalOpen(false); handleOpenShipModal(detailsOrder, activePackageTab); }}
                                className="text-primary hover:underline text-xs"
                              >
                                修改物流
                              </button>
                            )}
                          </div>
                          
                          {/* 轨迹 */}
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <h5 className="text-xs font-semibold text-slate-900 mb-3">物流轨迹</h5>
                            <div className="relative border-l border-slate-200 ml-2 space-y-4 pb-2">
                              {[
                                { time: "2026-03-19 10:00:00", desc: "已签收，签收人：本人" },
                                { time: "2026-03-19 08:30:00", desc: "派件中，派件员：张三" },
                                { time: "2026-03-18 18:00:00", desc: "快件已到达【北京市朝阳区集散中心】" },
                                { time: "2026-03-18 10:00:00", desc: "包裹已揽收" }
                              ].map((trace, i) => (
                                <div key={i} className="relative pl-4">
                                  <div className={cn("absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white", i === 0 ? "bg-primary" : "bg-slate-300")} />
                                  <div className={cn("text-xs", i === 0 ? "text-primary font-medium" : "text-slate-500")}>{trace.desc}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{trace.time}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <Truck className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500 mb-4">该包裹尚未发货</p>
                          <button
                            onClick={() => { setIsDetailsModalOpen(false); handleOpenShipModal(detailsOrder, activePackageTab); }}
                            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
                          >
                            去发货
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : detailsOrder.trackingNo ? (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">物流信息</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="text-slate-500 w-20">物流公司：</span>
                          <span className="text-slate-900">{detailsOrder.logisticsCompany}</span>
                        </div>
                        <div className="flex">
                          <span className="text-slate-500 w-20">物流单号：</span>
                          <span className="text-slate-900 font-mono">{detailsOrder.trackingNo}</span>
                        </div>
                      </div>
                      {detailsOrder.status !== "已完成" && (
                        <button 
                          onClick={() => { setIsDetailsModalOpen(false); handleOpenShipModal(detailsOrder); }}
                          className="text-primary hover:underline text-xs"
                        >
                          修改物流
                        </button>
                      )}
                    </div>
                    {/* 轨迹 */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-semibold text-slate-900 mb-3">物流轨迹</h5>
                      <div className="relative border-l border-slate-200 ml-2 space-y-4 pb-2">
                        {[
                          { time: "2026-03-19 10:00:00", desc: "已签收，签收人：本人" },
                          { time: "2026-03-19 08:30:00", desc: "派件中，派件员：张三" },
                          { time: "2026-03-18 18:00:00", desc: "快件已到达【北京市朝阳区集散中心】" },
                          { time: "2026-03-18 10:00:00", desc: "包裹已揽收" }
                        ].map((trace, i) => (
                          <div key={i} className="relative pl-4">
                            <div className={cn("absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white", i === 0 ? "bg-primary" : "bg-slate-300")} />
                            <div className={cn("text-xs", i === 0 ? "text-primary font-medium" : "text-slate-500")}>{trace.desc}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{trace.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                关闭
              </button>
              {(detailsOrder.status === "待发货" || detailsOrder.status === "部分发货" || detailsOrder.status === "已拆分") && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleOpenShipModal(detailsOrder);
                  }}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Truck className="mr-1.5 h-4 w-4" />
                  去发货
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 批量发货弹窗 */}
      {isBulkShipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Upload className="mr-2 h-5 w-5 text-primary" />
                批量发货
              </h3>
              <button
                onClick={() => setIsBulkShipModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {bulkShipError && (
                <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">上传失败</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{bulkShipError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bulkShipStep === "upload" ? (
                <div className="space-y-6">
                  <div className="rounded-lg border-2 border-dashed border-slate-300 p-12 text-center hover:border-primary/50 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-hover"
                      >
                        <span>点击上传文件</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx, .xls" onChange={handleFileUpload} />
                      </label>
                      <p className="pl-1">或拖拽文件到此处</p>
                    </div>
                    <p className="text-xs leading-5 text-slate-500 mt-2">支持 .xlsx, .xls 格式</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                    <h4 className="font-medium text-slate-900 mb-2">发货规则说明：</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>请先 <button onClick={handleDownloadTemplate} className="text-primary hover:underline font-medium">下载发货模板</button>，按模板格式填写数据。</li>
                      <li><strong>拆包裹逻辑：</strong>如订单需拆分多包裹发货，请复制订单整行信息并在下方插入记录，同时确保填写不同的（物流公司、物流单号）。</li>
                      <li>当同一个订单号对应两个不同物流单号时，系统将自动识别为拆分2个包裹发货，以此类推。</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-900">数据预览 (共 {bulkShipData.length} 条记录)</h4>
                    <button onClick={() => setBulkShipStep("upload")} className="text-sm text-primary hover:underline">重新上传</button>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">订单号</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">商品编码</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">物流公司</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">物流单号</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">发货备注</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {bulkShipData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 font-mono">{row["订单号"]}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{row["商品编码"]}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{row["物流公司"]}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 font-mono">{row["物流单号"]}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{row["发货备注"]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsBulkShipModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              {bulkShipStep === "preview" && (
                <button
                  type="button"
                  onClick={handleBulkShipSubmit}
                  disabled={isBulkSubmitting}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBulkSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      处理中...
                    </>
                  ) : (
                    <>
                      <Check className="mr-1.5 h-4 w-4" />
                      确认发货
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
