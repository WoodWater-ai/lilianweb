import React, { useState } from "react";
import { Search, X, Check, Image as ImageIcon, Package } from "lucide-react";
import { cn } from "../utils/cn";

// 模拟商品数据 (实际应用中应从 API 获取)
const mockProducts = [
  { id: "P001", name: "阳澄湖大闸蟹礼盒", category: "食品生鲜", points: 500, stock: 1250, spuId: "SPU100001" },
  { id: "P002", name: "中秋尊享月饼礼盒", category: "食品生鲜", points: 200, stock: 100, spuId: "SPU100002" },
  { id: "P003", name: "华为 WATCH GT4", category: "数码家电", points: 2000, stock: 150, spuId: "HW-2024001" },
  { id: "P004", name: "Nespresso 胶囊机", category: "数码家电", points: 1500, stock: 80, spuId: "NS-2024052" },
  { id: "P005", name: "Lamy 恒星系列", category: "日用百货", points: 500, stock: 300, spuId: "LM-2024099" },
  { id: "P006", name: "AirPods Pro", category: "数码家电", points: 1800, stock: 50, spuId: "AP-2024102" },
];

const categories = ["全部", "食品生鲜", "数码家电", "日用百货", "虚拟权益"];

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
  title?: string;
}

export function ProductSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedIds = [],
  title = "关联商品"
}: ProductSelectorModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [activeTab, setActiveTab] = useState("全部");

  if (!isOpen) return null;

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.spuId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "全部" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = filteredProducts.map(p => p.id);
      const newSelected = Array.from(new Set([...selectedIds, ...allFilteredIds]));
      setSelectedIds(newSelected);
    } else {
      const allFilteredIds = filteredProducts.map(p => p.id);
      setSelectedIds(selectedIds.filter(id => !allFilteredIds.includes(id)));
    }
  };

  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="输入商品名称/ID进行搜索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border-0 py-2 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full sm:w-48 rounded-lg border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-orange-500 sm:text-sm"
            >
              {categories.map(c => <option key={c} value={c}>{c === "全部" ? "所有分类" : c}</option>)}
            </select>
            <div className="flex bg-slate-200/50 p-1 rounded-lg self-start">
              {["全部", "热门", "促销", "新品"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                    activeTab === tab ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">商品图片</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">名称</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">分类</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">所需积分</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">库存</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className={cn(
                    "hover:bg-slate-50 transition-colors cursor-pointer",
                    selectedIds.includes(product.id) && "bg-orange-50/30"
                  )}
                  onClick={() => handleToggleSelect(product.id)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => {}} // Handled by row click
                      className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-bold text-slate-900">{product.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {product.spuId}</div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm font-bold text-orange-600">
                    {product.points.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-500">
                    {product.stock}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    未找到匹配的商品
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-orange-600 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                已选择 <span className="text-orange-600 font-bold">{selectedIds.length}</span> 件商品
              </span>
            </div>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              清空选择
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(selectedIds)}
              className="px-8 py-2 rounded-lg bg-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-2"
            >
              确认关联 <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
