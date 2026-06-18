import { create } from 'zustand';
import { RepairOrder, UserInfo, OrderStatus, StatisticsData, RepairType } from '@/types';
import { orderApi, workerApi, statisticsApi } from '@/services/api';

interface WorkerStat {
  worker: UserInfo;
  orderCount: number;
  completedCount: number;
  avgRating: number;
}

interface AppState {
  orders: RepairOrder[];
  workers: UserInfo[];
  currentUser: UserInfo;
  statistics: StatisticsData | null;
  workerStats: WorkerStat[];
  loading: boolean;
  statisticsLoading: boolean;
  
  // 筛选状态
  searchKeyword: string;
  statusFilter: OrderStatus | 'all';
  typeFilter: RepairType | 'all';
  urgentOnly: boolean;
  
  // actions
  setSearchKeyword: (keyword: string) => void;
  setStatusFilter: (status: OrderStatus | 'all') => void;
  setTypeFilter: (type: RepairType | 'all') => void;
  setUrgentOnly: (urgent: boolean) => void;
  
  // 数据加载
  fetchOrders: () => Promise<void>;
  fetchWorkers: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchWorkerStats: () => Promise<void>;
  initData: () => Promise<void>;
  
  getFilteredOrders: () => RepairOrder[];
  getOrderById: (id: string) => RepairOrder | undefined;
  assignOrder: (orderId: string, workerId: string) => Promise<boolean>;
  getStatistics: () => StatisticsData | null;
  getWorkerStats: () => WorkerStat[];
  exportOrders: () => string;
  exportStatistics: () => string;
}

const defaultStatistics: StatisticsData = {
  totalOrders: 0,
  pendingOrders: 0,
  processingOrders: 0,
  completedOrders: 0,
  avgResponseTime: 0,
  avgCompleteTime: 0,
  completionRate: 0,
  typeStats: [],
  monthlyStats: [],
  responseTimeDistribution: []
};

export const useAppStore = create<AppState>((set, get) => ({
  orders: [],
  workers: [],
  statistics: null,
  workerStats: [],
  loading: false,
  statisticsLoading: false,
  
  currentUser: {
    id: 'admin001',
    name: '管理员小王',
    phone: '13000000001',
    role: 'admin',
    avatar: 'https://picsum.photos/id/1005/200/200'
  },

  searchKeyword: '',
  statusFilter: 'all',
  typeFilter: 'all',
  urgentOnly: false,

  setSearchKeyword: (keyword: string) => set({ searchKeyword: keyword }),
  setStatusFilter: (status: OrderStatus | 'all') => set({ statusFilter: status }),
  setTypeFilter: (type: RepairType | 'all') => set({ typeFilter: type }),
  setUrgentOnly: (urgent: boolean) => set({ urgentOnly: urgent }),

  fetchOrders: async () => {
    try {
      const result = await orderApi.getList();
      set({ orders: result.list });
    } catch (error) {
      console.error('[Store] 加载工单列表失败:', error);
      set({ orders: [] });
    }
  },

  fetchWorkers: async () => {
    try {
      const workers = await workerApi.getList();
      set({ workers });
    } catch (error) {
      console.error('[Store] 加载维修师傅列表失败:', error);
      set({ workers: [] });
    }
  },

  fetchStatistics: async () => {
    set({ statisticsLoading: true });
    try {
      const statistics = await statisticsApi.getOverview();
      set({ statistics, statisticsLoading: false });
    } catch (error) {
      console.error('[Store] 加载统计数据失败:', error);
      set({ statistics: defaultStatistics, statisticsLoading: false });
    }
  },

  fetchWorkerStats: async () => {
    try {
      const stats = await statisticsApi.getWorkerStats();
      set({ workerStats: stats });
    } catch (error) {
      console.error('[Store] 加载师傅工作量统计失败:', error);
      set({ workerStats: [] });
    }
  },

  initData: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().fetchOrders(),
        get().fetchWorkers(),
        get().fetchStatistics(),
        get().fetchWorkerStats()
      ]);
    } finally {
      set({ loading: false });
    }
  },

  getFilteredOrders: () => {
    const state = get();
    let result = [...state.orders];

    if (state.searchKeyword) {
      const keyword = state.searchKeyword.toLowerCase();
      result = result.filter(o => 
        o.orderNo.toLowerCase().includes(keyword) ||
        o.ownerName.toLowerCase().includes(keyword) ||
        o.description.toLowerCase().includes(keyword) ||
        o.address.toLowerCase().includes(keyword)
      );
    }

    if (state.statusFilter !== 'all') {
      result = result.filter(o => o.status === state.statusFilter);
    }

    if (state.typeFilter !== 'all') {
      result = result.filter(o => o.type === state.typeFilter);
    }

    if (state.urgentOnly) {
      result = result.filter(o => o.urgent);
    }

    result.sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime();
    });

    return result;
  },

  getOrderById: (id: string) => {
    return get().orders.find(o => o.id === id);
  },

  assignOrder: async (orderId: string, workerId: string): Promise<boolean> => {
    try {
      const updatedOrder = await orderApi.assign(orderId, workerId, get().currentUser.name);
      
      // 更新本地数据
      const orders = get().orders.map(o => 
        o.id === orderId ? updatedOrder : o
      );
      set({ orders });
      
      // 刷新统计数据
      get().fetchStatistics();
      
      console.log('[Store] 分配工单成功:', updatedOrder.orderNo);
      return true;
    } catch (error) {
      console.error('[Store] 分配工单失败:', error);
      return false;
    }
  },

  getStatistics: () => {
    return get().statistics;
  },

  getWorkerStats: () => {
    const state = get();
    // 优先使用API返回的统计，如果没有就用本地计算的兜底
    if (state.workerStats && state.workerStats.length > 0) {
      return state.workerStats.map(ws => ({
        worker: ws.worker,
        orderCount: ws.orderCount,
        completedCount: ws.completedCount,
        avgRating: ws.avgRating
      }));
    }
    // 本地兜底计算
    return state.workers.map(worker => {
      const workerOrders = state.orders.filter(o => o.workerId === worker.id);
      const ratedOrders = workerOrders.filter(o => o.rating);
      const avgRating = ratedOrders.length > 0 
        ? ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length 
        : 0;
      return {
        worker,
        orderCount: workerOrders.length,
        completedCount: workerOrders.filter(o => o.status === 'rated').length,
        avgRating: Math.round(avgRating * 10) / 10
      };
    });
  },

  exportOrders: (): string => {
    const orders = get().getFilteredOrders();
    const headers = ['工单号', '报修类型', '状态', '是否紧急', '报修人', '联系电话', '报修地址', '问题描述', '提交时间', '维修师傅', '完成时间', '评分'];
    const rows = orders.map(o => [
      o.orderNo,
      o.typeName,
      o.statusName,
      o.urgent ? '是' : '否',
      o.ownerName,
      o.ownerPhone,
      o.address,
      o.description.replace(/,/g, '，'),
      o.submitTime,
      o.workerName || '',
      o.completeTime || '',
      o.rating ? `${o.rating}星` : ''
    ]);
    
    // 添加 UTF-8 BOM，解决Excel打开中文乱码问题
    const BOM = '\uFEFF';
    const csv = BOM + [headers, ...rows].map(row => row.join(',')).join('\n');
    console.log('[Store] 导出工单明细:', orders.length, '条');
    return csv;
  },

  exportStatistics: (): string => {
    const stats = get().statistics || defaultStatistics;
    let content = '=== 统计报表 ===\n\n';
    content += `总工单数量: ${stats.totalOrders}\n`;
    content += `待处理: ${stats.pendingOrders}\n`;
    content += `处理中: ${stats.processingOrders}\n`;
    content += `已完成: ${stats.completedOrders}\n`;
    content += `完成率: ${stats.completionRate}%\n\n`;
    content += `平均响应时间: ${stats.avgResponseTime}分钟\n`;
    content += `平均完成时间: ${Math.floor(stats.avgCompleteTime / 60)}小时${stats.avgCompleteTime % 60}分钟\n\n`;
    content += '--- 类型分布 ---\n';
    stats.typeStats.forEach(t => {
      content += `${t.typeName}: ${t.count} (${t.percentage}%)\n`;
    });
    content += '\n--- 月度趋势 ---\n';
    stats.monthlyStats.forEach(m => {
      content += `${m.month}: ${m.count}单\n`;
    });
    console.log('[Store] 导出统计报表');
    return content;
  }
}));

export default useAppStore;
