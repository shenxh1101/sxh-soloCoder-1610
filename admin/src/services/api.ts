import { RepairOrder, UserInfo, StatisticsData } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3002/api';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const result: ApiResponse<T> = await response.json();
  
  if (result.code !== 0) {
    throw new Error(result.message || '请求失败');
  }
  
  return result.data;
}

// 工单相关 API
export const orderApi = {
  // 获取工单列表
  getList: (params?: {
    status?: string;
    type?: string;
    urgent?: boolean;
    keyword?: string;
    workerId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.urgent) searchParams.set('urgent', 'true');
    if (params?.keyword) searchParams.set('keyword', params.keyword);
    if (params?.workerId) searchParams.set('workerId', params.workerId);
    
    return request<{ list: RepairOrder[]; total: number }>(
      `/orders?${searchParams.toString()}`
    );
  },

  // 获取工单详情
  getDetail: (id: string) => {
    return request<RepairOrder>(`/orders/${id}`);
  },

  // 创建工单
  create: (data: {
    type: string;
    typeName: string;
    description: string;
    images?: string[];
    urgent?: boolean;
    ownerName: string;
    ownerPhone: string;
    address: string;
  }) => {
    return request<RepairOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 分配工单
  assign: (id: string, workerId: string, operatorName?: string) => {
    return request<RepairOrder>(`/orders/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ workerId, operatorName })
    });
  },

  // 接单
  accept: (id: string) => {
    return request<RepairOrder>(`/orders/${id}/accept`, {
      method: 'PUT'
    });
  },

  // 完工
  complete: (id: string, data?: { repairDescription?: string; repairImages?: string[] }) => {
    return request<RepairOrder>(`/orders/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data || {})
    });
  },

  // 评价
  rate: (id: string, rating: number, ratingContent?: string) => {
    return request<RepairOrder>(`/orders/${id}/rate`, {
      method: 'PUT',
      body: JSON.stringify({ rating, ratingContent })
    });
  }
};

// 维修师傅 API
export const workerApi = {
  // 获取师傅列表
  getList: () => {
    return request<UserInfo[]>('/workers');
  },

  // 获取师傅详情
  getDetail: (id: string) => {
    return request<UserInfo>(`/workers/${id}`);
  }
};

// 统计 API
export const statisticsApi = {
  // 获取统计数据
  getOverview: () => {
    return request<StatisticsData>('/statistics');
  },

  // 获取师傅工作量统计
  getWorkerStats: () => {
    return request<Array<{ worker: UserInfo; orderCount: number; completedCount: number; avgRating: number }>>(
      '/statistics/workers'
    );
  }
};

export default {
  order: orderApi,
  worker: workerApi,
  statistics: statisticsApi
};
