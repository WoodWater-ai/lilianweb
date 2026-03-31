import request from '../utils/request';

export interface GiftPackage {
  id: string;
  name: string;
  type: string;
  form: string;
  faceValue: number;
  costPrice: number;
  validityType: string;
  validityStartDate: string;
  validityEndDate: string;
  validityDays: number;
  status: string;
  createdAt: string;
  products: string[];
  showPrice: boolean;
  tenantLabel: string;
}

export const getGiftList = (data: any): Promise<any> => {
  return request.get('/v1/admin/gift/list', { params: data });
};

export const addGift = (data: any): Promise<any> => {
  return request.post('/v1/admin/gift/add', data);
};

export const updateGift = (data: any): Promise<any> => {
  return request.put('/v1/admin/gift/update', data);
};

export const deleteGift = (id: string): Promise<any> => {
  return request.delete(`/v1/admin/gift/delete?id=${id}`);
};

export const updateGiftStatus = (data: any): Promise<any> => {
  return request.put(`/v1/admin/gift/status?id=${data.id}&status=${data.status}`);
};
