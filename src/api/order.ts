import request from '../utils/request';

export interface Order {
  id: string;
  orderNo: string;
  productName: string;
  quantity: number;
  status: string;
  points: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  logisticsCompany?: string;
  trackingNo?: string;
  createdAt: string;
  batchId?: string;
  ticketNo?: string;
  secretCode?: string;
  packageName?: string;
  userRemark?: string;
  shippingRemark?: string;
  opRemark?: string;
  redeemerPhone?: string;
  tenantLabel?: string;
  subPackages?: any[];
}

export interface OrderListParams {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
  batchNo?: string;
  cardNo?: string;
  redeemerPhone?: string;
}

export interface OrderListResponse {
  list: Order[];
  total: number;
}

export const getOrderList = (params: OrderListParams): Promise<OrderListResponse> => {
  return request.get('/v1/admin/order/list', { params });
};

export const shipOrder = (data: { orderId: string; logisticsCompany: string; trackingNo: string; shippingRemark?: string }): Promise<void> => {
  return request.put(`/v1/admin/order/ship?orderId=${data.orderId}&logisticsCompany=${encodeURIComponent(data.logisticsCompany)}&logisticsNo=${encodeURIComponent(data.trackingNo)}${data.shippingRemark ? `&shippingRemark=${encodeURIComponent(data.shippingRemark)}` : ''}`);
};

export const updateOrderOpRemark = (data: { orderId: string; opRemark: string }): Promise<void> => {
  return request.put(`/v1/admin/order/remark?orderId=${data.orderId}&opRemark=${encodeURIComponent(data.opRemark)}`);
};

export const exportOrders = (params: any): Promise<Blob> => {
  return request.get('/v1/admin/order/export', { params, responseType: 'blob' });
};

export const importOrders = (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/v1/admin/order/batch-ship', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
