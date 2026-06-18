import { create } from 'zustand';
import { RepairOrder, UserInfo, UserRole, OrderStatus, RepairType, StatisticsData } from '@/types';
import { mockOrders, currentUser as mockUser, workers, generateOrderNo, mockStatistics } from '@/data/mockData';
import { orderApi, workerApi, statisticsApi } from '@/services/api';

interface AppState {
  orders: RepairOrder[];
  currentUser: UserInfo;
  workers: UserInfo[];
  statistics: StatisticsData;
  loading: boolean;

  switchRole: (role: UserRole) => void;
  refreshOrders: () => Promise<void>;
  refreshWorkers: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
  refreshAll: () => Promise<void>;
  getOrdersByRole: () => RepairOrder[];
  getOrdersByStatus: (status?: OrderStatus) => RepairOrder[];
  getOrderById: (id: string) => RepairOrder | undefined;
  submitRepair: (params: {
    type: RepairType;
    description: string;
    images: string[];
    urgent: boolean;
    typeName: string;
  }) => Promise<RepairOrder | null>;
  assignOrder: (orderId: string, workerId: string) => Promise<boolean>;
  acceptOrder: (orderId: string) => Promise<boolean>;
  departOrder: (orderId: string) => Promise<boolean>;
  startOrder: (orderId: string) => Promise<boolean>;
  completeOrder: (orderId: string, description: string, images: string[]) => Promise<boolean>;
  rateOrder: (orderId: string, rating: number, content: string) => Promise<boolean>;
  getStatistics: () => StatisticsData;
}

export const useAppStore = create<AppState>((set, get) => ({
  orders: [...mockOrders],
  currentUser: { ...mockUser },
  workers: [...workers],
  statistics: { ...mockStatistics },
  loading: false,

  switchRole: (role: UserRole) => {
    set(state => ({
      currentUser: { ...state.currentUser, role }
    }));
    console.log('[AppStore] 切换角色:', role);
    // 切换角色时刷新数据
    get().refreshOrders();
  },

  refreshOrders: async () => {
    try {
      let params: any = {};
      const state = get();
      if (state.currentUser.role === 'worker') {
        params.workerId = state.currentUser.id === 'worker001' ? undefined : undefined;
      }
      const result = await orderApi.getList(params);
      let list = result.list;
      
      // 按角色过滤（业主只能看自己的）
      if (state.currentUser.role === 'owner') {
        list = list.filter(o => o.ownerName === state.currentUser.name);
      }
      
      set({ orders: list });
      console.log('[AppStore] 刷新工单列表成功，共', list.length, '条');
    } catch (error) {
      console.error('[AppStore] 刷新工单列表失败:', error);
    }
  },

  refreshWorkers: async () => {
    try {
      const list = await workerApi.getList();
      set({ workers: list });
    } catch (error) {
      console.error('[AppStore] 刷新师傅列表失败:', error);
    }
  },

  refreshStatistics: async () => {
    try {
      const data = await statisticsApi.getOverview();
      set({ statistics: data });
    } catch (error) {
      console.error('[AppStore] 刷新统计数据失败:', error);
    }
  },

  refreshAll: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().refreshOrders(),
        get().refreshWorkers(),
        get().refreshStatistics()
      ]);
    } finally {
      set({ loading: false });
    }
  },

  getOrdersByRole: (): RepairOrder[] => {
    const state = get();
    const sorted = [...state.orders].sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime();
    });

    if (state.currentUser.role === 'owner') {
      return sorted.filter(o => o.ownerName === state.currentUser.name);
    } else if (state.currentUser.role === 'worker') {
      // 维修师傅看：分配给自己的 + 待分配的也可以抢单
      return sorted.filter(o => 
        o.workerName === state.currentUser.name || 
        o.workerId === state.currentUser.id ||
        o.status === 'pending' || 
        o.status === 'assigned'
      );
    }
    return sorted;
  },

  getOrdersByStatus: (status?: OrderStatus): RepairOrder[] => {
    const orders = get().getOrdersByRole();
    if (!status) return orders;
    return orders.filter(o => o.status === status);
  },

  getOrderById: (id: string): RepairOrder | undefined => {
    return get().orders.find(o => o.id === id);
  },

  submitRepair: async (params): Promise<RepairOrder | null> => {
    const state = get();
    try {
      const newOrder = await orderApi.create({
        type: params.type,
        typeName: params.typeName,
        description: params.description,
        images: params.images,
        urgent: params.urgent,
        ownerName: state.currentUser.name,
        ownerPhone: state.currentUser.phone,
        address: state.currentUser.address || ''
      });
      
      set(s => ({
        orders: [newOrder, ...s.orders]
      }));
      
      console.log('[AppStore] 提交报修成功:', newOrder.orderNo);
      return newOrder;
    } catch (error) {
      console.error('[AppStore] 提交报修失败:', error);
      // 兜底使用本地mock方式
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const fallbackOrder: RepairOrder = {
        id: `order_${Date.now()}`,
        orderNo: generateOrderNo(),
        type: params.type,
        typeName: params.typeName,
        description: params.description,
        images: params.images,
        urgent: params.urgent,
        status: 'pending',
        statusName: '待分配',
        ownerName: state.currentUser.name,
        ownerPhone: state.currentUser.phone,
        address: state.currentUser.address || '',
        submitTime: now,
        repairImages: [],
        progress: [{ status: 'pending', time: now, description: params.urgent ? '紧急工单已提交，等待优先处理' : '工单已提交，等待分配', operator: state.currentUser.name }]
      };
      set(s => ({ orders: [fallbackOrder, ...s.orders] }));
      return fallbackOrder;
    }
  },

  assignOrder: async (orderId: string, workerId: string): Promise<boolean> => {
    try {
      const updatedOrder = await orderApi.assign(orderId, workerId, get().currentUser.name);
      set(s => ({
        orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)
      }));
      console.log('[AppStore] 分配工单成功');
      return true;
    } catch (error) {
      console.error('[AppStore] 分配工单失败:', error);
      return false;
    }
  },

  acceptOrder: async (orderId: string): Promise<boolean> => {
    try {
      const updatedOrder = await orderApi.accept(orderId);
      set(s => ({
        orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)
      }));
      console.log('[AppStore] 接单成功');
      return true;
    } catch (error) {
      console.error('[AppStore] 接单失败:', error);
      return false;
    }
  },

  departOrder: async (orderId: string): Promise<boolean> => {
    try {
      const updatedOrder = await orderApi.depart(orderId);
      set(s => ({
        orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)
      }));
      console.log('[AppStore] 出发成功');
      return true;
    } catch (error) {
      console.error('[AppStore] 出发失败:', error);
      return false;
    }
  },

  startOrder: async (orderId: string): Promise<boolean> => {
    try {
      const updatedOrder = await orderApi.start(orderId);
      set(s => ({
        orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)
      }));
      console.log('[AppStore] 开始维修成功');
      return true;
    } catch (error) {
      console.error('[AppStore] 开始维修失败:', error);
      return false;
    }
  },

  completeOrder: async (orderId: string, description: string, images: string[]): Promise<boolean> => {
    try {
      const updatedOrder = await orderApi.complete(orderId, { repairDescription: description, repairImages: images });
      set(s => ({
        orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)
      }));
      console.log('[AppStore] 完工成功');
      return true;
    } catch (error) {
      console.error('[AppStore] 完工失败:', error);
      return false;
    }
  },

  rateOrder: async (orderId: string, rating: number, content: string): Promise<boolean> => {
    try {
      const updatedOrder = await orderApi.rate(orderId, rating, content);
      set(s => ({
        orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)
      }));
      console.log('[AppStore] 评价成功');
      return true;
    } catch (error) {
      console.error('[AppStore] 评价失败:', error);
      return false;
    }
  },

  getStatistics: (): StatisticsData => {
    return get().statistics;
  }
}));

export default useAppStore;
