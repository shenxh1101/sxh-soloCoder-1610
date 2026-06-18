import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RepairOrder, OrderStatus, RepairType, ORDER_STATUS } from '../types';
import { readOrders, writeOrders, readWorkers, generateOrderNo, now } from '../data/store';

const router = Router();

// 获取工单列表（支持筛选）
router.get('/', (req: Request, res: Response) => {
  try {
    const { 
      status = 'all', 
      type = 'all', 
      urgent = 'false',
      keyword = '',
      workerId
    } = req.query;
    
    let orders = readOrders();
    
    // 状态筛选
    if (status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }
    
    // 类型筛选
    if (type !== 'all') {
      orders = orders.filter(o => o.type === type);
    }
    
    // 紧急筛选
    if (urgent === 'true') {
      orders = orders.filter(o => o.urgent);
    }
    
    // 关键词搜索
    if (keyword) {
      const kw = String(keyword).toLowerCase();
      orders = orders.filter(o => 
        o.orderNo.toLowerCase().includes(kw) ||
        o.ownerName.toLowerCase().includes(kw) ||
        o.description.toLowerCase().includes(kw) ||
        o.address.toLowerCase().includes(kw)
      );
    }
    
    // 维修师傅筛选
    if (workerId) {
      orders = orders.filter(o => o.workerId === workerId);
    }
    
    // 排序：紧急优先，按提交时间倒序
    orders.sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime();
    });
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: orders,
        total: orders.length
      }
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    res.status(500).json({ code: 500, message: '获取工单列表失败' });
  }
});

// 获取工单详情
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orders = readOrders();
    const order = orders.find(o => o.id === id);
    
    if (!order) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: order
    });
  } catch (error) {
    console.error('获取工单详情失败:', error);
    res.status(500).json({ code: 500, message: '获取工单详情失败' });
  }
});

// 创建工单（业主提交报修）
router.post('/', (req: Request, res: Response) => {
  try {
    const { 
      type, 
      typeName, 
      description, 
      images = [], 
      urgent = false,
      ownerName,
      ownerPhone,
      address
    } = req.body;
    
    if (!type || !description || !ownerName || !ownerPhone || !address) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    const orders = readOrders();
    const orderNo = generateOrderNo();
    const submitTime = now();
    
    const newOrder: RepairOrder = {
      id: uuidv4(),
      orderNo,
      type: type as RepairType,
      typeName,
      description,
      images,
      urgent: Boolean(urgent),
      status: 'pending',
      statusName: ORDER_STATUS.pending.label,
      ownerName,
      ownerPhone,
      address,
      submitTime,
      repairImages: [],
      progress: [
        {
          status: 'pending',
          time: submitTime,
          description: urgent ? '紧急工单已提交，等待优先处理' : '工单已提交，等待分配',
          operator: ownerName
        }
      ]
    };
    
    orders.unshift(newOrder);
    writeOrders(orders);
    
    console.log('[API] 工单已创建:', orderNo);
    
    res.json({
      code: 0,
      message: '提交成功',
      data: newOrder
    });
  } catch (error) {
    console.error('创建工单失败:', error);
    res.status(500).json({ code: 500, message: '创建工单失败' });
  }
});

// 分配工单（客服分配给维修师傅）
router.put('/:id/assign', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workerId, operatorName = '客服' } = req.body;
    
    if (!workerId) {
      return res.status(400).json({ code: 400, message: '缺少维修师傅ID' });
    }
    
    const orders = readOrders();
    const workers = readWorkers();
    const orderIndex = orders.findIndex(o => o.id === id);
    const worker = workers.find(w => w.id === workerId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }
    
    if (!worker) {
      return res.status(400).json({ code: 400, message: '维修师傅不存在' });
    }
    
    const order = orders[orderIndex];
    if (order.status !== 'pending') {
      return res.status(400).json({ code: 400, message: '工单状态不允许分配' });
    }
    
    const assignTime = now();
    const updatedOrder: RepairOrder = {
      ...order,
      status: 'assigned',
      statusName: ORDER_STATUS.assigned.label,
      assignTime,
      workerId: worker.id,
      workerName: worker.name,
      workerPhone: worker.phone,
      progress: [
        ...order.progress,
        {
          status: 'assigned',
          time: assignTime,
          description: `工单已分配给${worker.name}`,
          operator: operatorName
        }
      ]
    };
    
    orders[orderIndex] = updatedOrder;
    writeOrders(orders);
    
    console.log('[API] 工单已分配:', order.orderNo, '给', worker.name);
    
    res.json({
      code: 0,
      message: '分配成功',
      data: updatedOrder
    });
  } catch (error) {
    console.error('分配工单失败:', error);
    res.status(500).json({ code: 500, message: '分配工单失败' });
  }
});

// 接单（维修师傅）
router.put('/:id/accept', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }
    
    const order = orders[orderIndex];
    if (order.status !== 'assigned') {
      return res.status(400).json({ code: 400, message: '工单状态不允许接单' });
    }
    
    const acceptTime = now();
    const updatedOrder: RepairOrder = {
      ...order,
      status: 'processing',
      statusName: ORDER_STATUS.processing.label,
      acceptTime,
      progress: [
        ...order.progress,
        {
          status: 'processing',
          time: acceptTime,
          description: `${order.workerName}已接单，正在前往维修`,
          operator: order.workerName
        }
      ]
    };
    
    orders[orderIndex] = updatedOrder;
    writeOrders(orders);
    
    console.log('[API] 工单已接单:', order.orderNo);
    
    res.json({
      code: 0,
      message: '接单成功',
      data: updatedOrder
    });
  } catch (error) {
    console.error('接单失败:', error);
    res.status(500).json({ code: 500, message: '接单失败' });
  }
});

// 完工（维修师傅）
router.put('/:id/complete', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { repairDescription = '', repairImages = [] } = req.body;
    
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }
    
    const order = orders[orderIndex];
    if (order.status !== 'processing') {
      return res.status(400).json({ code: 400, message: '工单状态不允许完工' });
    }
    
    const completeTime = now();
    const updatedOrder: RepairOrder = {
      ...order,
      status: 'completed',
      statusName: ORDER_STATUS.completed.label,
      completeTime,
      repairDescription,
      repairImages,
      progress: [
        ...order.progress,
        {
          status: 'completed',
          time: completeTime,
          description: '维修完成，请确认',
          operator: order.workerName
        }
      ]
    };
    
    orders[orderIndex] = updatedOrder;
    writeOrders(orders);
    
    console.log('[API] 工单已完工:', order.orderNo);
    
    res.json({
      code: 0,
      message: '完工成功',
      data: updatedOrder
    });
  } catch (error) {
    console.error('完工失败:', error);
    res.status(500).json({ code: 500, message: '完工失败' });
  }
});

// 评价（业主）
router.put('/:id/rate', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, ratingContent = '' } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ code: 400, message: '评分无效' });
    }
    
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }
    
    const order = orders[orderIndex];
    if (order.status !== 'completed') {
      return res.status(400).json({ code: 400, message: '工单状态不允许评价' });
    }
    
    const rateTime = now();
    const updatedOrder: RepairOrder = {
      ...order,
      status: 'rated',
      statusName: ORDER_STATUS.rated.label,
      rateTime,
      rating: Number(rating),
      ratingContent,
      progress: [
        ...order.progress,
        {
          status: 'rated',
          time: rateTime,
          description: `业主已评价（${rating}星）`,
          operator: order.ownerName
        }
      ]
    };
    
    orders[orderIndex] = updatedOrder;
    writeOrders(orders);
    
    console.log('[API] 工单已评价:', order.orderNo, rating, '星');
    
    res.json({
      code: 0,
      message: '评价成功',
      data: updatedOrder
    });
  } catch (error) {
    console.error('评价失败:', error);
    res.status(500).json({ code: 500, message: '评价失败' });
  }
});

export default router;
