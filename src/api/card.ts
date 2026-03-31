import request from '../utils/request';

export interface CardSecret {
  id: string;
  packageId: string;
  packageName: string;
  cardNumber: string;
  password?: string;
  status: string;
  createdAt: string;
  usedAt?: string;
  usedBy?: string;
  tenantLabel: string;
}

export const getCardList = (data: any): Promise<any> => {
  return request.get('/v1/admin/card/list', { params: data });
};

export const batchGenerateCard = (data: any): Promise<any> => {
  return request.post('/v1/admin/card/batch/generate', data);
};

export const importCustomCard = (data: any): Promise<any> => {
  return request.post('/v1/admin/card/custom/import', data);
};

export const mapPhoneCard = (data: any): Promise<any> => {
  return request.post('/v1/admin/card/phone/mapping', data);
};

export const disableCard = (data: any): Promise<any> => {
  return request.put('/v1/admin/card/disable', data);
};

export const batchDisableCard = (data: any): Promise<any> => {
  return request.put('/v1/admin/card/batch/disable', data);
};
