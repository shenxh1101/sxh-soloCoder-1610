import fs from 'fs';
import path from 'path';
import { RepairOrder, UserInfo, ORDER_STATUS, REPAIR_TYPES } from '../types';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(__dirname, '../../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const WORKERS_FILE = path.join(DATA_DIR, 'workers.json');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 生成工单编号
export function generateOrderNo(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WD${year}${month}${day}${random}`;
}

// 获取当前时间字符串
export function now(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// 默认维修师傅数据
const defaultWorkers: UserInfo[] = [
  {
    id: 'worker001',
    name: '李师傅',
    phone: '13900139001',
    role: 'worker',
    avatar: 'https://picsum.photos/id/1012/200/200'
  },
  {
    id: 'worker002',
    name: '王师傅',
    phone: '13900139002',
    role: 'worker',
    avatar: 'https://picsum.photos/id/1025/200/200'
  },
  {
    id: 'worker003',
    name: '赵师傅',
    phone: '13900139003',
    role: 'worker',
    avatar: 'https://picsum.photos/id/1074/200/200'
  },
  {
    id: 'worker004',
    name: '张师傅',
    phone: '13900139004',
    role: 'worker',
    avatar: 'https://picsum.photos/id/1062/200/200'
  }
];

// 默认工单数据
const defaultOrders: RepairOrder[] = [
  {
    id: uuidv4(),
    orderNo: 'WD202606190001',
    type: 'water_electric',
    typeName: '水电维修',
    description: '厨房水龙头漏水严重，需要尽快维修，已经影响正常使用了',
    images: ['https://picsum.photos/id/292/600/400', 'https://picsum.photos/id/312/600/400'],
    urgent: true,
    status: 'departed',
    statusName: ORDER_STATUS.departed.label,
    ownerName: '张先生',
    ownerPhone: '13800138000',
    address: '阳光花园小区1栋2单元301室',
    submitTime: '2026-06-19 08:30:00',
    assignTime: '2026-06-19 08:45:00',
    acceptTime: '2026-06-19 08:50:00',
    departTime: '2026-06-19 09:00:00',
    workerName: '李师傅',
    workerPhone: '13900139001',
    workerId: 'worker001',
    repairImages: [],
    progress: [
      { status: 'pending', time: '2026-06-19 08:30:00', description: '紧急工单已提交，等待优先处理', operator: '张先生' },
      { status: 'assigned', time: '2026-06-19 08:45:00', description: '工单已分配给李师傅', operator: '客服小王' },
      { status: 'accepted', time: '2026-06-19 08:50:00', description: '李师傅已接单，请等待出发', operator: '李师傅' },
      { status: 'departed', time: '2026-06-19 09:00:00', description: '李师傅已出发，正在前往现场', operator: '李师傅' }
    ]
  },
  {
    id: uuidv4(),
    orderNo: 'WD202606190002',
    type: 'access_control',
    typeName: '门禁维修',
    description: '单元门门禁刷卡没反应，按门铃也不响，进出很不方便',
    images: ['https://picsum.photos/id/160/600/400'],
    urgent: false,
    status: 'assigned',
    statusName: ORDER_STATUS.assigned.label,
    ownerName: '周女士',
    ownerPhone: '13800138006',
    address: '阳光花园小区5栋2单元',
    submitTime: '2026-06-19 09:15:00',
    assignTime: '2026-06-19 09:30:00',
    workerName: '张师傅',
    workerPhone: '13900139004',
    workerId: 'worker004',
    repairImages: [],
    progress: [
      { status: 'pending', time: '2026-06-19 09:15:00', description: '工单已提交，等待分配', operator: '周女士' },
      { status: 'assigned', time: '2026-06-19 09:30:00', description: '工单已分配给张师傅', operator: '客服小王' }
    ]
  },
  {
    id: uuidv4(),
    orderNo: 'WD202606180023',
    type: 'access_control',
    typeName: '门禁维修',
    description: '单元门门禁刷卡没反应，按门铃也不响，进出很不方便',
    images: ['https://picsum.photos/id/160/600/400'],
    urgent: false,
    status: 'rated',
    statusName: ORDER_STATUS.rated.label,
    ownerName: '刘女士',
    ownerPhone: '13800138002',
    address: '阳光花园小区2栋1单元101室',
    submitTime: '2026-06-18 14:20:00',
    assignTime: '2026-06-18 14:35:00',
    acceptTime: '2026-06-18 14:40:00',
    departTime: '2026-06-18 14:50:00',
    completeTime: '2026-06-18 16:30:00',
    rateTime: '2026-06-18 19:00:00',
    workerName: '王师傅',
    workerPhone: '13900139002',
    workerId: 'worker002',
    repairDescription: '更换了门禁读卡器和门铃按钮，已测试正常使用',
    repairImages: ['https://picsum.photos/id/201/600/400'],
    rating: 5,
    ratingContent: '师傅很专业，维修速度快，非常满意！',
    progress: [
      { status: 'pending', time: '2026-06-18 14:20:00', description: '工单已提交，等待分配', operator: '刘女士' },
      { status: 'assigned', time: '2026-06-18 14:35:00', description: '工单已分配给王师傅', operator: '客服小王' },
      { status: 'accepted', time: '2026-06-18 14:40:00', description: '王师傅已接单，请等待出发', operator: '王师傅' },
      { status: 'departed', time: '2026-06-18 14:50:00', description: '王师傅已出发，正在前往现场', operator: '王师傅' },
      { status: 'processing', time: '2026-06-18 15:10:00', description: '王师傅已到达现场，开始维修', operator: '王师傅' },
      { status: 'completed', time: '2026-06-18 16:30:00', description: '维修完成，请确认', operator: '王师傅' },
      { status: 'rated', time: '2026-06-18 19:00:00', description: '业主已评价（5星）', operator: '刘女士' }
    ]
  },
  {
    id: uuidv4(),
    orderNo: 'WD202606170045',
    type: 'elevator',
    typeName: '电梯维修',
    description: '3号电梯运行时有异响，偶尔会出现停顿，感觉不太安全',
    images: [],
    urgent: true,
    status: 'rated',
    statusName: ORDER_STATUS.rated.label,
    ownerName: '陈先生',
    ownerPhone: '13800138003',
    address: '阳光花园小区3栋3单元',
    submitTime: '2026-06-17 10:00:00',
    assignTime: '2026-06-17 10:10:00',
    acceptTime: '2026-06-17 10:15:00',
    departTime: '2026-06-17 10:20:00',
    completeTime: '2026-06-17 14:00:00',
    rateTime: '2026-06-17 18:30:00',
    workerName: '赵师傅',
    workerPhone: '13900139003',
    workerId: 'worker003',
    repairDescription: '电梯钢丝绳磨损，已更换新的钢丝绳并做了全面安全检查',
    repairImages: ['https://picsum.photos/id/3/600/400'],
    rating: 5,
    ratingContent: '师傅很专业，维修速度快，解释也很清楚，非常满意！',
    progress: [
      { status: 'pending', time: '2026-06-17 10:00:00', description: '紧急工单已提交，等待优先处理', operator: '陈先生' },
      { status: 'assigned', time: '2026-06-17 10:10:00', description: '紧急工单，立即分配给赵师傅', operator: '客服主管' },
      { status: 'accepted', time: '2026-06-17 10:15:00', description: '赵师傅已接单，请等待出发', operator: '赵师傅' },
      { status: 'departed', time: '2026-06-17 10:20:00', description: '赵师傅已出发，正在前往现场', operator: '赵师傅' },
      { status: 'processing', time: '2026-06-17 10:40:00', description: '赵师傅已到达现场，开始检修', operator: '赵师傅' },
      { status: 'completed', time: '2026-06-17 14:00:00', description: '维修完成，电梯恢复正常运行', operator: '赵师傅' },
      { status: 'rated', time: '2026-06-17 18:30:00', description: '业主已评价（5星）', operator: '陈先生' }
    ]
  },
  {
    id: uuidv4(),
    orderNo: 'WD202606190003',
    type: 'other',
    typeName: '其他',
    description: '楼道灯不亮，晚上上下楼很不方便',
    images: ['https://picsum.photos/id/175/600/400'],
    urgent: false,
    status: 'pending',
    statusName: ORDER_STATUS.pending.label,
    ownerName: '吴先生',
    ownerPhone: '13800138007',
    address: '阳光花园小区4栋1单元',
    submitTime: '2026-06-19 09:45:00',
    repairImages: [],
    progress: [
      { status: 'pending', time: '2026-06-19 09:45:00', description: '工单已提交，等待分配', operator: '吴先生' }
    ]
  }
];

// 有效状态列表，用于检测旧数据
const VALID_STATUSES = ['pending', 'assigned', 'accepted', 'departed', 'processing', 'completed', 'rated'];

// 初始化数据文件
export function initData() {
  ensureDataDir();
  
  if (!fs.existsSync(WORKERS_FILE)) {
    fs.writeFileSync(WORKERS_FILE, JSON.stringify(defaultWorkers, null, 2), 'utf-8');
  }
  
  let needResetOrders = false;
  if (!fs.existsSync(ORDERS_FILE)) {
    needResetOrders = true;
  } else {
    // 检查现有数据状态是否支持新的状态系统，不支持则重置
    try {
      const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const existingOrders = JSON.parse(content);
      if (!Array.isArray(existingOrders) || existingOrders.some((o: any) => !VALID_STATUSES.includes(o.status))) {
        console.log('[Store] 检测到旧数据或损坏数据，正在重置工单...');
        needResetOrders = true;
      }
    } catch (e) {
      console.log('[Store] 工单数据读取失败，正在重置...');
      needResetOrders = true;
    }
  }
  
  if (needResetOrders) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(defaultOrders, null, 2), 'utf-8');
  }
}

// 读取工单列表
export function readOrders(): RepairOrder[] {
  initData();
  const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
  return JSON.parse(content);
}

// 写入工单列表
export function writeOrders(orders: RepairOrder[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

// 读取维修师傅列表
export function readWorkers(): UserInfo[] {
  initData();
  const content = fs.readFileSync(WORKERS_FILE, 'utf-8');
  return JSON.parse(content);
}
