// 报修类型
export type RepairType = 'water_electric' | 'access_control' | 'elevator' | 'other';

// 工单状态
export type OrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'rated';

// 用户角色
export type UserRole = 'owner' | 'worker' | 'admin';

// 用户信息
export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar: string;
  address?: string;
}

// 工单进度节点
export interface OrderProgress {
  status: OrderStatus;
  time: string;
  description: string;
  operator?: string;
}

// 工单信息
export interface RepairOrder {
  id: string;
  orderNo: string;
  type: RepairType;
  typeName: string;
  description: string;
  images: string[];
  urgent: boolean;
  status: OrderStatus;
  statusName: string;
  ownerName: string;
  ownerPhone: string;
  address: string;
  submitTime: string;
  assignTime?: string;
  acceptTime?: string;
  completeTime?: string;
  rateTime?: string;
  workerName?: string;
  workerPhone?: string;
  repairDescription?: string;
  repairImages: string[];
  rating?: number;
  ratingContent?: string;
  progress: OrderProgress[];
}

// 统计数据
export interface StatisticsData {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  avgResponseTime: number;
  avgCompleteTime: number;
  typeStats: { type: RepairType; typeName: string; count: number }[];
  monthlyStats: { month: string; count: number }[];
}

// 报修类型配置
export const REPAIR_TYPES: { value: RepairType; label: string; icon: string }[] = [
  { value: 'water_electric', label: '水电维修', icon: '💡' },
  { value: 'access_control', label: '门禁维修', icon: '🔐' },
  { value: 'elevator', label: '电梯维修', icon: '🛗' },
  { value: 'other', label: '其他', icon: '🔧' }
];

// 工单状态配置
export const ORDER_STATUS: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: '待分配', color: '#ff7d00' },
  assigned: { label: '待接单', color: '#1677ff' },
  processing: { label: '维修中', color: '#722ed1' },
  completed: { label: '待评价', color: '#00b42a' },
  rated: { label: '已完成', color: '#86909c' }
};
