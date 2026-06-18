import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Button, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classNames from 'classnames';
import { useAppStore } from '@/store';
import { RepairOrder, ORDER_STATUS } from '@/types';
import styles from './index.module.scss';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { getOrderById, acceptOrder, completeOrder, currentUser, workers, assignOrder } = useAppStore();
  const [order, setOrder] = useState<RepairOrder | null>(null);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [repairDescription, setRepairDescription] = useState('');
  const [repairImages, setRepairImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const orderId = router.params.id;

  const loadOrder = useCallback(() => {
    if (!orderId) return;
    const orderData = getOrderById(orderId);
    if (orderData) {
      setOrder(orderData);
    } else {
      Taro.showToast({ title: '工单不存在', icon: 'none' });
    }
  }, [orderId, getOrderById]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleAcceptOrder = () => {
    if (!order) return;
    Taro.showModal({
      title: '确认接单',
      content: '确定要接这个工单吗？接单后请尽快前往处理。',
      success: (res) => {
        if (res.confirm) {
          const success = acceptOrder(order.id);
          if (success) {
            Taro.showToast({ title: '接单成功', icon: 'success' });
            loadOrder();
          }
        }
      }
    });
  };

  const handleCompleteOrder = () => {
    if (!repairDescription.trim()) {
      Taro.showToast({ title: '请填写维修说明', icon: 'none' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const success = completeOrder(order!.id, repairDescription.trim(), repairImages);
      setLoading(false);
      if (success) {
        Taro.showToast({ title: '完工提交成功', icon: 'success' });
        setShowCompleteForm(false);
        loadOrder();
      }
    }, 500);
  };

  const handleChooseImage = async () => {
    if (repairImages.length >= 9) {
      Taro.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }
    try {
      const res = await Taro.chooseImage({
        count: 9 - repairImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      const tempFiles = res.tempFilePaths || [];
      setRepairImages([...repairImages, ...tempFiles]);
    } catch (err) {
      console.error('[OrderDetail] 选择图片失败:', err);
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImages = [...repairImages];
    newImages.splice(index, 1);
    setRepairImages(newImages);
  };

  const handleCallPhone = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone })
      .catch(err => console.error('[OrderDetail] 拨打电话失败:', err));
  };

  const handleRate = () => {
    Taro.navigateTo({
      url: `/pages/rating/index?id=${order!.id}`
    });
  };

  const handleAssign = (workerId: string) => {
    const success = assignOrder(order!.id, workerId);
    if (success) {
      Taro.showToast({ title: '分配成功', icon: 'success' });
      loadOrder();
    }
  };

  const showAssignDialog = () => {
    const workerNames = workers.map(w => `${w.name} - ${w.phone}`);
    Taro.showActionSheet({
      itemList: workerNames,
      success: (res) => {
        handleAssign(workers[res.tapIndex].id);
      }
    });
  };

  if (!order) {
    return (
      <View className={styles.pageContainer}>
        <View style={{ textAlign: 'center', padding: '200rpx 0' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  const statusInfo = ORDER_STATUS[order.status];
  const isOwner = currentUser.role === 'owner';
  const isWorker = currentUser.role === 'worker';
  const isAdmin = currentUser.role === 'admin';

  const canAccept = (isWorker || isAdmin) && (order.status === 'assigned' || order.status === 'pending');
  const canComplete = isWorker && order.status === 'processing' && order.workerName === currentUser.name;
  const canRate = isOwner && order.status === 'completed';
  const canAssign = isAdmin && order.status === 'pending';

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      {/* 顶部状态 */}
      <View className={classNames(styles.statusHeader, order.urgent && styles.urgent)}>
        <View className={styles.statusRow}>
          <View className={styles.statusBadge}>
            <Text className={styles.statusText}>{statusInfo.label}</Text>
          </View>
          {order.urgent && (
            <View className={styles.urgentBadge}>
              <Text className={styles.urgentBadgeText}>🚨 紧急</Text>
            </View>
          )}
        </View>
        <Text className={styles.orderNo}>工单号: {order.orderNo}</Text>
        <View className={styles.orderType}>
          <Text className={styles.typeIcon}>
            {order.type === 'water_electric' && '💡'}
            {order.type === 'access_control' && '🔐'}
            {order.type === 'elevator' && '🛗'}
            {order.type === 'other' && '🔧'}
          </Text>
          <Text className={styles.typeName}>{order.typeName}</Text>
        </View>
      </View>

      {/* 问题描述 */}
      <View className={styles.card}>
        <Text className={styles.sectionTitle}>问题描述</Text>
        <Text className={styles.description}>{order.description}</Text>
        {order.images.length > 0 && (
          <View className={styles.imageList}>
            {order.images.map((img, idx) => (
              <View key={idx} className={styles.imageItem}>
                <Image src={img} className={styles.previewImage} mode="aspectFill" />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 基本信息 */}
      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>报修人</Text>
          <Text className={styles.infoValue}>{order.ownerName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>联系电话</Text>
          <Text className={styles.infoValue}>{order.ownerPhone}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>报修地址</Text>
          <Text className={styles.infoValue}>{order.address}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>提交时间</Text>
          <Text className={styles.infoValue}>{order.submitTime}</Text>
        </View>
      </View>

      {/* 维修师傅 */}
      {(order.workerName || order.status !== 'pending') && (
        <View className={styles.infoSection}>
          <Text className={styles.sectionTitle}>维修师傅</Text>
          {order.workerName ? (
            <View className={styles.workerCard}>
              <Image 
                src={workers.find(w => w.name === order.workerName)?.avatar || 'https://picsum.photos/id/1005/200/200'} 
                className={styles.workerAvatar}
                mode="aspectFill"
              />
              <View className={styles.workerInfo}>
                <Text className={styles.workerName}>{order.workerName}</Text>
                <Text className={styles.workerPhone}>{order.workerPhone}</Text>
              </View>
              <View className={styles.callBtn} onClick={() => handleCallPhone(order.workerPhone!)}>
                <Text>📞</Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: '#86909c', fontSize: '28rpx' }}>暂未分配维修师傅</Text>
          )}

          {/* 维修说明 */}
          {order.repairDescription && (
            <View className={styles.repairSection}>
              <Text className={styles.repairLabel}>维修说明</Text>
              <Text className={styles.repairContent}>{order.repairDescription}</Text>
              {order.repairImages.length > 0 && (
                <View className={styles.imageList}>
                  {order.repairImages.map((img, idx) => (
                    <View key={idx} className={styles.imageItem}>
                      <Image src={img} className={styles.previewImage} mode="aspectFill" />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 评价 */}
          {order.rating && (
            <View className={styles.ratingSection}>
              <View className={styles.ratingStars}>
                {'⭐'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}
              </View>
              <Text className={styles.ratingText}>{order.ratingContent || '用户未填写评价内容'}</Text>
            </View>
          )}
        </View>
      )}

      {/* 进度时间线 */}
      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>工单进度</Text>
        <View className={styles.timeline}>
          {order.progress.map((item, index) => (
            <View key={index} className={styles.timelineItem}>
              <View className={classNames(styles.timelineDot, index === order.progress.length - 1 && styles.active)} />
              <View className={styles.timelineLine} />
              <View className={styles.timelineContent}>
                <Text className={classNames(styles.timelineTitle, index === order.progress.length - 1 && styles.active)}>
                  {item.description}
                </Text>
                <Text className={styles.timelineTime}>{item.time}</Text>
                {item.operator && (
                  <Text className={styles.timelineOperator}>操作人: {item.operator}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 完工表单 */}
      {showCompleteForm && (
        <View className={styles.infoSection}>
          <Text className={styles.sectionTitle}>维修完工</Text>
          <View className={styles.completeForm}>
            <Textarea
              className={styles.completeTextarea}
              placeholder="请填写维修说明，包括处理方式、更换配件等"
              value={repairDescription}
              onInput={(e: any) => setRepairDescription(e.detail.value || e.target?.value || '')}
              maxlength={500}
              autoHeight
            />
            <View className={styles.uploadRow}>
              {repairImages.map((img, idx) => (
                <View key={idx} className={styles.uploadItem}>
                  <Image src={img} className={styles.uploadImg} mode="aspectFill" />
                  <View 
                    style={{
                      position: 'absolute', top: 4, right: 4, width: 32, height: 32,
                      borderRadius: '50%', background: 'rgba(0,0,0,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 20
                    }}
                    onClick={() => handleDeleteImage(idx)}
                  >
                    ×
                  </View>
                </View>
              ))}
              {repairImages.length < 9 && (
                <View className={styles.addUpload} onClick={handleChooseImage}>
                  <Text className={styles.addIcon}>+</Text>
                  <Text className={styles.addText}>上传照片</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        {canAccept && (
          <Button className={classNames(styles.primaryBtn, order.urgent && styles.urgent)} onClick={handleAcceptOrder}>
            <Text className={styles.btnText}>立即接单</Text>
          </Button>
        )}
        {canComplete && !showCompleteForm && (
          <Button className={styles.primaryBtn} onClick={() => setShowCompleteForm(true)}>
            <Text className={styles.btnText}>完成维修</Text>
          </Button>
        )}
        {canComplete && showCompleteForm && (
          <>
            <Button className={styles.secondaryBtn} onClick={() => setShowCompleteForm(false)}>
              <Text className={styles.btnText}>取消</Text>
            </Button>
            <Button className={styles.primaryBtn} onClick={handleCompleteOrder} loading={loading}>
              <Text className={styles.btnText}>{loading ? '提交中...' : '提交完工'}</Text>
            </Button>
          </>
        )}
        {canRate && (
          <Button className={styles.primaryBtn} onClick={handleRate}>
            <Text className={styles.btnText}>去评价</Text>
          </Button>
        )}
        {canAssign && (
          <Button className={styles.primaryBtn} onClick={showAssignDialog}>
            <Text className={styles.btnText}>分配工单</Text>
          </Button>
        )}
        {isOwner && order.status === 'processing' && (
          <Button className={styles.secondaryBtn} onClick={() => handleCallPhone(order.workerPhone!)}>
            <Text className={styles.btnText}>联系师傅</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderDetailPage;
