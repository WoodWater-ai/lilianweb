import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Lock, User, AlertCircle, X, ChevronRight } from "lucide-react";
import CryptoJS from "crypto-js";
import { login, switchOrganization } from "../api/auth";

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showRoleSelectModal, setShowRoleSelectModal] = useState(false);
  const [multiAccounts, setMultiAccounts] = useState<any[]>([]);
  const [tempUserInfo, setTempUserInfo] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const md5Password = CryptoJS.MD5(password).toString().toUpperCase();
      const res = await login({ userName: username, password: md5Password });
      
      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      if (res.organizationList && res.organizationList.length > 1) {
        setMultiAccounts(res.organizationList);
        setTempUserInfo(res);
        setShowRoleSelectModal(true);
      } else {
        saveUserAndNavigate(res, res.currentOrganization || res.organizationList?.[0]);
      }
    } catch (err: any) {
      setError(err.message || "登录失败，请检查用户名和密码");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAccount = async (org: any) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await switchOrganization({ organizationId: org.organizationId });
      if (res && res.token) {
        localStorage.setItem("token", res.token);
      }
      saveUserAndNavigate(tempUserInfo, org);
      setShowRoleSelectModal(false);
    } catch (err: any) {
      setError(err.message || "切换组织失败");
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserAndNavigate = (userInfo: any, selectedOrg: any) => {
    const role = userInfo.roleList?.[0];
    
    // 映射到前端已有的角色体系
    let accountType = role?.roleName || "管理员";
    if (role?.organizationLevel === 1) accountType = "系统超级管理员";
    if (role?.organizationLevel === 2) accountType = "渠道管理员";
    if (role?.organizationLevel === 3) accountType = "二级租户管理员";

    localStorage.setItem("user", JSON.stringify({
      name: userInfo.name || userInfo.username,
      role: accountType,
      rawRoleName: role?.roleName,
      accountType: accountType,
      tenantLabel: selectedOrg?.organizationName,
      channelCode: selectedOrg?.organizationName,
      organizationId: selectedOrg?.organizationId,
      organizationLevel: role?.organizationLevel,
      menuTree: userInfo.menuTree
    }));
    
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            礼品兑换系统
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            欢迎回来，请登录您的管理员账号
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名 / 手机号
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="用户名 / 手机号 (admin 或 channel 或 multi)"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="密码 (123456)"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                记住我
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary-hover">
                忘记密码？
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "登录中..." : "登 录"}
            </button>
          </div>
        </form>
      </div>

      {/* 角色选择弹窗 */}
      {showRoleSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">选择登录账号</h3>
              <button
                onClick={() => setShowRoleSelectModal(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-3">
              <p className="text-sm text-slate-500 mb-4">
                您的手机号关联了多个后台账号，请选择要登录的身份：
              </p>
              {multiAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAccount(account)}
                  className="w-full text-left flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div>
                    <div className="font-medium text-slate-900 group-hover:text-primary">
                      {account.accountType}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      所属：{account.tenantLabel || account.channelCode || "系统"}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
