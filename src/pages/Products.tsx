import React, { useState, useRef, useEffect } from "react";
import { Plus, Search, Edit, ArrowUpCircle, ArrowDownCircle, Check, AlertCircle, X, Image as ImageIcon, Package, Upload, Wand2, PlusCircle, Trash2, Download, Smartphone } from "lucide-react";
import { cn } from "../utils/cn";
import {
  getProductList,
  addProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  batchUpdateProductStatus,
  batchDeleteProducts
} from "../api/product";
import { getCategoryTree } from "../api/category";

// 模拟分类数据
const categoryTree = [
  {
    name: "数码家电",
    children: [
      {
        name: "手机通讯",
        children: [
          { name: "智能手机" },
          { name: "功能手机" },
          { name: "手机配件" },
        ]
      },
      {
        name: "电脑办公",
        children: [
          { name: "笔记本电脑" },
          { name: "台式机" },
        ]
      }
    ]
  },
  {
    name: "食品生鲜",
    children: [
      {
        name: "新鲜水果",
        children: [
          { name: "苹果" },
          { name: "柑橘" },
        ]
      },
      {
        name: "海鲜水产",
        children: [
          { name: "大闸蟹" },
          { name: "鱼类" },
        ]
      }
    ]
  }
];

// 展平分类用于筛选
const flatCategories: string[] = [];
const flatten = (nodes: any[], path = "") => {
  nodes.forEach(node => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    if (node.children) {
      flatten(node.children, currentPath);
    } else {
      flatCategories.push(currentPath);
    }
  });
};
flatten(categoryTree);

export function Products() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isSubTenantAdmin = user?.accountType === "二级租户管理员";
  const userTenantLabel = user?.tenantLabel;

  const viewingChannelStr = localStorage.getItem("viewing_channel");
  const isReadOnly = !!viewingChannelStr;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; label: string; name: string }[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [tagFilter, setTagFilter] = useState("");
  const [specTypeFilter, setSpecTypeFilter] = useState("全部");
  const [pointsRange, setPointsRange] = useState({ min: "", max: "" });
  const [stockRange, setStockRange] = useState({ min: "", max: "" });
  const [stockSort, setStockSort] = useState<"default" | "asc" | "desc">("default");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const normalizeProduct = (p: any) => ({
    ...p,
    id: String(p.id),
    categoryId: p.categoryId ? String(p.categoryId) : "",
    category: p.categoryName || p.category || "未分类",
    desc: p.descShort || p.description || "",
    description: p.description || "",
    sellingPoints: p.sellingPoints || "",
    promiseTime: p.promiseTime || "",
    tags: p.tags || "",
    parameters: Array.isArray(p.parameterList) ? p.parameterList : Array.isArray(p.parameters) ? p.parameters : [],
    specs: Array.isArray(p.specs)
      ? p.specs.map((spec: any) => ({
          name: spec.specName || spec.name || '',
          values: Array.isArray(spec.values)
            ? spec.values
            : typeof spec.specValues === 'string'
            ? (() => {
                try {
                  const parsed = JSON.parse(spec.specValues);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              })()
            : [],
        }))
      : [],
    skus: Array.isArray(p.skus) && p.skus.length > 0 ? p.skus.map((sku: any, index: number, list: any[]) => ({
      ...sku,
      id: sku.id ? String(sku.id) : undefined,
      skuId: sku.skuId || sku.skuCode || String(sku.id || ''),
      skuName: sku.skuName || sku.skuCode || "默认",
      specValues: Array.isArray(sku.specValues)
        ? sku.specValues
        : typeof sku.specValues === 'string'
        ? (() => {
            try {
              return JSON.parse(sku.specValues);
            } catch {
              return [];
            }
          })()
        : [],
      points: sku.points && sku.points > 0 ? sku.points : (list.length === 1 ? (p.pointsRequired ?? 0) : 0),
      stock: sku.stock && sku.stock > 0 ? sku.stock : (list.length === 1 ? (p.stock ?? 0) : 0),
    })) : [{
      skuId: p.spuId || String(p.id || ''),
      skuName: "默认",
      specValues: [],
      points: p.pointsRequired ?? 0,
      stock: p.stock ?? 0,
    }],
    status: p.statusDesc || (p.status === 1 ? "在售" : "已下架"),
  });

  const flattenCategoryOptions = (nodes: any[], path = ""): { id: string; label: string; name: string }[] => {
    if (!Array.isArray(nodes)) return [];

    return nodes.flatMap((node: any) => {
      const currentLabel = path ? `${path} / ${node.name}` : node.name;
      if (Array.isArray(node.children) && node.children.length > 0) {
        return flattenCategoryOptions(node.children, currentLabel);
      }

      return [{ id: String(node.id), label: currentLabel, name: node.name }];
    });
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategoryTree();
      setCategoryOptions(flattenCategoryOptions(res || []));
    } catch (error) {
      console.error("获取商品分类失败:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProductList({
        pageNum: 1,
        pageSize: 1000,
        keyword: searchQuery || undefined,
        status: statusFilter === "全部" ? undefined : (statusFilter === "在售" ? 1 : 0),
        categoryId: categoryFilter === "全部" ? undefined : categoryFilter,
        stockSort: stockSort === 'default' ? undefined : stockSort,
      });
      const mappedList = (res.list || []).map(normalizeProduct);
      setProducts(mappedList);
    } catch (error) {
      console.error("获取商品列表失败:", error);
      showToast("获取商品列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, categoryFilter, stockSort]); // Re-fetch when filters change

  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // 预览弹窗状态
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // 表单状态
  const [formData, setFormData] = useState({
    spuId: "",
    name: "",
    barcode: "",
    categoryId: "",
    desc: "",
    sellingPoints: "",
    promiseTime: "",
    specs: [] as { name: string; values: string[] }[],
    skus: [] as { skuId: string; skuName: string; specValues: string[]; points: number; stock: number }[],
    parameters: [] as { key: string; value: string }[],
    description: "",
    tags: ""
  });

  useEffect(() => {
    if (!isModalOpen || editingProduct || formData.categoryId || categoryOptions.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      categoryId: categoryOptions[0].id,
    }));
  }, [isModalOpen, editingProduct, formData.categoryId, categoryOptions]);

  // 监听规格变化，自动生成 SKU 列表
  useEffect(() => {
    if (!isModalOpen) return;

    const generateSkus = () => {
      const validSpecs = formData.specs.filter(s => s.name && s.values.some(v => v));
      
      if (validSpecs.length === 0) {
        // 单规格
        // 如果是单规格，sku名称基于spu名称初始化
        setFormData(prev => {
          const baseId = prev.spuId ? prev.spuId.replace('SPU', '') : Math.floor(100000 + Math.random() * 900000).toString();
          
          // 只有当 skuName 为空、为"默认"或者与旧名称一致时才自动同步
          const currentSkuName = prev.skus[0]?.skuName;
          const shouldUpdateName = !currentSkuName || currentSkuName === "默认" || currentSkuName === prev.name;

          return {
            ...prev,
            skus: [{ 
              skuId: prev.skus[0]?.skuId || `SKU${baseId}`, 
              skuName: prev.name || "默认",
              specValues: [], 
              points: prev.skus[0]?.points || 0, 
              stock: prev.skus[0]?.stock || 0,
              barcode: prev.skus[0]?.barcode || prev.barcode || ""
            }]
          };
        });
        return;
      }

      // 多规格：计算笛卡尔积
      const cartesianProduct = (arr: any[][]): any[][] => {
        return arr.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]]);
      };

      const specValuesArrays = validSpecs.map(s => s.values.filter(v => v));
      // 如果有空的规格值数组，说明还没填完，不生成
      if (specValuesArrays.some(arr => arr.length === 0)) return;

      const combinations = cartesianProduct(specValuesArrays);
      
      setFormData(prev => {
        const newSkus = combinations.map(combo => {
          // 尝试在旧的 skus 中寻找匹配的组合以保留积分和库存
          const existingSku = prev.skus.find(sku => 
            sku.specValues.length === combo.length && 
            sku.specValues.every((val, idx) => val === combo[idx])
          );
          
          return {
            skuId: existingSku?.skuId || `SKU${Math.floor(100000 + Math.random() * 900000)}`,
            skuName: existingSku?.skuName || combo.join("-"),
            specValues: combo,
            points: existingSku?.points || 0,
            stock: existingSku?.stock || 0,
            barcode: existingSku?.barcode || ""
          };
        });
        return { ...prev, skus: newSkus };
      });
    };

    generateSkus();
  }, [formData.specs, formData.name, isModalOpen]);

  // AI 生成状态
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 导入状态
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 确认弹窗状态 (通用)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const closeConfirmDialog = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

  // 提示状态
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 过滤和排序列表
  const filteredProducts = products.filter((p) => {
    if (isSubTenantAdmin && p.tenantLabel !== userTenantLabel) {
      return false;
    }
    const matchTag = !tagFilter || p.tags?.includes(tagFilter);
    const matchSpecType = specTypeFilter === "全部" || 
                         (specTypeFilter === "多规格" ? p.specs.length > 0 : p.specs.length === 0);
    
    const totalPoints = p.skus.map(s => s.points);
    const matchPoints = (!pointsRange.min || Math.max(...totalPoints) >= Number(pointsRange.min)) &&
                        (!pointsRange.max || Math.min(...totalPoints) <= Number(pointsRange.max));
    
    const totalStock = p.skus.reduce((sum, sku) => sum + sku.stock, 0);
    const matchStock = (!stockRange.min || totalStock >= Number(stockRange.min)) &&
                       (!stockRange.max || totalStock <= Number(stockRange.max));
    
    return matchTag && matchSpecType && matchPoints && matchStock;
  }).sort((a, b) => {
    if (stockSort === "default") return 0;
    const stockA = a.skus.reduce((sum, sku) => sum + sku.stock, 0);
    const stockB = b.skus.reduce((sum, sku) => sum + sku.stock, 0);
    return stockSort === "asc" ? stockA - stockB : stockB - stockA;
  });

  // 打开新建/编辑弹窗
  const handleOpenModal = (product: any = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData({
        spuId: product.spuId,
        name: product.name,
        barcode: product.barcode || "",
        categoryId: product.categoryId || "",
        desc: product.desc,
        sellingPoints: product.sellingPoints || "",
        promiseTime: product.promiseTime || "",
        specs: product.specs ? JSON.parse(JSON.stringify(product.specs)) : [],
        skus: product.skus ? JSON.parse(JSON.stringify(product.skus)).map((s: any) => ({ ...s, skuName: s.skuName || "默认" })) : [],
        parameters: product.parameters ? JSON.parse(JSON.stringify(product.parameters)) : [],
        description: product.description || "",
        tags: product.tags || ""
      });
    } else {
      const baseId = Math.floor(100000 + Math.random() * 900000);
      setFormData({
        spuId: `SPU${baseId}`,
        name: "",
        barcode: "",
        categoryId: categoryOptions[0]?.id || "",
        desc: "",
        sellingPoints: "",
        promiseTime: "",
        specs: [],
        skus: [{ skuId: `SKU${baseId}`, skuName: "默认", specValues: [], points: 0, stock: 0 }],
        parameters: [],
        description: "",
        tags: ""
      });
    }
    setIsModalOpen(true);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const normalizedSpecs = formData.specs
        .filter(spec => spec.name.trim() && spec.values.some(value => value.trim()))
        .map((spec, index) => ({
          specName: spec.name.trim(),
          specValues: JSON.stringify(spec.values.filter(value => value.trim())),
          sort: index,
        }));

      const normalizedSkus = formData.skus.map((sku, index) => ({
        id: editingProduct ? (sku.id ? String(sku.id) : undefined) : undefined,
        skuCode: sku.skuId,
        specValues: JSON.stringify(sku.specValues || []),
        points: Number(sku.points) || 0,
        stock: Number(sku.stock) || 0,
        sort: index,
      }));

      const payload = {
        id: editingProduct?.id,
        spuId: formData.spuId,
        name: formData.name,
        categoryId: formData.categoryId || undefined,
        imageUrl: editingProduct?.imageUrl || "https://via.placeholder.com/400x400?text=Product",
        images: JSON.stringify(editingProduct?.images ? editingProduct.images : []),
        description: formData.description,
        pointsRequired: normalizedSkus.length > 0 ? Math.min(...normalizedSkus.map((sku) => sku.points)) : 0,
        stock: normalizedSkus.reduce((sum, sku) => sum + sku.stock, 0),
        descShort: formData.desc,
        sellingPoints: formData.sellingPoints,
        promiseTime: formData.promiseTime || undefined,
        tags: formData.tags,
        parameters: formData.parameters.filter(param => param.key.trim() && param.value.trim()),
        specs: normalizedSpecs,
        status: 1, // 默认在售
        tenantLabel: isSubTenantAdmin ? userTenantLabel : "默认二级租户"
      };
      
      if (editingProduct) {
        await updateProduct({ ...payload, id: editingProduct.id });
        showToast("商品更新成功");
      } else {
        await addProduct(payload);
        showToast("商品创建成功");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Save failed:", error);
      showToast(editingProduct ? "商品更新失败" : "商品创建失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 批量上架
  const handleBatchPublish = async () => {
    if (selectedIds.length === 0) return;
    try {
      await batchUpdateProductStatus({ ids: selectedIds, status: 1 });
      showToast(`成功上架 ${selectedIds.length} 个商品`);
      setSelectedIds([]);
      fetchProducts();
    } catch (error) {
      showToast("批量上架失败");
    }
  };

  // 批量下架
  const handleBatchTakeDown = async () => {
    if (selectedIds.length === 0) return;
    try {
      await batchUpdateProductStatus({ ids: selectedIds, status: 0 });
      showToast(`成功下架 ${selectedIds.length} 个商品`);
      setSelectedIds([]);
      fetchProducts();
    } catch (error) {
      showToast("批量下架失败");
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: '确认批量删除？',
      message: `您即将删除选中的 ${selectedIds.length} 个商品。删除后无法恢复。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await batchDeleteProducts(selectedIds);
          showToast(`成功删除 ${selectedIds.length} 个商品`);
          setSelectedIds([]);
          fetchProducts();
        } catch (error) {
          showToast("批量删除失败");
        } finally {
          closeConfirmDialog();
        }
      }
    });
  };

  // 导出 Excel 模板
  const handleExportTemplate = () => {
    const headers = ["SPU ID", "SKU ID", "商品名称", "商品分类", "标签(逗号分隔)", "一句话描述", "核心卖点", "承诺不下架时间", "规格1", "规格2", "规格3", "所需积分", "库存数量", "商品主图URL"];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + 
      "SPU100001,SKU100001,测试商品,食品生鲜,热门/新品,测试描述,卖点1\\n卖点2,2026-12-31,红色,XL,,100,50,https://example.com/image.jpg";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "商品导入模板.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 导出商品数据
  const handleExportData = () => {
    const headers = ["SPU ID", "SKU ID", "商品名称", "商品分类", "状态", "标签", "所需积分", "库存数量"];
    let csvRows = [headers.join(",")];
    
    products.forEach(p => {
      p.skus.forEach(sku => {
        csvRows.push([
          p.spuId,
          sku.skuId,
          p.name,
          p.category,
          p.status,
          p.tags || "",
          sku.points,
          sku.stock
        ].join(","));
      });
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "商品导出数据.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 导入商品弹窗状态
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // 下架确认
  const handleTakeDownClick = (product: any) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认下架该商品？',
      message: `您即将下架商品 ${product.name}。下架后，用户将无法在商城中兑换此商品。`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await updateProductStatus({ id: product.id, status: 0 });
          showToast("商品已下架");
          fetchProducts();
        } catch (error) {
          showToast("下架失败");
        } finally {
          closeConfirmDialog();
        }
      }
    });
  };

  // 删除确认
  const handleDeleteClick = (product: any) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除该商品？',
      message: `您即将删除商品 ${product.name}。删除后无法恢复。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteProduct({ id: product.id });
          showToast("商品已删除");
          setSelectedIds(selectedIds.filter(id => id !== product.id));
          fetchProducts();
        } catch (error) {
          showToast("删除失败");
        } finally {
          closeConfirmDialog();
        }
      }
    });
  };

  // AI 一键完善
  const handleAIGenerate = () => {
    if (!formData.name) {
      showToast("请先输入商品名称");
      return;
    }
    setIsGeneratingAI(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        desc: `${prev.name} 精选品质，值得信赖`,
        sellingPoints: "✨ 原产地直供\n✨ 严格品控，品质保证\n✨ 极速发货，售后无忧",
        description: `<p><strong>【${prev.name}】</strong></p><p>为您带来极致体验。我们深入原产地，经过层层筛选，只为将最好的产品呈现给您。</p><ul><li>特点一：精选材质</li><li>特点二：匠心工艺</li><li>特点三：完美包装</li></ul>`
      }));
      setIsGeneratingAI(false);
      showToast("AI 内容生成成功");
    }, 1500);
  };

  // 导入商品
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setIsImportModalOpen(false);
      showToast(`成功导入 5 条商品数据，状态为“草稿”`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
  };

  // 规格操作
  const addSpec = () => {
    setFormData(prev => ({ ...prev, specs: [...prev.specs, { name: "", values: [""] }] }));
  };
  const updateSpecName = (index: number, name: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[index].name = name;
    setFormData(prev => ({ ...prev, specs: newSpecs }));
  };
  const updateSpecValue = (specIndex: number, valueIndex: number, value: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[specIndex].values[valueIndex] = value;
    setFormData(prev => ({ ...prev, specs: newSpecs }));
  };
  const addSpecValue = (specIndex: number) => {
    const newSpecs = [...formData.specs];
    newSpecs[specIndex].values.push("");
    setFormData(prev => ({ ...prev, specs: newSpecs }));
  };
  const removeSpec = (index: number) => {
    setFormData(prev => ({ ...prev, specs: prev.specs.filter((_, i) => i !== index) }));
  };

  // 更新 SKU 属性
  const updateSku = (index: number, field: 'points' | 'stock' | 'skuName' | 'barcode', value: number | string) => {
    const newSkus = [...formData.skus];
    (newSkus[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, skus: newSkus }));
  };

  // 全选/取消全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  const addParameter = () => {
    setFormData(prev => ({ ...prev, parameters: [...prev.parameters, { key: "", value: "" }] }));
  };
  const updateParameter = (index: number, field: 'key' | 'value', val: string) => {
    const newParams = [...formData.parameters];
    newParams[index][field] = val;
    setFormData(prev => ({ ...prev, parameters: newParams }));
  };
  const removeParameter = (index: number) => {
    setFormData(prev => ({ ...prev, parameters: prev.parameters.filter((_, i) => i !== index) }));
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
            商品管理
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            默认工作入口。检索商品、创建商品、执行上架或下架，管理积分成本和库存。
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0 flex gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <Download className="mr-2 h-4 w-4" />
            导出
          </button>
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                批量导入
              </button>
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                新建商品
              </button>
            </>
          )}
        </div>
      </div>

      {/* 筛选区 */}
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm">
            <option value="全部">全部状态</option>
            <option value="在售">在售</option>
            <option value="已下架">已下架</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm">
            <option value="全部">全部分类</option>
            {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
          <input type="text" placeholder="标签" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="w-32 rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm" />
          <select value={specTypeFilter} onChange={(e) => setSpecTypeFilter(e.target.value)} className="rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm">
            <option value="全部">全部规格类型</option>
            <option value="单规格">单规格</option>
            <option value="多规格">多规格</option>
          </select>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="积分最小" value={pointsRange.min} onChange={(e) => setPointsRange({...pointsRange, min: e.target.value})} className="w-24 rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 sm:text-sm" />
            <span>-</span>
            <input type="number" placeholder="积分最大" value={pointsRange.max} onChange={(e) => setPointsRange({...pointsRange, max: e.target.value})} className="w-24 rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 sm:text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="库存最小" value={stockRange.min} onChange={(e) => setStockRange({...stockRange, min: e.target.value})} className="w-24 rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 sm:text-sm" />
            <span>-</span>
            <input type="number" placeholder="库存最大" value={stockRange.max} onChange={(e) => setStockRange({...stockRange, max: e.target.value})} className="w-24 rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 sm:text-sm" />
          </div>
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="搜索商品名称..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchProducts()} className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-primary sm:text-sm" />
            </div>
            <button onClick={fetchProducts} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-200">
              搜索
            </button>
          </div>
        </div>
        
        {selectedIds.length > 0 && !isReadOnly && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-500">已选择 {selectedIds.length} 项</span>
            <button onClick={handleBatchPublish} className="inline-flex items-center rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100">
              <ArrowUpCircle className="mr-2 h-4 w-4" />批量上架
            </button>
            <button onClick={handleBatchTakeDown} className="inline-flex items-center rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-600/20 hover:bg-slate-100">
              <ArrowDownCircle className="mr-2 h-4 w-4" />批量下架
            </button>
            <button onClick={handleBatchDelete} className="inline-flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-inset ring-red-600/20 hover:bg-red-100">
              <Trash2 className="mr-2 h-4 w-4" />批量删除
            </button>
          </div>
        )}
      </div>

      {/* 列表区 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="relative px-6 py-3.5 w-12">
                  <input
                    type="checkbox"
                    className="absolute left-6 top-1/2 -mt-2 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="py-3.5 pl-2 pr-3 text-left text-sm font-semibold text-slate-900">
                  商品名称
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  条码
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  分类
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  规格类型
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  状态
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  所需积分
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors" onClick={() => {
                    setStockSort(prev => prev === "default" ? "asc" : prev === "asc" ? "desc" : "default");
                  }}>
                    总库存
                    <div className="flex flex-col -space-y-1">
                      <ArrowUpCircle className={cn("h-3 w-3", stockSort === "asc" ? "text-primary" : "text-slate-300")} />
                      <ArrowDownCircle className={cn("h-3 w-3", stockSort === "desc" ? "text-primary" : "text-slate-300")} />
                    </div>
                  </div>
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right text-sm font-semibold text-slate-900">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">暂无商品</h3>
                    <p className="mt-1 text-sm text-slate-500">请先新建商品或调整筛选条件</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="relative px-6 py-4">
                      <input
                        type="checkbox"
                        className="absolute left-6 top-1/2 -mt-2 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                      />
                    </td>
                    <td className="whitespace-nowrap py-4 pl-2 pr-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-slate-900">{product.name}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <div className="text-xs text-slate-400 font-mono">{product.spuId}</div>
                            {product.tags && product.tags.split(',').map((tag: string, i: number) => (
                              <span key={i} className="inline-flex items-center rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-600">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">
                      {product.barcode || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {product.category}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {product.specs.length > 0 ? "多规格" : "单规格"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          product.status === "在售"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : product.status === "已下架"
                            ? "bg-slate-50 text-slate-600 ring-slate-500/10"
                            : "bg-red-50 text-red-700 ring-red-600/10"
                        )}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900 font-medium">
                      {product.skus.length === 1 ? product.skus[0].points : `${Math.min(...product.skus.map(s => s.points))} ~ ${Math.max(...product.skus.map(s => s.points))}`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {product.skus.reduce((sum, sku) => sum + sku.stock, 0)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setPreviewUrl(product.previewUrl || "https://aistudio.google.com/apps/45355b28-df99-4fcd-9b9a-94a9b27b2ea7?showAssistant=true&showPreview=true&fullscreenApplet=true");
                          setIsPreviewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                      >
                        <Smartphone className="mr-1 h-4 w-4" />
                        预览
                      </button>
                      {!isReadOnly && (
                        <>
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="text-primary hover:text-primary-hover mr-4 inline-flex items-center"
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            编辑
                          </button>
                          {product.status === "在售" ? (
                            <button
                              onClick={() => handleTakeDownClick(product)}
                              className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                            >
                              <ArrowDownCircle className="mr-1 h-4 w-4" />
                              下架
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  await updateProductStatus({ id: product.id, status: 1 });
                                  showToast("商品已上架");
                                  fetchProducts();
                                } catch (error) {
                                  showToast("上架失败");
                                }
                              }}
                              className="text-emerald-600 hover:text-emerald-900 inline-flex items-center"
                            >
                              <ArrowUpCircle className="mr-1 h-4 w-4" />
                              上架
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center ml-4"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            删除
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新建/编辑商品弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                {editingProduct ? "编辑商品" : "新建商品"}
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI}
                  className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  <Wand2 className={cn("mr-1 h-3 w-3", isGeneratingAI && "animate-spin")} />
                  {isGeneratingAI ? "AI 生成中..." : "AI 一键完善"}
                </button>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* 基本信息 */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">基本信息</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium leading-6 text-slate-900">
                          商品名称 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            disabled
                            value={formData.spuId}
                            className="block w-32 rounded-md border-0 py-1.5 text-slate-500 bg-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 sm:text-sm sm:leading-6"
                            title="SPU ID (自动生成)"
                          />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="block flex-1 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            placeholder="例如：阳澄湖大闸蟹礼盒"
                          />
                        </div>
                      </div>
                      <div className="w-1/3">
                        <label className="block text-sm font-medium leading-6 text-slate-900">
                          商品条码 (69码)
                        </label>
                        <input
                          type="text"
                          value={formData.barcode}
                          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                          placeholder="例如：6901234567890"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium leading-6 text-slate-900">商品分类</label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                        >
                          <option value="">请选择分类</option>
                          {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                        </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium leading-6 text-slate-900">承诺不下架时间</label>
                      <input
                        type="date"
                        value={formData.promiseTime}
                        onChange={(e) => setFormData({ ...formData, promiseTime: e.target.value })}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium leading-6 text-slate-900">商品标签 (逗号分隔)</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="例如：热门, 新品, 促销"
                      />
                    </div>
                  </div>
                </div>

                {/* 规格与库存 */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">规格与库存</h4>
                  
                  {/* 规格 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium leading-6 text-slate-900">商品规格 (多规格)</label>
                      <button type="button" onClick={addSpec} className="text-sm text-primary hover:text-primary-hover flex items-center">
                        <PlusCircle className="h-4 w-4 mr-1" /> 添加规格项
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.specs.map((spec, sIdx) => (
                        <div key={sIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 mb-3">
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => updateSpecName(sIdx, e.target.value)}
                              placeholder="规格名 (如: 颜色)"
                              className="block w-48 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            />
                            <button type="button" onClick={() => removeSpec(sIdx)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {spec.values.map((val, vIdx) => (
                              <div key={vIdx} className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={val}
                                  onChange={(e) => updateSpecValue(sIdx, vIdx, e.target.value)}
                                  placeholder="规格值"
                                  className="block w-32 rounded-md border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                />
                              </div>
                            ))}
                            <button type="button" onClick={() => addSpecValue(sIdx)} className="text-xs text-slate-500 hover:text-primary px-2 py-1 border border-dashed border-slate-300 rounded">
                              + 添加值
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SKU 表格 */}
                  {formData.skus.length > 0 && (
                    <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            {formData.specs.filter(s => s.name && s.values.some(v => v)).map((spec, i) => (
                              <th key={i} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {spec.name}
                              </th>
                            ))}
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU 名称</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">条码 (69码)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">所需积分 *</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">库存数量 *</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {formData.skus.map((sku, idx) => (
                            <tr key={idx}>
                              {sku.specValues.map((val, vIdx) => (
                                <td key={vIdx} className="px-4 py-3 text-sm text-slate-900">{val}</td>
                              ))}
                              <td className="px-4 py-3 text-sm text-slate-500 font-mono">{sku.skuId}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={sku.skuName}
                                  onChange={(e) => updateSku(idx, 'skuName', e.target.value)}
                                  placeholder="SKU名称"
                                  className="block w-32 rounded-md border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={sku.barcode || ""}
                                  onChange={(e) => updateSku(idx, 'barcode', e.target.value)}
                                  placeholder="69码"
                                  className="block w-32 rounded-md border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  required min="0"
                                  value={sku.points}
                                  onChange={(e) => updateSku(idx, 'points', parseInt(e.target.value) || 0)}
                                  className="block w-24 rounded-md border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  required min="0"
                                  value={sku.stock}
                                  onChange={(e) => updateSku(idx, 'stock', parseInt(e.target.value) || 0)}
                                  className="block w-24 rounded-md border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 参数 */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium leading-6 text-slate-900">商品参数</label>
                      <button type="button" onClick={addParameter} className="text-sm text-primary hover:text-primary-hover flex items-center">
                        <PlusCircle className="h-4 w-4 mr-1" /> 添加参数
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.parameters.map((param, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={param.key}
                            onChange={(e) => updateParameter(pIdx, 'key', e.target.value)}
                            placeholder="参数名 (如: 品牌)"
                            className="block w-1/3 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                          />
                          <input
                            type="text"
                            value={param.value}
                            onChange={(e) => updateParameter(pIdx, 'value', e.target.value)}
                            placeholder="参数值"
                            className="block flex-1 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                          />
                          <button type="button" onClick={() => removeParameter(pIdx)} className="text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 图文详情 */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">图文详情</h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">商品主图</label>
                      <div className="flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-8 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                          <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                            <span className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-hover">
                              点击上传
                            </span>
                            <p className="pl-1">或拖拽图片至此</p>
                          </div>
                          <p className="text-xs leading-5 text-slate-500">PNG, JPG, GIF up to 2MB</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium leading-6 text-slate-900">一句话描述</label>
                      <input
                        type="text"
                        value={formData.desc}
                        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="简短描述，如：8只装 鲜活现发"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium leading-6 text-slate-900">核心卖点</label>
                      <textarea
                        rows={3}
                        value={formData.sellingPoints}
                        onChange={(e) => setFormData({ ...formData, sellingPoints: e.target.value })}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="分行输入核心卖点..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">图文详情 (富文本)</label>
                      {/* 模拟富文本编辑器 */}
                      <div className="border border-slate-300 rounded-md overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-300 p-2 flex gap-2">
                          <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-700 font-bold">B</button>
                          <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-700 italic">I</button>
                          <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-700 underline">U</button>
                          <div className="w-px h-6 bg-slate-300 mx-1"></div>
                          <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-700"><ImageIcon className="h-4 w-4" /></button>
                        </div>
                        <textarea
                          rows={6}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="block w-full border-0 py-2 px-3 text-slate-900 focus:ring-0 sm:text-sm sm:leading-6 resize-y"
                          placeholder="输入详细的图文介绍..."
                        />
                      </div>
                    </div>
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
                type="submit"
                form="product-form"
                disabled={isSaving}
                className="inline-flex items-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {isSaving ? "保存中..." : "保存商品"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量导入弹窗 */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">批量导入商品</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              {/* 准备导入数据 */}
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded text-orange-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">准备导入数据</h4>
                    <p className="text-sm text-slate-500 mt-0.5">请使用标准模板以确保数据校验成功</p>
                  </div>
                </div>
                <button onClick={handleExportTemplate} className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center">
                  下载Excel导入模板 <Download className="ml-1 h-4 w-4" />
                </button>
              </div>

              {/* 上传区域 */}
              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
                  <Upload className="h-8 w-8" />
                </div>
                <h4 className="text-base font-medium text-slate-900 mb-2">点击或拖拽文件至此处上传</h4>
                <p className="text-sm text-slate-500 mb-6">支持 .xls, .xlsx, .csv 格式文件，单文件不超过 10MB</p>
                <button className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
                  选择文件
                </button>
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImport}
                />
              </div>

              {/* 导入规则说明 */}
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> 导入规则说明
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-orange-500">
                  <li>数据格式：Excel表格首行必须为字段名，且与模板字段保持一致。</li>
                  <li>必填字段：商品名称、所需积分、库存、分类为必填项，空值将导致导入失败。</li>
                  <li>重复校验：若系统中已存在相同“SKU ID”，则该条记录将自动执行“更新”操作。</li>
                  <li>校验规则：积分必须为大于等于0的数字，库存必须为非负整数。</li>
                  <li>图片导入：请在模板的【商品主图URL】列填写图片的公网链接（如OSS/CDN链接）。</li>
                  <li>一次性导入数据建议不超过 5000 条，以保证系统的稳定性。</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {isImporting ? "导入中..." : "开始导入"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 通用确认弹窗 */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-6 text-center">
            <div className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4", confirmDialog.type === 'danger' ? 'bg-red-100' : 'bg-orange-100')}>
              <AlertCircle className={cn("h-6 w-6", confirmDialog.type === 'danger' ? 'text-red-600' : 'text-orange-600')} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-slate-500 mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={closeConfirmDialog}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 w-full"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={cn("rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2", confirmDialog.type === 'danger' ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600' : 'bg-orange-600 hover:bg-orange-500 focus-visible:outline-orange-600')}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 预览弹窗 */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="relative w-[375px] h-[812px] max-h-[90vh] rounded-[2.5rem] bg-white shadow-2xl ring-8 ring-slate-800 flex flex-col overflow-hidden">
            {/* 模拟手机顶部状态栏 */}
            <div className="h-7 bg-white flex items-center justify-center text-[10px] text-slate-400 font-medium border-b border-slate-100 flex-shrink-0 relative z-10">
              <div className="absolute top-1.5 w-16 h-4 bg-slate-800 rounded-full"></div>
            </div>
            
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 z-20 rounded-full bg-black/20 p-1.5 text-white hover:bg-black/40 transition-colors backdrop-blur-md"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex-1 w-full h-full bg-slate-50 relative">
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-0"
                title="H5 Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
