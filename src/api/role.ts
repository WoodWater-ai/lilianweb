import request from '../utils/request';

export interface Role {
  id: string;
  code: string;
  name: string;
  type: string;
  roleType: string;
  summary: string;
  status: string;
  isSystem: boolean;
  permissions: string[];
  remarks: string;
}

export interface RoleListParams {
  page: number;
  pageSize: number;
  code?: string;
  name?: string;
  roleType?: string;
  status?: string;
}

export interface RoleListResponse {
  list: Role[];
  total: number;
}

// 获取角色列表
export const getRoleList = async (params: RoleListParams) => {
  const res = await request.get<any, RoleListResponse>('/v1/admin/role/list', {
    params: {
      pageNum: params.page,
      pageSize: params.pageSize,
      roleName: params.name || undefined,
    },
  });

  return {
    total: res.total || 0,
    list: (res.list || []).map((item: any) => ({
      id: String(item.id),
      code: item.roleCode || '',
      name: item.roleName || '',
      type: item.isCommon === 'Y' ? '系统内置' : '自定义',
      roleType: item.clientType || '后台',
      summary: item.description || '无权限说明',
      status: '启用',
      isSystem: item.isCommon === 'Y',
      permissions: item.menuIds || [],
      remarks: item.description || '',
    })),
  };
};

// 添加角色
export const addRole = (data: Partial<Role>) => {
  return request.post('/v1/admin/role/add', data);
};

// 更新角色
export const updateRole = (id: string, data: Partial<Role>) => {
  return request.post('/v1/admin/role/update', { id, ...data });
};

// 删除角色
export const deleteRole = (id: string) => {
  return request.post('/v1/admin/role/delete', { id });
};

// 更新角色状态
export const updateRoleStatus = (id: string, status: string) => {
  return request.post('/v1/admin/role/update', { id, status });
};
