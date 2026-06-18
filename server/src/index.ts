import express from 'express';
import cors from 'cors';
import ordersRouter from './routes/orders';
import workersRouter from './routes/workers';
import statisticsRouter from './routes/statistics';
import { initData } from './data/store';

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化数据
initData();

// 路由
app.use('/api/orders', ordersRouter);
app.use('/api/workers', workersRouter);
app.use('/api/statistics', statisticsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    message: 'ok',
    data: {
      status: 'running',
      timestamp: new Date().toISOString()
    }
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误'
  });
});

app.listen(PORT, () => {
  console.log(`
  🚀 物业报修系统后端服务已启动
  📍 服务地址: http://localhost:${PORT}
  📋 API 前缀: /api
  🕐 启动时间: ${new Date().toLocaleString()}
  `);
});

export default app;
