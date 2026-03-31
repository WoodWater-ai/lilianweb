import request from '../utils/request';

export interface Account {
  id: string;
  phone: string;
  name: string;
  roles: string[];
  accountType: string;
  tenantLabel: string;
  status: string;
  createdAt: string;
  isFixedAdmin: boolean;
}

export interface AccountListParams {
  page: number;
  pageSize: number;
  phone?: string;
  role?: string;
  accountType?: string;
  status?: string;
}

export interface AccountListResponse {
  list: Account[];
  total: number;
}

// 获取账号列表
export const getAccountList = async (params: AccountListParams) => {
  const res = await request.get<any, { data: AccountListResponse }>('/api/admin/accounts', { params });
  return res.data;
};

// 添加账号
export const addAccount = (data: Partial<Account> & { password?: string }) => {
  return request.post('/api/admin/accounts', data);
};

// 更新账号
export const updateAccount = (id: string, data: Partial<Account>) => {
  return request.put(`/api/admin/accounts/${id}`, data);
};

// 删除账号
export const deleteAccount = (id: string) => {
  return request.delete(`/api/admin/accounts/${id}`);
};

// 更新账号状态
export const updateAccountStatus = (id: string, status: string) => {
  return request.patch(`/api/admin/accounts/${id}/status`, { status });
};

// 重置密码
export const resetPassword = (id: string) => {
  return request.post(`/api/admin/accounts/${id}/reset-password`);
};
