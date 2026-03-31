import request from '../utils/request';

export const getCategoryTree = (): Promise<any> => {
  return request.get('/v1/admin/product/category/tree');
};

export const addCategory = (data: any): Promise<any> => {
  return request.post('/v1/admin/product/category/add', data);
};

export const updateCategory = (data: any): Promise<any> => {
  return request.put('/v1/admin/product/category/update', data);
};

export const deleteCategory = (id: string): Promise<any> => {
  return request.delete(`/v1/admin/product/category/delete?id=${id}`);
};
