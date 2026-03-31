import request from '../utils/request';

export const login = (data: any): Promise<any> => {
  return request.post('/v1/admin/user/login', data);
};

export const switchOrganization = (data: { organizationId: number }): Promise<any> => {
  return request.post('/v1/admin/user/organization/switch', data);
};

export const getUserRoles = (): Promise<any> => {
  return request.get('/v1/admin/user/roles/list');
};

export const getUserMenuTree = (): Promise<any> => {
  return request.get('/v1/admin/user/menus/tree');
};

