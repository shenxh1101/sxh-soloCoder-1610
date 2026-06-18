import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { ORDER_STATUS, REPAIR_TYPES } from '@/types';
import styles from './index.module.css';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, assignOrder, workers, fetchOrders, fetchWorkers } = useAppStore();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchWorkers();
  }, [fetchOrders, fetchWorkers]);

  const order = id ? getOrderById(id) : undefined;

  if (!order) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <p>加载中或工单不存在</p>
          <button onClick={() => navigate('/orders')}>返回列表</button>
        </div>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS[order.status];

  const handleAssign = async (workerId: string) => {
    if (!order || assigning) return;
    setAssigning(true);
    const success = await assignOrder(order.id, workerId);
    setAssigning(false);
    if (success) {
      setShowAssignModal(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* 返回按钮 */}
      <button className={styles.backBtn} onClick={() => navigate('/orders')}>
        ← 返回列表
      </button>

      {/* 工单头部状态 */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <div className={styles.orderNo}>
            {order.orderNo}
            {order.urgent && <span className={styles.urgentTag}>🚨 紧急工单</span>}
          </div>
          <div className={styles.orderTitle}>{order.typeName} - {order.description.slice(0, 30)}</div>
        </div>
        <div 
          className={styles.statusBadge}
          style={{ color: statusInfo.color, backgroundColor: statusInfo.bgColor }}
        >
          {order.statusName}
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* 左侧主内容 */}
        <div className={styles.mainContent}>
          {/* 问题描述 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>问题描述</h3>
            <p className={styles.description}>{order.description}</p>
            {order.images.length > 0 && (
              <div className={styles.imageGrid}>
                {order.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className={styles.imageItem} />
                ))}
              </div>
            )}
          </div>

          {/* 维修记录 */}
          {order.repairDescription && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>维修说明</h3>
              <p className={styles.description}>{order.repairDescription}</p>
              {order.repairImages.length > 0 && (
                <div className={styles.imageGrid}>
                  {order.repairImages.map((img, idx) => (
                    <img key={idx} src={img} alt="" className={styles.imageItem} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 业主评价 */}
          {order.rating && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>业主评价</h3>
              <div className={styles.ratingBox}>
                <div className={styles.ratingStars}>
                  {'⭐'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}
                </div>
                <p className={styles.ratingContent}>{order.ratingContent || '用户未填写评价内容'}</p>
              </div>
            </div>
          )}

          {/* 工单进度 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>工单进度</h3>
            <div className={styles.timeline}>
              {order.progress.map((item, index) => (
                <div 
                  key={index} 
                  className={`${styles.timelineItem} ${index === order.progress.length - 1 ? styles.timelineActive : ''}`}
                >
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineLine} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineTitle}>{item.description}</div>
                    <div className={styles.timelineTime}>{item.time}</div>
                    {item.operator && (
                      <div className={styles.timelineOperator}>操作人: {item.operator}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧信息栏 */}
        <div className={styles.sidebar}>
          {/* 业主信息 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>业主信息</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>姓名</span>
                <span className={styles.infoValue}>{order.ownerName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>电话</span>
                <span className={styles.infoValue}>{order.ownerPhone}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>地址</span>
                <span className={styles.infoValue}>{order.address}</span>
              </div>
            </div>
          </div>

          {/* 维修师傅 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>维修师傅</h3>
            {order.workerName ? (
              <div className={styles.workerCard}>
                <img 
                  src={workers.find(w => w.id === order.workerId)?.avatar || 'https://picsum.photos/id/1005/200/200'} 
                  alt="" 
                  className={styles.workerAvatar} 
                />
                <div className={styles.workerInfo}>
                  <div className={styles.workerName}>{order.workerName}</div>
                  <div className={styles.workerPhone}>{order.workerPhone}</div>
                </div>
              </div>
            ) : (
              <p className={styles.noWorker}>暂未分配维修师傅</p>
            )}
            {order.status === 'pending' && (
              <button 
                className={styles.assignBtn}
                onClick={() => setShowAssignModal(true)}
              >
                分配工单
              </button>
            )}
          </div>

          {/* 工单时间 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>时间信息</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>提交时间</span>
                <span className={styles.infoValue}>{order.submitTime}</span>
              </div>
              {order.assignTime && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>分配时间</span>
                  <span className={styles.infoValue}>{order.assignTime}</span>
                </div>
              )}
              {order.acceptTime && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>接单时间</span>
                  <span className={styles.infoValue}>{order.acceptTime}</span>
                </div>
              )}
              {order.completeTime && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>完成时间</span>
                  <span className={styles.infoValue}>{order.completeTime}</span>
                </div>
              )}
              {order.rateTime && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>评价时间</span>
                  <span className={styles.infoValue}>{order.rateTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 分配弹窗 */}
      {showAssignModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>分配工单</h3>
              <button className={styles.closeBtn} onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalTip}>请选择要分配的维修师傅：</p>
              <div className={styles.workerList}>
                {workers.map(worker => (
                  <div 
                    key={worker.id} 
                    className={styles.workerListItem}
                    onClick={() => handleAssign(worker.id)}
                  >
                    <img src={worker.avatar} alt="" className={styles.workerItemAvatar} />
                    <div className={styles.workerItemInfo}>
                      <div className={styles.workerItemName}>{worker.name}</div>
                      <div className={styles.workerItemPhone}>{worker.phone}</div>
                    </div>
                    <button className={styles.assignConfirmBtn} disabled={assigning}>
                      {assigning ? '分配中...' : '分配'}
                    </button>
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
