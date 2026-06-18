import { Router, Request, Response } from 'express';
import { readWorkers } from '../data/store';

const router = Router();

// 获取维修师傅列表
router.get('/', (req: Request, res: Response) => {
  try {
    const workers = readWorkers();
    
    res.json({
      code: 0,
      message: 'success',
      data: workers
    });
  } catch (error) {
    console.error('获取维修师傅列表失败:', error);
    res.status(500).json({ code: 500, message: '获取维修师傅列表失败' });
  }
});

// 获取单个维修师傅信息
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workers = readWorkers();
    const worker = workers.find(w => w.id === id);
    
    if (!worker) {
      return res.status(404).json({ code: 404, message: '维修师傅不存在' });
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: worker
    });
  } catch (error) {
    console.error('获取维修师傅信息失败:', error);
    res.status(500).json({ code: 500, message: '获取维修师傅信息失败' });
  }
});

export default router;
