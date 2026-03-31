import request from '../utils/request';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: string; // "草稿" | "已发布"
  publishedAt: string;
  author: string;
  associatedPackages: string[];
  popupFrequency: "first" | "every";
  scheduledAt: string;
}

export interface AnnouncementListParams {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  status?: number;
}

export interface AnnouncementListResponse {
  list: Announcement[];
  total: number;
}

// 获取公告列表
export const getAnnouncementList = (params: AnnouncementListParams): Promise<AnnouncementListResponse> => {
  return request.get('/v1/admin/announcement/list', { params });
};

// 添加公告
export const addAnnouncement = (data: any): Promise<any> => {
  return request.post('/v1/admin/announcement/add', data);
};

// 更新公告
export const updateAnnouncement = (data: any): Promise<any> => {
  return request.put('/v1/admin/announcement/update', data);
};

// 删除公告
export const deleteAnnouncement = (id: string): Promise<any> => {
  return request.delete(`/v1/admin/announcement/delete?id=${id}`);
};

// 发布/撤回公告
export const updateAnnouncementStatus = (id: string, status: string): Promise<any> => {
  return status === '已发布'
    ? request.put(`/v1/admin/announcement/publish?id=${id}`)
    : request.put(`/v1/admin/announcement/offline?id=${id}`);
};
