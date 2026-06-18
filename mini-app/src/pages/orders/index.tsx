import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { useAppStore } from '@/store';
import { OrderStatus } from '@/types';
import OrderCard from '@/components/OrderCard';
import styles from './index.module.scss';

interface TabItem {
  key: OrderStatus | 'all';
  label: string;
}

const tabs: TabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待分配' },
  { key: 'assigned', label: '待接单' },
  { key: 'processing', label: '维修中' },
  { key: 'completed', label: '待评价' },
  { key: 'rated', label: '已完成' }
];

const OrdersPage: React.FC = () => {
  const { getOrdersByRole, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  const loadOrders = useCallback(() => {
    let result = getOrdersByRole();
    
    if (activeTab !== 'all') {
      result = result.filter(o => o.status === activeTab);
    }
    
    if (onlyUrgent) {
      result = result.filter(o => o.urgent);
    }
    
    setOrders(result);
  }, [getOrdersByRole, activeTab, onlyUrgent]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, currentUser.role]);

  useEffect(() => {
    const pullDownRefreshHandler = () => {
      loadOrders();
      Taro.stopPullDownRefresh();
    };
    Taro.onPullDownRefresh(pullDownRefreshHandler);
    return () => {
      Taro.offPullDownRefresh(pullDownRefreshHandler);
    };
  }, [loadOrders]);

  const handleTabChange = (key: OrderStatus | 'all') => {
    setActiveTab(key);
  };

  const toggleUrgentFilter = () => {
    setOnlyUrgent(!onlyUrgent);
  };

  const getEmptyTip = () => {
    if (onlyUrgent) {
      return { icon: '🚨', title: '暂无紧急工单', desc: '所有紧急工单都已处理完毕' };
    }
    switch (activeTab) {
      case 'pending':
        return { icon: '📋', title: '暂无待分配工单', desc: '所有工单都已分配' };
      case 'assigned':
        return { icon: '📥', title: '暂无待接单工单', desc: '所有工单都已被接单' };
      case 'processing':
        return { icon: '🔧', title: '暂无维修中工单', desc: '所有维修任务都已完成' };
      case 'completed':
        return { icon: '✅', title: '暂无待评价工单', desc: '所有工单都已评价' };
      case 'rated':
        return { icon: '📊', title: '暂无已完成工单', desc: '还没有完成的工单' };
      default:
        return { icon: '📭', title: '暂无工单', desc: '快去提交一个报修工单吧' };
    }
  };

  const emptyTip = getEmptyTip();

  return (
    <View className={styles.pageContainer}>
      {/* 状态筛选标签 */}
      <View className={styles.tabsContainer}>
        <ScrollView scrollX className={styles.tabsScroll}>
          <View className={styles.tabs}>
            {tabs.map(tab => (
              <View
                key={tab.key}
                className={classNames(styles.tabItem, activeTab === tab.key && styles.tabActive)}
                onClick={() => handleTabChange(tab.key)}
              >
                <Text className={styles.tabText}>{tab.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 紧急筛选 */}
      <View className={styles.filterBar}>
        <View className={styles.filterLeft}>
          <View
            className={classNames(styles.urgentFilter, onlyUrgent && styles.active)}
            onClick={toggleUrgentFilter}
          >
            <Text className={styles.urgentFilterText}>
              {onlyUrgent ? '✓ ' : ''}仅看紧急
            </Text>
          </View>
        </View>
        <Text className={styles.filterCount}>共 {orders.length} 条</Text>
      </View>

      {/* 工单列表 */}
      <ScrollView scrollY className={styles.orderList}>
        {orders.length > 0 ? (
          orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>{emptyTip.icon}</Text>
            <Text className={styles.emptyTitle}>{emptyTip.title}</Text>
            <Text className={styles.emptyDesc}>{emptyTip.desc}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersPage;
