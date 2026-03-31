import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen, Check, AlertCircle, X } from "lucide-react";
import { cn } from "../utils/cn";
import { getCategoryTree, addCategory, updateCategory, deleteCategory } from "../api/category";

export function Categories() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isReadOnly = !!localStorage.getItem("viewing_channel");

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [parentCategory, setParentCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "" });
  
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await getCategoryTree();
      const normalizeNodes = (nodes: any[]): any[] => {
        if (!nodes) return [];
        return nodes.map((node) => ({
          ...node,
          id: String(node.id),
          parentId: node.parentId ? String(node.parentId) : null,
          children: normalizeNodes(node.children),
        }));
      };

      // 递归设置 isExpanded 为 true 以便默认展开
      const expandAll = (nodes: any[]): any[] => {
        if (!nodes) return [];
        return nodes.map(node => ({
          ...node,
          isExpanded: true,
          children: expandAll(node.children)
        }));
      };
      setCategories(expandAll(normalizeNodes(res || [])));
    } catch (err: any) {
      setError(err.message || "获取分类失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (categoryId: string, currentCategories: any[]): any[] => {
    return currentCategories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, isExpanded: !cat.isExpanded };
      }
      if (cat.children) {
        return { ...cat, children: toggleExpand(categoryId, cat.children) };
      }
      return cat;
    });
  };

  const handleToggle = (id: string) => {
    setCategories(toggleExpand(id, categories));
  };

  const handleOpenModal = (parent: any = null, category: any = null) => {
    if (isReadOnly) return;
    setParentCategory(parent);
    setEditingCategory(category);
    setFormData({ name: category ? category.name : "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || isReadOnly) return;

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          name: formData.name,
          parentId: editingCategory.parentId,
          sort: editingCategory.sort || 0,
          status: editingCategory.status || 1,
          level: editingCategory.level
        });
        showToast("分类更新成功");
      } else {
        await addCategory({
          name: formData.name,
          parentId: parentCategory ? parentCategory.id : 0,
          sort: 0,
          status: 1,
          level: parentCategory ? parentCategory.level + 1 : 1
        });
        showToast(parentCategory ? "子分类创建成功" : "一级分类创建成功");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "操作失败");
    }
  };

  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  const handleDelete = (id: string) => {
    if (isReadOnly) return;
    setConfirmModal({isOpen: true, id});
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.id && !isReadOnly) {
      try {
        await deleteCategory(confirmModal.id);
        showToast("分类已删除");
        fetchCategories();
      } catch (err: any) {
        setError(err.message || "删除失败");
      }
    }
    setConfirmModal({isOpen: false, id: null});
  };

  const renderTree = (nodes: any[]) => {
    if (!nodes || nodes.length === 0) {
      return <div className="text-sm text-slate-500 py-4">暂无分类数据</div>;
    }
    return (
      <ul className="space-y-1">
        {nodes.map(node => (
          <li key={node.id} className="relative">
            <div className={cn(
              "flex items-center justify-between py-2 px-3 rounded-md hover:bg-slate-50 group transition-colors",
              node.level === 1 ? "bg-slate-50/50 font-medium mt-2" : "",
              node.level === 2 ? "ml-6" : "",
              node.level === 3 ? "ml-12 text-sm text-slate-600" : ""
            )}>
              <div className="flex items-center gap-2">
                {node.children && node.children.length > 0 ? (
                  <button onClick={() => handleToggle(node.id)} className="p-0.5 text-slate-400 hover:text-slate-600">
                    {node.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                ) : (
                  <span className="w-5 inline-block"></span>
                )}
                
                {node.level < 3 ? (
                  node.isExpanded ? <FolderOpen className="h-4 w-4 text-primary/70" /> : <Folder className="h-4 w-4 text-primary/70" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1.5"></div>
                )}
                
                <span>{node.name}</span>
                <span className="text-xs text-slate-400 font-mono ml-2">({node.id})</span>
              </div>
              
              {!isReadOnly && (
                <div className="hidden group-hover:flex items-center gap-2">
                  {node.level < 3 && (
                    <button 
                      onClick={() => handleOpenModal(node)}
                      className="text-xs text-primary hover:text-primary-hover flex items-center px-2 py-1 rounded hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3 mr-1" /> 添加子分类
                    </button>
                  )}
                  <button 
                    onClick={() => handleOpenModal(null, node)}
                    className="text-slate-400 hover:text-primary p-1 rounded hover:bg-slate-100"
                    title="编辑"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(node.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100"
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            
            {node.children && node.isExpanded && (
              <div className="mt-1">
                {renderTree(node.children)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
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
              <p className="text-sm text-slate-600">确定要删除该分类吗？如果包含子分类将被一并删除。</p>
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

      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg ring-1 ring-emerald-600/20 animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-800 shadow-lg ring-1 ring-red-600/20 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          {error}
          <button onClick={() => setError("")} className="ml-2 text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            商品分类
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            管理商品的三级分类体系，用于商品的归类和检索。
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              新建一级分类
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
        <div className="max-w-3xl">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">加载中...</div>
          ) : (
            renderTree(categories)
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingCategory ? "编辑分类" : (parentCategory ? `新建子分类 (父级: ${parentCategory.name})` : "新建一级分类")}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-5">
              <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    分类名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="请输入分类名称"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                form="category-form"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
