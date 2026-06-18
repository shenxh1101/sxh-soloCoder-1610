import Taro from '@tarojs/taro';
import { RepairOrder, UserInfo, StatisticsData } from '@/types';

const API_BASE = 'http://localhost:3002/api';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

async function request<T>(url: string, options: Taro.request.Option = {}): Promise<T> {
  try {
    const response = await Taro.request<ApiResponse<T>>({
      url: `${API_BASE}${url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      timeout: 10000
    });

    if (response.statusCode !== 200) {
      throw new Error(`HTTP错误: ${response.statusCode}`);
    }

    const result = response.data;
    if (result.code !== 0) {
      throw new Error(result.message || '请求失败');
    }

    return result.data;
  } catch (error) {
    console.error('[API] 请求失败:', url, error);
    throw error;
  }
}

export const orderApi = {
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

    const query = searchParams.toString();
    return request<{ list: RepairOrder[]; total: number }>(
      query ? `/orders?${query}` : '/orders'
    );
  },

  getDetail: (id: string) => {
    return request<RepairOrder>(`/orders/${id}`);
  },

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
      data
    });
  },

  assign: (id: string, workerId: string, operatorName?: string) => {
    return request<RepairOrder>(`/orders/${id}/assign`, {
      method: 'PUT',
      data: { workerId, operatorName }
    });
  },

  accept: (id: string) => {
    return request<RepairOrder>(`/orders/${id}/accept`, {
      method: 'PUT'
    });
  },

  depart: (id: string) => {
    return request<RepairOrder>(`/orders/${id}/depart`, {
      method: 'PUT'
    });
  },

  start: (id: string) => {
    return request<RepairOrder>(`/orders/${id}/start`, {
      method: 'PUT'
    });
  },

  complete: (id: string, data?: { repairDescription?: string; repairImages?: string[] }) => {
    return request<RepairOrder>(`/orders/${id}/complete`, {
      method: 'PUT',
      data: data || {}
    });
  },

  rate: (id: string, rating: number, ratingContent?: string) => {
    return request<RepairOrder>(`/orders/${id}/rate`, {
      method: 'PUT',
      data: { rating, ratingContent }
    });
  }
};

export const workerApi = {
  getList: () => {
    return request<UserInfo[]>('/workers');
  },

  getDetail: (id: string) => {
    return request<UserInfo>(`/workers/${id}`);
  }
};

export const statisticsApi = {
  getOverview: () => {
    return request<StatisticsData>('/statistics');
  },

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
