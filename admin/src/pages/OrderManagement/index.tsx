import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useAppStore } from '@/store';
import { ORDER_STATUS, REPAIR_TYPES, OrderStatus, RepairType, RepairOrder } from '@/types';
import styles from './index.module.css';

const statusFilters: Array<{ key: OrderStatus | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待分配' },
  { key: 'assigned', label: '待接单' },
  { key: 'processing', label: '维修中' },
  { key: 'completed', label: '待评价' },
  { key: 'rated', label: '已完成' }
];

const typeFilters: Array<{ key: RepairType | 'all'; label: string }> = [
  { key: 'all', label: '全部类型' },
  ...REPAIR_TYPES.map(t => ({ key: t.value, label: t.label }))
];

export default function OrderManagement() {
  const navigate = useNavigate();
  const { 
    getFilteredOrders, 
    searchKeyword, setSearchKeyword,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    urgentOnly, setUrgentOnly,
    workers, assignOrder,
    fetchOrders, fetchWorkers, loading
  } = useAppStore();
  
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchWorkers();
  }, [fetchOrders, fetchWorkers]);

  const orders = getFilteredOrders();

  const handleViewDetail = (id: string) => {
    navigate(`/orders/${id}`);
  };

  const handleAssignClick = (order: RepairOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setAssignModalVisible(true);
  };

  const handleAssignConfirm = async (workerId: string) => {
    if (!selectedOrder || assigning) return;
    setAssigning(true);
    const success = await assignOrder(selectedOrder.id, workerId);
    setAssigning(false);
    if (success) {
      setAssignModalVisible(false);
      setSelectedOrder(null);
    }
  };

  const handleExport = () => {
    const { exportOrders } = useAppStore.getState();
    const csv = exportOrders();
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `工单明细_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      {/* 顶部筛选栏 */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <input
            type="text"
            placeholder="搜索工单号、报修人、地址..."
            className={styles.searchInput}
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
          />
        </div>
        <div className={styles.filterRight}>
          <button className={styles.exportBtn} onClick={handleExport}>
            📥 导出明细
          </button>
        </div>
      </div>

      {/* 标签筛选 */}
      <div className={styles.statusTabs}>
        {statusFilters.map(item => (
          <button
            key={item.key}
            className={classNames(
              styles.statusTab,
              statusFilter === item.key && styles.statusTabActive
            )}
            onClick={() => setStatusFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 二级筛选 */}
      <div className={styles.subFilter}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>报修类型:</span>
          <div className={styles.filterTags}>
            {typeFilters.map(item => (
              <button
                key={item.key}
                className={classNames(
                  styles.filterTag,
                  typeFilter === item.key && styles.filterTagActive
                )}
                onClick={() => setTypeFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={classNames(styles.urgentToggle, urgentOnly && styles.urgentToggleActive)}>
            <input
              type="checkbox"
              checked={urgentOnly}
              onChange={e => setUrgentOnly(e.target.checked)}
            />
            <span>🚨 仅看紧急</span>
          </label>
        </div>
      </div>

      {/* 工单列表 */}
      <div className={styles.orderTable}>
        <table>
          <thead>
            <tr>
              <th>工单号</th>
              <th>类型</th>
              <th>报修人</th>
              <th>地址</th>
              <th>状态</th>
              <th>维修师傅</th>
              <th>提交时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr 
                key={order.id} 
                className={classNames(order.urgent && styles.urgentRow)}
                onClick={() => handleViewDetail(order.id)}
              >
                <td>
                  <span className={styles.orderNo}>{order.orderNo}</span>
                  {order.urgent && <span className={styles.urgentBadge}>紧急</span>}
                </td>
                <td>
                  <span className={styles.typeCell}>
                    {REPAIR_TYPES.find(t => t.value === order.type)?.icon}
                    {order.typeName}
                  </span>
                </td>
                <td>
                  <div>
                    <div className={styles.ownerName}>{order.ownerName}</div>
                    <div className={styles.ownerPhone}>{order.ownerPhone}</div>
                  </div>
                </td>
                <td className={styles.addressCell}>{order.address}</td>
                <td>
                  <span 
                    className={styles.statusBadge}
                    style={{ 
                      color: ORDER_STATUS[order.status].color,
                      backgroundColor: ORDER_STATUS[order.status].bgColor 
                    }}
                  >
                    {order.statusName}
                  </span>
                </td>
                <td>
                  {order.workerName ? (
                    <span className={styles.workerName}>{order.workerName}</span>
                  ) : (
                    <span className={styles.noWorker}>未分配</span>
                  )}
                </td>
                <td className={styles.timeCell}>{order.submitTime}</td>
                <td>
                  <button 
                    className={styles.viewBtn}
                    onClick={(e) => { e.stopPropagation(); handleViewDetail(order.id); }}
                  >
                    查看
                  </button>
                  {order.status === 'pending' && (
                    <button 
                      className={styles.assignBtn}
                      onClick={(e) => handleAssignClick(order, e)}
                    >
                      分配
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <p className={styles.emptyText}>暂无符合条件的工单</p>
          </div>
        )}
      </div>

      {/* 分配弹窗 */}
      {assignModalVisible && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setAssignModalVisible(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>分配工单</h3>
              <button className={styles.closeBtn} onClick={() => setAssignModalVisible(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalTip}>请选择要分配的维修师傅：</p>
              <div className={styles.workerList}>
                {workers.map(worker => (
                  <div 
                    key={worker.id} 
                    className={styles.workerItem}
                    onClick={() => handleAssignConfirm(worker.id)}
                  >
                    <img src={worker.avatar} alt="" className={styles.workerAvatar} />
                    <div className={styles.workerInfo}>
                      <div className={styles.workerItemName}>{worker.name}</div>
                      <div className={styles.workerItemPhone}>{worker.phone}</div>
                    </div>
                    <button className={styles.assignConfirmBtn}>分配</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
