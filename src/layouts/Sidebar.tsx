import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Gift, 
  KeyRound, 
  Truck, 
  Users,
  Settings,
  ShoppingCart,
  Megaphone,
  Shield,
  ListTree,
  Building2,
  Store
} from "lucide-react";
import { cn } from "../utils/cn";

const navigationGroups = [
  {
    title: "概览",
    items: [
      { name: "控制台", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    title: "商品中心",
    items: [
      { name: "商品管理", href: "/products", icon: Package },
      { name: "分类管理", href: "/categories", icon: ListTree },
      { name: "礼包管理", href: "/packages", icon: Gift },
      { name: "卡密管理", href: "/secrets", icon: KeyRound },
    ]
  },
  {
    title: "订单中心",
    items: [
      { name: "订单列表", href: "/orders", icon: ShoppingCart },
      { name: "发货管理", href: "/shipping-templates", icon: Truck },
    ]
  },
  {
    title: "组织架构",
    items: [
      { name: "渠道管理", href: "/channels", icon: Building2 },
      { name: "二级租户管理", href: "/sub-tenants", icon: Store },
    ]
  },
  {
    title: "系统管理",
    items: [
      { name: "公告管理", href: "/announcements", icon: Megaphone },
      { name: "角色管理", href: "/roles", icon: Shield },
      { name: "账号管理", href: "/users", icon: Users },
    ]
  }
];

export function Sidebar() {
  const location = useLocation();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isSuperAdmin = user?.role === "系统超级管理员";

  const viewingChannelStr = localStorage.getItem("viewing_channel");
  const viewingChannel = viewingChannelStr ? JSON.parse(viewingChannelStr) : null;

  // 根据角色过滤菜单
  const filteredGroups = navigationGroups.map(group => {
    if (viewingChannel) {
      // 渠道查看模式下的菜单
      if (group.title === "概览") return group;
      if (group.title === "商品中心") {
        return {
          ...group,
          items: group.items.filter(item => ["商品管理", "礼包管理", "卡密管理"].includes(item.name))
        };
      }
      if (group.title === "订单中心") {
        return {
          ...group,
          items: group.items.filter(item => ["订单列表", "发货管理"].includes(item.name))
        };
      }
      if (group.title === "系统管理") {
        return {
          ...group,
          items: group.items.filter(item => item.name === "公告管理")
        };
      }
      return null;
    }

    if (group.title === "组织架构") {
      // 只有系统超级管理员和渠道管理员能看到组织架构
      const isChannelAdmin = user?.role === "渠道管理员";
      
      if (!isSuperAdmin && !isChannelAdmin) {
        return null;
      }

      return {
        ...group,
        items: group.items.filter(item => {
          if (isSuperAdmin) {
            // 超级管理员只管理渠道，不直接管理二级租户
            return item.name === "渠道管理";
          }
          if (isChannelAdmin) {
            // 渠道管理员只管理自己辖区下的二级租户
            return item.name === "二级租户管理";
          }
          return false;
        })
      };
    }
    if (group.title === "系统管理") {
      if (user?.accountType === "二级租户管理员") {
        return null;
      }
    }
    return group;
  }).filter(Boolean) as typeof navigationGroups;

  return (
    <div className="flex h-full w-64 flex-col bg-[#111827] text-slate-300">
      <div className="flex h-16 items-center px-6 bg-[#111827]">
        <div className="bg-orange-600 p-1.5 rounded-lg mr-3">
          <Gift className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-wider">礼品兑换系统</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                          isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
      
      <div className="p-4 text-center">
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">V 1.2.0 Build 2023</p>
      </div>
    </div>
  );
}
