import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/store';
import { REPAIR_TYPES } from '@/types';
import styles from './index.module.css';

const emptyStats = {
  totalOrders: 0,
  pendingOrders: 0,
  processingOrders: 0,
  completedOrders: 0,
  avgResponseTime: 0,
  avgCompleteTime: 0,
  completionRate: 0,
  typeStats: REPAIR_TYPES.map(t => ({ type: t.value, typeName: t.label, count: 0, percentage: 0 })),
  monthlyStats: [
    { month: '1月', count: 0 }, { month: '2月', count: 0 }, { month: '3月', count: 0 },
    { month: '4月', count: 0 }, { month: '5月', count: 0 }, { month: '6月', count: 0 }
  ],
  responseTimeDistribution: [
    { range: '0-15分钟', count: 0 }, { range: '15-30分钟', count: 0 },
    { range: '30-60分钟', count: 0 }, { range: '1小时以上', count: 0 }
  ]
};

export default function Statistics() {
  const { 
    statistics,
    statisticsLoading,
    getWorkerStats, 
    exportOrders, 
    exportStatistics,
    fetchStatistics,
    fetchOrders,
    fetchWorkers,
    fetchWorkerStats
  } = useAppStore();
  
  const stats = statistics || emptyStats;
  const workerStats = useMemo(() => getWorkerStats(), [getWorkerStats, statistics]);

  useEffect(() => {
    // 只有在没有数据的时候才加载，避免切换页面重复请求
    if (!statistics) {
      fetchStatistics();
    }
    fetchOrders();
    fetchWorkers();
    fetchWorkerStats();
  }, [fetchStatistics, fetchOrders, fetchWorkers, fetchWorkerStats, statistics]);

  const handleExportDetail = () => {
    const csv = exportOrders();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `工单明细_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
    const report = exportStatistics();
    const blob = new Blob(['\uFEFF' + report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `统计报表_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (statisticsLoading && !statistics) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  const maxTypeCount = Math.max(...stats.typeStats.map(t => t.count), 1);
  const maxMonthCount = Math.max(...stats.monthlyStats.map(m => m.count), 1);
  const maxResponseCount = Math.max(...stats.responseTimeDistribution.map(r => r.count), 1);

  return (
    <div className={styles.page}>
      {/* 顶部概览卡片 */}
      <div className={styles.overviewCards}>
        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>📋</div>
          <div className={styles.cardInfo}>
            <div className={styles.cardValue}>{stats.totalOrders}</div>
            <div className={styles.cardLabel}>总工单数</div>
          </div>
        </div>
        <div className={styles.overviewCard}>
          <div className={styles.cardIcon} style={{ background: '#fff7e6', color: '#ff7d00' }}>⏳</div>
          <div className={styles.cardInfo}>
            <div className={styles.cardValue} style={{ color: '#ff7d00' }}>{stats.pendingOrders}</div>
            <div className={styles.cardLabel}>待处理</div>
          </div>
        </div>
        <div className={styles.overviewCard}>
          <div className={styles.cardIcon} style={{ background: '#f9f0ff', color: '#722ed1' }}>🔧</div>
          <div className={styles.cardInfo}>
            <div className={styles.cardValue} style={{ color: '#722ed1' }}>{stats.processingOrders}</div>
            <div className={styles.cardLabel}>处理中</div>
          </div>
        </div>
        <div className={styles.overviewCard}>
          <div className={styles.cardIcon} style={{ background: '#f6ffed', color: '#00b42a' }}>✅</div>
          <div className={styles.cardInfo}>
            <div className={styles.cardValue} style={{ color: '#00b42a' }}>{stats.completedOrders}</div>
            <div className={styles.cardLabel}>已完成</div>
          </div>
        </div>
      </div>

      {/* 效率指标 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>效率指标</h3>
        </div>
        <div className={styles.efficiencyCards}>
          <div className={styles.efficiencyCard}>
            <div className={styles.efficiencyValue}>{stats.avgResponseTime}<span className={styles.efficiencyUnit}>分钟</span></div>
            <div className={styles.efficiencyLabel}>平均响应时间</div>
            <div className={styles.efficiencyTrend} style={{ color: '#00b42a' }}>↓ 比上月改善 12%</div>
          </div>
          <div className={styles.efficiencyCard}>
            <div className={styles.efficiencyValue}>{Math.floor(stats.avgCompleteTime / 60)}<span className={styles.efficiencyUnit}>小时</span></div>
            <div className={styles.efficiencyLabel}>平均完成时间</div>
            <div className={styles.efficiencyTrend} style={{ color: '#00b42a' }}>↓ 比上月改善 8%</div>
          </div>
          <div className={styles.efficiencyCard}>
            <div className={styles.efficiencyValue}>{stats.completionRate}<span className={styles.efficiencyUnit}>%</span></div>
            <div className={styles.efficiencyLabel}>工单完成率</div>
            <div className={styles.efficiencyTrend} style={{ color: '#00b42a' }}>↑ 比上月提升 3%</div>
          </div>
        </div>
      </div>

      <div className={styles.twoColumns}>
        {/* 类型分布 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>报修类型分布</h3>
          </div>
          <div className={styles.typeList}>
            {stats.typeStats.map(item => {
              const typeInfo = REPAIR_TYPES.find(t => t.value === item.type);
              return (
                <div key={item.type} className={styles.typeItem}>
                  <div className={styles.typeHeader}>
                    <span className={styles.typeIcon}>{typeInfo?.icon}</span>
                    <span className={styles.typeName}>{item.typeName}</span>
                    <span className={styles.typeCount}>{item.count} 单</span>
                  </div>
                  <div className={styles.typeBar}>
                    <div 
                      className={styles.typeBarFill}
                      style={{ 
                        width: `${maxTypeCount > 0 ? (item.count / maxTypeCount) * 100 : 0}%`,
                        backgroundColor: typeInfo?.color 
                      }}
                    />
                  </div>
                  <div className={styles.typePercent}>{item.percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 响应时间分布 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>响应时间分布</h3>
          </div>
          <div className={styles.responseDist}>
            {stats.responseTimeDistribution.map((item, index) => (
              <div key={index} className={styles.responseItem}>
                <div className={styles.responseLabel}>{item.range}</div>
                <div className={styles.responseBar}>
                  <div 
                    className={styles.responseBarFill}
                    style={{ width: `${maxResponseCount > 0 ? (item.count / maxResponseCount) * 100 : 0}%` }}
                  />
                </div>
                <div className={styles.responseCount}>{item.count}单</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 月度趋势 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>月度工单趋势</h3>
        </div>
        <div className={styles.monthChart}>
          {stats.monthlyStats.map(item => (
            <div key={item.month} className={styles.monthBar}>
              <div className={styles.monthValue}>{item.count}</div>
              <div 
                className={styles.monthBarFill}
                style={{ height: `${maxMonthCount > 0 ? (item.count / maxMonthCount) * 100 : 0}%` }}
              />
              <div className={styles.monthLabel}>{item.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 维修师傅排行 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>维修师傅工作量</h3>
        </div>
        <div className={styles.workerRanking}>
          <table>
            <thead>
              <tr>
                <th>排名</th>
                <th>师傅</th>
                <th>完成工单</th>
                <th>平均评分</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {workerStats
                .sort((a, b) => b.orderCount - a.orderCount)
                .map((item, index) => (
                  <tr key={item.worker.id}>
                    <td>
                      <span className={classnames(
                        styles.rankBadge,
                        index === 0 && styles.rankGold,
                        index === 1 && styles.rankSilver,
                        index === 2 && styles.rankBronze
                      )}>
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <div className={styles.workerCell}>
                        <img src={item.worker.avatar} alt="" className={styles.workerAvatar} />
                        <span>{item.worker.name}</span>
                      </div>
                    </td>
                    <td>{item.orderCount} 单</td>
                    <td>
                      <span className={styles.ratingStars}>
                        {'⭐'.repeat(Math.floor(item.avgRating))}
                        <span style={{ color: '#999' }}>{'☆'.repeat(5 - Math.floor(item.avgRating))}</span>
                      </span>
                      <span style={{ marginLeft: 8, color: '#666' }}>{item.avgRating}</span>
                    </td>
                    <td>
                      <span className={styles.onlineBadge}>在岗</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 导出操作 */}
      <div className={styles.exportSection}>
        <button className={styles.exportBtnSecondary} onClick={handleExportDetail}>
          📋 导出工单明细
        </button>
        <button className={styles.exportBtnPrimary} onClick={handleExportReport}>
          📊 生成统计报表
        </button>
      </div>
    </div>
  );
}

function classnames(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ');
}
