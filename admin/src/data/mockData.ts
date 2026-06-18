import { RepairOrder, UserInfo, StatisticsData, REPAIR_TYPES, ORDER_STATUS } from '@/types';

// 当前用户（模拟登录状态）
export const currentUser: UserInfo = {
  id: 'admin001',
  name: '管理员小王',
  phone: '13000000001',
  role: 'admin',
  avatar: 'https://picsum.photos/id/1005/200/200'
};

// 维修师傅列表
export const workers: UserInfo[] = [
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

// 生成工单编号
export const generateOrderNo = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WD${year}${month}${day}${random}`;
};

// 模拟工单数据
export const mockOrders: RepairOrder[] = [
  {
    id: 'order001',
    orderNo: 'WD202606190001',
    type: 'water_electric',
    typeName: '水电维修',
    description: '厨房水龙头漏水严重，需要尽快维修，已经影响正常使用了',
    images: [
      'https://picsum.photos/id/292/600/400',
      'https://picsum.photos/id/312/600/400'
    ],
    urgent: true,
    status: 'processing',
    statusName: ORDER_STATUS.processing.label,
    ownerName: '张先生',
    ownerPhone: '13800138000',
    address: '阳光花园小区1栋2单元301室',
    submitTime: '2026-06-19 08:30:00',
    assignTime: '2026-06-19 08:45:00',
    acceptTime: '2026-06-19 09:00:00',
    workerName: '李师傅',
    workerPhone: '13900139001',
    workerId: 'worker001',
    repairImages: [],
    progress: [
      { status: 'pending', time: '2026-06-19 08:30:00', description: '工单已提交，等待分配', operator: '张先生' },
      { status: 'assigned', time: '2026-06-19 08:45:00', description: '工单已分配给李师傅', operator: '客服小王' },
      { status: 'processing', time: '2026-06-19 09:00:00', description: '李师傅已接单，正在前往维修', operator: '李师傅' }
    ]
  },
  {
    id: 'order002',
    orderNo: 'WD202606180023',
    type: 'access_control',
    typeName: '门禁维修',
    description: '单元门门禁刷卡没反应，按门铃也不响，进出很不方便',
    images: [
      'https://picsum.photos/id/160/600/400'
    ],
    urgent: false,
    status: 'rated',
    statusName: ORDER_STATUS.rated.label,
    ownerName: '刘女士',
    ownerPhone: '13800138002',
    address: '阳光花园小区2栋1单元101室',
    submitTime: '2026-06-18 14:20:00',
    assignTime: '2026-06-18 14:35:00',
    acceptTime: '2026-06-18 15:00:00',
    completeTime: '2026-06-18 16:30:00',
    rateTime: '2026-06-18 19:00:00',
    workerName: '王师傅',
    workerPhone: '13900139002',
    workerId: 'worker002',
    repairDescription: '更换了门禁读卡器和门铃按钮，已测试正常使用',
    repairImages: [
      'https://picsum.photos/id/201/600/400'
    ],
    rating: 5,
    ratingContent: '师傅很专业，维修速度快，非常满意！',
    progress: [
      { status: 'pending', time: '2026-06-18 14:20:00', description: '工单已提交，等待分配', operator: '刘女士' },
      { status: 'assigned', time: '2026-06-18 14:35:00', description: '工单已分配给王师傅', operator: '客服小王' },
      { status: 'processing', time: '2026-06-18 15:00:00', description: '王师傅已接单，开始维修', operator: '王师傅' },
      { status: 'completed', time: '2026-06-18 16:30:00', description: '维修完成，请确认', operator: '王师傅' },
      { status: 'rated', time: '2026-06-18 19:00:00', description: '业主已评价（5星）', operator: '刘女士' }
    ]
  },
  {
    id: 'order003',
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
    acceptTime: '2026-06-17 10:30:00',
    completeTime: '2026-06-17 14:00:00',
    rateTime: '2026-06-17 18:30:00',
    workerName: '赵师傅',
    workerPhone: '13900139003',
    workerId: 'worker003',
    repairDescription: '电梯钢丝绳磨损，已更换新的钢丝绳并做了全面安全检查',
    repairImages: [
      'https://picsum.photos/id/3/600/400'
    ],
    rating: 5,
    ratingContent: '师傅很专业，维修速度快，解释也很清楚，非常满意！',
    progress: [
      { status: 'pending', time: '2026-06-17 10:00:00', description: '工单已提交，等待分配', operator: '陈先生' },
      { status: 'assigned', time: '2026-06-17 10:10:00', description: '紧急工单，立即分配给赵师傅', operator: '客服主管' },
      { status: 'processing', time: '2026-06-17 10:30:00', description: '赵师傅已到达现场，开始检修', operator: '赵师傅' },
      { status: 'completed', time: '2026-06-17 14:00:00', description: '维修完成，电梯恢复正常运行', operator: '赵师傅' },
      { status: 'rated', time: '2026-06-17 18:30:00', description: '业主已评价（5星）', operator: '陈先生' }
    ]
  },
  {
    id: 'order004',
    orderNo: 'WD202606190012',
    type: 'other',
    typeName: '其他',
    description: '楼道灯不亮了，晚上回家很黑不方便',
    images: [
      'https://picsum.photos/id/1/600/400'
    ],
    urgent: false,
    status: 'pending',
    statusName: ORDER_STATUS.pending.label,
    ownerName: '周女士',
    ownerPhone: '13800138004',
    address: '阳光花园小区5栋2单元',
    submitTime: '2026-06-19 19:30:00',
    repairImages: [],
    progress: [
      { status: 'pending', time: '2026-06-19 19:30:00', description: '工单已提交，等待分配', operator: '周女士' }
    ]
  },
  {
    id: 'order005',
    orderNo: 'WD202606190008',
    type: 'water_electric',
    typeName: '水电维修',
    description: '客厅插座没电，插了电器没反应',
    images: [],
    urgent: false,
    status: 'assigned',
    statusName: ORDER_STATUS.assigned.label,
    ownerName: '吴先生',
    ownerPhone: '13800138005',
    address: '阳光花园小区4栋1单元502室',
    submitTime: '2026-06-19 15:00:00',
    assignTime: '2026-06-19 15:20:00',
    workerName: '李师傅',
    workerPhone: '13900139001',
    workerId: 'worker001',
    repairImages: [],
    progress: [
      { status: 'pending', time: '2026-06-19 15:00:00', description: '工单已提交，等待分配', operator: '吴先生' },
      { status: 'assigned', time: '2026-06-19 15:20:00', description: '工单已分配给李师傅', operator: '客服小王' }
    ]
  },
  {
    id: 'order006',
    orderNo: 'WD202606160078',
    type: 'access_control',
    typeName: '门禁维修',
    description: '地下车库门禁坏了，遥控器打不开',
    images: [
      'https://picsum.photos/id/9/600/400'
    ],
    urgent: false,
    status: 'rated',
    statusName: ORDER_STATUS.rated.label,
    ownerName: '郑先生',
    ownerPhone: '13800138006',
    address: '阳光花园小区2栋地下车库',
    submitTime: '2026-06-16 09:00:00',
    assignTime: '2026-06-16 09:15:00',
    acceptTime: '2026-06-16 09:45:00',
    completeTime: '2026-06-16 11:30:00',
    rateTime: '2026-06-16 20:00:00',
    workerName: '王师傅',
    workerPhone: '13900139002',
    workerId: 'worker002',
    repairDescription: '门禁接收器故障，已更换新设备',
    repairImages: [
      'https://picsum.photos/id/119/600/400'
    ],
    rating: 4,
    ratingContent: '维修得不错，就是上门稍微慢了点',
    progress: [
      { status: 'pending', time: '2026-06-16 09:00:00', description: '工单已提交，等待分配', operator: '郑先生' },
      { status: 'assigned', time: '2026-06-16 09:15:00', description: '工单已分配给王师傅', operator: '客服小王' },
      { status: 'processing', time: '2026-06-16 09:45:00', description: '王师傅已到达，开始维修', operator: '王师傅' },
      { status: 'completed', time: '2026-06-16 11:30:00', description: '维修完成', operator: '王师傅' },
      { status: 'rated', time: '2026-06-16 20:00:00', description: '业主已评价（4星）', operator: '郑先生' }
    ]
  },
  {
    id: 'order007',
    orderNo: 'WD202606150056',
    type: 'water_electric',
    typeName: '水电维修',
    description: '卫生间水龙头水流很小，可能是堵了',
    images: [],
    urgent: false,
    status: 'rated',
    statusName: ORDER_STATUS.rated.label,
    ownerName: '孙女士',
    ownerPhone: '13800138007',
    address: '阳光花园小区6栋1单元201室',
    submitTime: '2026-06-15 11:00:00',
    assignTime: '2026-06-15 11:20:00',
    acceptTime: '2026-06-15 14:00:00',
    completeTime: '2026-06-15 15:00:00',
    rateTime: '2026-06-15 19:30:00',
    workerName: '赵师傅',
    workerPhone: '13900139003',
    workerId: 'worker003',
    repairDescription: '水龙头过滤网堵塞，已清洗过滤网，水流恢复正常',
    repairImages: [],
    rating: 5,
    ratingContent: '服务态度好，技术专业，推荐！',
    progress: [
      { status: 'pending', time: '2026-06-15 11:00:00', description: '工单已提交，等待分配', operator: '孙女士' },
      { status: 'assigned', time: '2026-06-15 11:20:00', description: '工单已分配给赵师傅', operator: '客服小王' },
      { status: 'processing', time: '2026-06-15 14:00:00', description: '赵师傅已到达，开始检修', operator: '赵师傅' },
      { status: 'completed', time: '2026-06-15 15:00:00', description: '维修完成', operator: '赵师傅' },
      { status: 'rated', time: '2026-06-15 19:30:00', description: '业主已评价（5星）', operator: '孙女士' }
    ]
  },
  {
    id: 'order008',
    orderNo: 'WD202606190025',
    type: 'elevator',
    typeName: '电梯维修',
    description: '2号电梯按钮按了没反应，楼层显示也不对',
    images: [
      'https://picsum.photos/id/8/600/400'
    ],
    urgent: true,
    status: 'pending',
    statusName: ORDER_STATUS.pending.label,
    ownerName: '黄先生',
    ownerPhone: '13800138008',
    address: '阳光花园小区2栋2单元',
    submitTime: '2026-06-19 20:00:00',
    repairImages: [],
    progress: [
      { status: 'pending', time: '2026-06-19 20:00:00', description: '紧急工单已提交，等待优先处理', operator: '黄先生' }
    ]
  },
  {
    id: 'order009',
    orderNo: 'WD202606140012',
    type: 'water_electric',
    typeName: '水电维修',
    description: '厨房下水道堵塞，水下不去',
    images: [],
    urgent: false,
    status: 'rated',
    statusName: ORDER_STATUS.rated.label,
    ownerName: '林女士',
    ownerPhone: '13800138009',
    address: '阳光花园小区3栋1单元402室',
    submitTime: '2026-06-14 10:00:00',
    assignTime: '2026-06-14 10:15:00',
    acceptTime: '2026-06-14 11:00:00',
    completeTime: '2026-06-14 12:30:00',
    rateTime: '2026-06-14 18:00:00',
    workerName: '李师傅',
    workerPhone: '13900139001',
    workerId: 'worker001',
    repairDescription: '下水道油污堵塞，已疏通',
    repairImages: [],
    rating: 4,
    ratingContent: '维修及时，服务好',
    progress: [
      { status: 'pending', time: '2026-06-14 10:00:00', description: '工单已提交，等待分配', operator: '林女士' },
      { status: 'assigned', time: '2026-06-14 10:15:00', description: '工单已分配给李师傅', operator: '客服小王' },
      { status: 'processing', time: '2026-06-14 11:00:00', description: '李师傅已到达，开始维修', operator: '李师傅' },
      { status: 'completed', time: '2026-06-14 12:30:00', description: '维修完成', operator: '李师傅' },
      { status: 'rated', time: '2026-06-14 18:00:00', description: '业主已评价（4星）', operator: '林女士' }
    ]
  },
  {
    id: 'order010',
    orderNo: 'WD202606130089',
    type: 'other',
    typeName: '其他',
    description: '公共区域墙面瓷砖脱落，存在安全隐患',
    images: [
      'https://picsum.photos/id/787/600/400'
    ],
    urgent: false,
    status: 'rated',
    statusName: ORDER_STATUS.rated.label,
    ownerName: '何先生',
    ownerPhone: '13800138010',
    address: '阳光花园小区1栋1单元楼道',
    submitTime: '2026-06-13 16:00:00',
    assignTime: '2026-06-13 16:20:00',
    acceptTime: '2026-06-14 09:00:00',
    completeTime: '2026-06-14 11:00:00',
    rateTime: '2026-06-14 15:00:00',
    workerName: '张师傅',
    workerPhone: '13900139004',
    workerId: 'worker004',
    repairDescription: '已重新粘贴墙面瓷砖，并检查了其他区域',
    repairImages: [
      'https://picsum.photos/id/1082/600/400'
    ],
    rating: 5,
    ratingContent: '处理及时，消除了安全隐患，非常好',
    progress: [
      { status: 'pending', time: '2026-06-13 16:00:00', description: '工单已提交，等待分配', operator: '何先生' },
      { status: 'assigned', time: '2026-06-13 16:20:00', description: '工单已分配给张师傅', operator: '客服小王' },
      { status: 'processing', time: '2026-06-14 09:00:00', description: '张师傅已到达，开始维修', operator: '张师傅' },
      { status: 'completed', time: '2026-06-14 11:00:00', description: '维修完成', operator: '张师傅' },
      { status: 'rated', time: '2026-06-14 15:00:00', description: '业主已评价（5星）', operator: '何先生' }
    ]
  }
];

// 统计数据
export const mockStatistics: StatisticsData = {
  totalOrders: 156,
  pendingOrders: 8,
  processingOrders: 5,
  completedOrders: 143,
  avgResponseTime: 25,
  avgCompleteTime: 180,
  completionRate: 91.7,
  typeStats: [
    { type: 'water_electric', typeName: '水电维修', count: 68, percentage: 43.6 },
    { type: 'access_control', typeName: '门禁维修', count: 35, percentage: 22.4 },
    { type: 'elevator', typeName: '电梯维修', count: 22, percentage: 14.1 },
    { type: 'other', typeName: '其他', count: 31, percentage: 19.9 }
  ],
  monthlyStats: [
    { month: '1月', count: 18 },
    { month: '2月', count: 15 },
    { month: '3月', count: 22 },
    { month: '4月', count: 20 },
    { month: '5月', count: 28 },
    { month: '6月', count: 53 }
  ],
  responseTimeDistribution: [
    { range: '0-15分钟', count: 89 },
    { range: '15-30分钟', count: 42 },
    { range: '30-60分钟', count: 18 },
    { range: '1小时以上', count: 7 }
  ]
};
