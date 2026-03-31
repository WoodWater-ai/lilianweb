import request from '../utils/request';

export const getProductList = (data: any): Promise<any> => {
  return request.post('/v1/admin/product/list', data);
};

export const addProduct = (data: any): Promise<any> => {
  return request.post('/v1/admin/product/add', data);
};

export const updateProduct = (data: any): Promise<any> => {
  return request.post('/v1/admin/product/update', data);
};

export const updateProductStatus = (data: { id: string, status: number }): Promise<any> => {
  return request.post('/v1/admin/product/status', data);
};

export const deleteProduct = (data: { id: string }): Promise<any> => {
  return request.post('/v1/admin/product/delete', data);
};

export const batchUpdateProductStatus = (data: { ids: string[], status: number }): Promise<any> => {
  return request.post('/v1/admin/product/batch-status', data);
};

export const batchDeleteProducts = (ids: string[]): Promise<any> => {
  return request.post('/v1/admin/product/batch-delete', ids);
};
