import { Bell, Search, Menu, LogOut, User, ShieldAlert, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : { name: "未登录", role: "" };
  });

  const [viewingChannel, setViewingChannel] = useState(() => {
    const viewingChannelStr = localStorage.getItem("viewing_channel");
    return viewingChannelStr ? JSON.parse(viewingChannelStr) : null;
  });

  useEffect(() => {
    const handleStorage = () => {
      const userStr = localStorage.getItem("user");
      setUser(userStr ? JSON.parse(userStr) : { name: "未登录", role: "" });
      
      const viewingChannelStr = localStorage.getItem("viewing_channel");
      setViewingChannel(viewingChannelStr ? JSON.parse(viewingChannelStr) : null);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("viewing_channel");
    navigate("/login");
  };

  const handleExitView = () => {
    localStorage.removeItem("viewing_channel");
    window.dispatchEvent(new Event("storage"));
    navigate("/channels");
  };

  return (
    <div className="flex flex-col w-full">
      {viewingChannel && (
        <div className="bg-amber-500 text-white px-6 py-2 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-2 text-sm font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>总控访问模式 - {viewingChannel.name} - 仅供查看</span>
          </div>
          <button 
            onClick={handleExitView}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-xs font-bold"
          >
            <X className="h-3 w-3" />
            退出查看模式
          </button>
        </div>
      )}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="flex items-center">
        <button className="text-slate-500 hover:text-slate-700 lg:hidden mr-4">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">控制台</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            placeholder="搜索..."
          />
        </div>
        
        <button className="relative text-slate-500 hover:text-slate-700 mr-4">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-slate-900">{user.name}</span>
              <span className="text-xs text-slate-500">{user.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-md hover:bg-slate-50 transition-colors ml-2" 
            title="退出登录"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
    </div>
  );
}
