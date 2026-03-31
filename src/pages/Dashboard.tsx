import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  CreditCard,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Download,
  Check
} from "lucide-react";
import { cn } from "../utils/cn";
import { useState } from "react";

const stats = [
  { name: "总营业额", value: "¥124,500", change: "+12.5%", trend: "up", icon: CreditCard },
  { name: "订单总数", value: "1,234", change: "+5.2%", trend: "up", icon: Package },
  { name: "活跃用户", value: "892", change: "-2.1%", trend: "down", icon: Users },
  { name: "转化率", value: "12.5%", change: "+1.2%", trend: "up", icon: TrendingUp },
];

const revenueData = [
  { name: "周一", revenue: 4000, orders: 240 },
  { name: "周二", revenue: 3000, orders: 139 },
  { name: "周三", revenue: 5000, orders: 980 },
  { name: "周四", revenue: 2780, orders: 390 },
  { name: "周五", revenue: 6890, orders: 480 },
  { name: "周六", revenue: 8390, orders: 380 },
  { name: "周日", revenue: 10490, orders: 430 },
];

const pieData = [
  { name: "数码家电", value: 400 },
  { name: "食品生鲜", value: 300 },
  { name: "虚拟权益", value: 300 },
  { name: "日用百货", value: 200 },
];
const COLORS = ["#ec5b13", "#f97316", "#fb923c", "#fdba74"];

const recentOrders = [
  { id: "ORD-20260317-001", user: "张三 (138****1234)", package: "中秋尊享大礼包", date: "2026-03-17 10:23", status: "已发货" },
  { id: "ORD-20260317-002", user: "李四 (139****5678)", package: "新春特惠礼盒", date: "2026-03-17 09:45", status: "待发货" },
  { id: "ORD-20260316-003", user: "王五 (137****9012)", package: "VIP视频年卡", date: "2026-03-16 18:30", status: "已完成" },
  { id: "ORD-20260316-004", user: "赵六 (136****3456)", package: "企业定制礼盒", date: "2026-03-16 15:20", status: "已发货" },
  { id: "ORD-20260315-005", user: "孙七 (135****7890)", package: "阳澄湖大闸蟹券", date: "2026-03-15 11:10", status: "已完成" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleExport = () => {
    showToast("正在生成报表...");
    setTimeout(() => {
      const headers = ["日期", "营业额", "订单数"];
      const rows = revenueData.map(d => [d.name, d.revenue, d.orders]);
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `业务报表_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("报表导出成功");
    }, 1000);
  };

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg ring-1 ring-emerald-600/20 animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4 text-emerald-600" />
          {toastMessage}
        </div>
      )}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
          数据概览
        </h2>
        <div className="mt-4 sm:ml-4 sm:mt-0 flex space-x-3">
          <select className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 bg-white">
            <option>最近 7 天</option>
            <option>最近 30 天</option>
            <option>本月</option>
            <option>本年</option>
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <Download className="mr-2 h-4 w-4 text-slate-400" />
            导出报表
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md"
          >
            <dt>
              <div className="absolute rounded-xl bg-orange-50 p-3">
                <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
              <p
                className={cn(
                  "ml-2 flex items-baseline text-sm font-semibold",
                  item.trend === "up" ? "text-emerald-600" : "text-red-600"
                )}
              >
                {item.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center text-red-500" />
                )}
                <span className="sr-only">
                  {item.trend === "up" ? "Increased by" : "Decreased by"}
                </span>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-base font-semibold leading-6 text-slate-900 mb-4">
            营业额趋势
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec5b13" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec5b13" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dx={-10}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ec5b13"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-span-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-base font-semibold leading-6 text-slate-900 mb-4">
            订单品类分布
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <span 
                  className="h-3 w-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5 sm:flex sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold leading-6 text-slate-900">
            最新订单
          </h3>
          <button 
            onClick={() => navigate("/orders")}
            className="text-sm font-medium text-primary hover:text-primary-hover mt-3 sm:mt-0"
          >
            查看全部订单 &rarr;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">
                  订单编号
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  下单用户
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  商品名称
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  下单时间
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900">
                    {order.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {order.user}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Package className="mr-2 h-4 w-4 text-slate-400" />
                      {order.package}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-slate-400" />
                      {order.date}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        order.status === "已完成"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                          : order.status === "已发货"
                          ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                          : "bg-orange-50 text-orange-700 ring-orange-600/20"
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
