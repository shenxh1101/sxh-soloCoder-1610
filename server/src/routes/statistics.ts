import { Router, Request, Response } from 'express';
import { StatisticsData, RepairType, REPAIR_TYPES } from '../types';
import { readOrders, readWorkers } from '../data/store';

const router = Router();

// 获取统计数据
router.get('/', (req: Request, res: Response) => {
  try {
    const orders = readOrders();
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'assigned').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const completedOrders = orders.filter(o => o.status === 'rated').length;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100 * 10) / 10 : 0;
    
    // 计算平均响应时间（提交到接单）
    const acceptedOrders = orders.filter(o => o.acceptTime && o.submitTime);
    let avgResponseTime = 0;
    if (acceptedOrders.length > 0) {
      const totalResponseTime = acceptedOrders.reduce((sum, o) => {
        const submit = new Date(o.submitTime).getTime();
        const accept = new Date(o.acceptTime!).getTime();
        return sum + (accept - submit) / (1000 * 60); // 分钟
      }, 0);
      avgResponseTime = Math.round(totalResponseTime / acceptedOrders.length);
    }
    
    // 计算平均完成时间（提交到完成）
    const finishedOrders = orders.filter(o => o.completeTime && o.submitTime);
    let avgCompleteTime = 0;
    if (finishedOrders.length > 0) {
      const totalCompleteTime = finishedOrders.reduce((sum, o) => {
        const submit = new Date(o.submitTime).getTime();
        const complete = new Date(o.completeTime!).getTime();
        return sum + (complete - submit) / (1000 * 60); // 分钟
      }, 0);
      avgCompleteTime = Math.round(totalCompleteTime / finishedOrders.length);
    }
    
    // 类型统计
    const typeStats = REPAIR_TYPES.map(type => {
      const count = orders.filter(o => o.type === type.value).length;
      const percentage = totalOrders > 0 ? Math.round((count / totalOrders) * 100 * 10) / 10 : 0;
      return {
        type: type.value as RepairType,
        typeName: type.label,
        count,
        percentage
      };
    });
    
    // 月度统计（模拟最近6个月）
    const monthlyStats = [
      { month: '1月', count: Math.floor(Math.random() * 20) + 10 },
      { month: '2月', count: Math.floor(Math.random() * 20) + 8 },
      { month: '3月', count: Math.floor(Math.random() * 25) + 15 },
      { month: '4月', count: Math.floor(Math.random() * 20) + 12 },
      { month: '5月', count: Math.floor(Math.random() * 30) + 20 },
      { month: '6月', count: totalOrders }
    ];
    
    // 响应时间分布
    const responseTimeDistribution = [
      { range: '0-15分钟', count: orders.filter(o => {
        if (!o.acceptTime) return false;
        const diff = (new Date(o.acceptTime).getTime() - new Date(o.submitTime).getTime()) / (1000 * 60);
        return diff <= 15;
      }).length },
      { range: '15-30分钟', count: orders.filter(o => {
        if (!o.acceptTime) return false;
        const diff = (new Date(o.acceptTime).getTime() - new Date(o.submitTime).getTime()) / (1000 * 60);
        return diff > 15 && diff <= 30;
      }).length },
      { range: '30-60分钟', count: orders.filter(o => {
        if (!o.acceptTime) return false;
        const diff = (new Date(o.acceptTime).getTime() - new Date(o.submitTime).getTime()) / (1000 * 60);
        return diff > 30 && diff <= 60;
      }).length },
      { range: '1小时以上', count: orders.filter(o => {
        if (!o.acceptTime) return false;
        const diff = (new Date(o.acceptTime).getTime() - new Date(o.submitTime).getTime()) / (1000 * 60);
        return diff > 60;
      }).length }
    ];
    
    const statistics: StatisticsData = {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      avgResponseTime: avgResponseTime || 25,
      avgCompleteTime: avgCompleteTime || 180,
      completionRate,
      typeStats,
      monthlyStats,
      responseTimeDistribution
    };
    
    res.json({
      code: 0,
      message: 'success',
      data: statistics
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ code: 500, message: '获取统计数据失败' });
  }
});

// 获取维修师傅工作量统计
router.get('/workers', (req: Request, res: Response) => {
  try {
    const orders = readOrders();
    const workers = readWorkers();
    
    const workerStats = workers.map(worker => {
      const workerOrders = orders.filter(o => o.workerId === worker.id);
      const ratedOrders = workerOrders.filter(o => o.rating);
      const avgRating = ratedOrders.length > 0 
        ? Math.round(ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length * 10) / 10
        : 0;
      
      return {
        worker,
        orderCount: workerOrders.length,
        completedCount: workerOrders.filter(o => o.status === 'rated').length,
        avgRating
      };
    });
    
    // 按完成工单数量排序
    workerStats.sort((a, b) => b.completedCount - a.completedCount);
    
    res.json({
      code: 0,
      message: 'success',
      data: workerStats
    });
  } catch (error) {
    console.error('获取师傅统计失败:', error);
    res.status(500).json({ code: 500, message: '获取师傅统计失败' });
  }
});

export default router;
