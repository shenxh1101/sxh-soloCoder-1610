import { create } from 'zustand';
import { RepairOrder, UserInfo, UserRole, OrderStatus, RepairType } from '@/types';
import { mockOrders, currentUser as mockUser, workers, generateOrderNo, mockStatistics, StatisticsData } from '@/data/mockData';

interface AppState {
  orders: RepairOrder[];
  currentUser: UserInfo;
  workers: UserInfo[];
  
  switchRole: (role: UserRole) => void;
  getOrdersByRole: () => RepairOrder[];
  getOrdersByStatus: (status?: OrderStatus) => RepairOrder[];
  getOrderById: (id: string) => RepairOrder | undefined;
  submitRepair: (params: {
    type: RepairType;
    description: string;
    images: string[];
    urgent: boolean;
    typeName: string;
  }) => RepairOrder;
  assignOrder: (orderId: string, workerId: string) => boolean;
  acceptOrder: (orderId: string) => boolean;
  completeOrder: (orderId: string, description: string, images: string[]) => boolean;
  rateOrder: (orderId: string, rating: number, content: string) => boolean;
  getStatistics: () => StatisticsData;
}

export const useAppStore = create<AppState>((set, get) => ({
  orders: [...mockOrders],
  currentUser: { ...mockUser },
  workers: [...workers],

  switchRole: (role: UserRole) => {
    set(state => ({
      currentUser: { ...state.currentUser, role }
    }));
    console.log('[AppStore] 切换角色:', role);
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
      return sorted.filter(o => 
        o.workerName === state.currentUser.name || 
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

  submitRepair: (params): RepairOrder => {
    const state = get();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newOrder: RepairOrder = {
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
      progress: [
        {
          status: 'pending',
          time: now,
          description: params.urgent ? '紧急工单已提交，等待优先处理' : '工单已提交，等待分配',
          operator: state.currentUser.name
        }
      ]
    };
    set(state => ({
      orders: [newOrder, ...state.orders]
    }));
    console.log('[AppStore] 提交报修:', newOrder.orderNo);
    return newOrder;
  },

  assignOrder: (orderId: string, workerId: string): boolean => {
    const state = get();
    const orderIndex = state.orders.findIndex(o => o.id === orderId);
    const worker = state.workers.find(w => w.id === workerId);
    if (orderIndex === -1 || !worker) return false;
    
    const order = state.orders[orderIndex];
    if (order.status !== 'pending') return false;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedOrder = {
      ...order,
      status: 'assigned' as OrderStatus,
      statusName: '待接单',
      assignTime: now,
      workerName: worker.name,
      workerPhone: worker.phone,
      progress: [
        ...order.progress,
        {
          status: 'assigned' as OrderStatus,
          time: now,
          description: `工单已分配给${worker.name}`,
          operator: '客服'
        }
      ]
    };

    const newOrders = [...state.orders];
    newOrders[orderIndex] = updatedOrder;
    set({ orders: newOrders });
    console.log('[AppStore] 分配工单:', order.orderNo, '给', worker.name);
    return true;
  },

  acceptOrder: (orderId: string): boolean => {
    const state = get();
    const orderIndex = state.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;
    
    const order = state.orders[orderIndex];
    if (order.status !== 'assigned' && order.status !== 'pending') return false;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedOrder = {
      ...order,
      status: 'processing' as OrderStatus,
      statusName: '维修中',
      acceptTime: now,
      workerName: order.workerName || state.currentUser.name,
      workerPhone: order.workerPhone || state.currentUser.phone,
      progress: [
        ...order.progress,
        {
          status: 'processing' as OrderStatus,
          time: now,
          description: `${state.currentUser.name}已接单，正在前往维修`,
          operator: state.currentUser.name
        }
      ]
    };

    const newOrders = [...state.orders];
    newOrders[orderIndex] = updatedOrder;
    set({ orders: newOrders });
    console.log('[AppStore] 接单:', order.orderNo);
    return true;
  },

  completeOrder: (orderId: string, description: string, images: string[]): boolean => {
    const state = get();
    const orderIndex = state.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;
    
    const order = state.orders[orderIndex];
    if (order.status !== 'processing') return false;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedOrder = {
      ...order,
      status: 'completed' as OrderStatus,
      statusName: '待评价',
      completeTime: now,
      repairDescription: description,
      repairImages: images,
      progress: [
        ...order.progress,
        {
          status: 'completed' as OrderStatus,
          time: now,
          description: '维修完成，请业主确认',
          operator: state.currentUser.name
        }
      ]
    };

    const newOrders = [...state.orders];
    newOrders[orderIndex] = updatedOrder;
    set({ orders: newOrders });
    console.log('[AppStore] 完工:', order.orderNo);
    return true;
  },

  rateOrder: (orderId: string, rating: number, content: string): boolean => {
    const state = get();
    const orderIndex = state.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;
    
    const order = state.orders[orderIndex];
    if (order.status !== 'completed') return false;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedOrder = {
      ...order,
      status: 'rated' as OrderStatus,
      statusName: '已完成',
      rateTime: now,
      rating,
      ratingContent: content,
      progress: [
        ...order.progress,
        {
          status: 'rated' as OrderStatus,
          time: now,
          description: `业主已评价（${rating}星）`,
          operator: state.currentUser.name
        }
      ]
    };

    const newOrders = [...state.orders];
    newOrders[orderIndex] = updatedOrder;
    set({ orders: newOrders });
    console.log('[AppStore] 评价:', order.orderNo, rating, '星');
    return true;
  },

  getStatistics: (): StatisticsData => {
    return { ...mockStatistics };
  }
}));

export default useAppStore;
