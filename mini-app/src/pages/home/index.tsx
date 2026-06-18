import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { REPAIR_TYPES } from '@/types';
import OrderCard from '@/components/OrderCard';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { currentUser, switchRole, getOrdersByRole, getStatistics, refreshAll } = useAppStore();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [urgentCount, setUrgentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await refreshAll();
    } catch (e) {
      console.error('刷新数据失败', e);
    } finally {
      setLoading(false);
    }
    const orders = getOrdersByRole();
    setRecentOrders(orders.slice(0, 3));
    setUrgentCount(orders.filter(o => o.urgent && o.status !== 'rated').length);
    setStats(getStatistics());
  }, [getOrdersByRole, getStatistics, refreshAll]);

  useEffect(() => {
    loadData();
  }, [currentUser.role]);

  useDidShow(() => {
    loadData();
  });

  const handleRefresh = async () => {
    await loadData();
    Taro.stopPullDownRefresh();
  };

  useEffect(() => {
    Taro.onPullDownRefresh(handleRefresh);
    return () => {
      Taro.offPullDownRefresh(handleRefresh);
    };
  }, [handleRefresh]);

  const handleSwitchRole = () => {
    const roles: Array<{ value: string; label: string }> = [
      { value: 'owner', label: '业主' },
      { value: 'worker', label: '维修师傅' },
      { value: 'admin', label: '管理员' }
    ];
    Taro.showActionSheet({
      itemList: roles.map(r => r.label),
      success: (res) => {
        const selectedRole = roles[res.tapIndex].value as any;
        switchRole(selectedRole);
        Taro.showToast({
          title: `已切换为${roles[res.tapIndex].label}`,
          icon: 'success'
        });
      }
    });
  };

  const goToRepair = () => {
    Taro.switchTab({ url: '/pages/repair/index' });
  };

  const goToOrders = () => {
    Taro.switchTab({ url: '/pages/orders/index' });
  };

  const goToStatistics = () => {
    Taro.navigateTo({ url: '/pages/statistics/index' });
  };

  const handleTypeClick = (type: string) => {
    Taro.switchTab({ url: '/pages/repair/index' });
  };

  const getRoleLabel = () => {
    const roleMap: Record<string, string> = {
      owner: '业主',
      worker: '维修师傅',
      admin: '管理员'
    };
    return roleMap[currentUser.role] || '业主';
  };

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      {/* 顶部用户信息 */}
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image src={currentUser.avatar} className={styles.avatar} mode="aspectFill" />
          <View className={styles.userText}>
            <Text className={styles.userName}>{currentUser.name}</Text>
            <Text className={styles.userRole}>{getRoleLabel()}</Text>
          </View>
          <Button className={styles.roleSwitch} onClick={handleSwitchRole}>
            <Text className={styles.roleSwitchText}>切换角色</Text>
          </Button>
        </View>
      </View>

      {/* 快捷入口 */}
      <View className={styles.quickActions}>
        {REPAIR_TYPES.map(item => (
          <View 
            key={item.value} 
            className={styles.actionItem}
            onClick={() => handleTypeClick(item.value)}
          >
            <View className={styles.actionIcon}>{item.icon}</View>
            <Text className={styles.actionText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* 紧急工单提示 */}
      {urgentCount > 0 && (
        <View className={styles.urgentNotice}>
          <Text className={styles.urgentIcon}>🚨</Text>
          <Text className={styles.urgentText}>您有{urgentCount}个紧急工单待处理</Text>
          <Text className={styles.urgentCount} onClick={goToOrders}>查看 →</Text>
        </View>
      )}

      {/* 数据统计 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>数据概览</Text>
          <Text className={styles.viewAll} onClick={goToStatistics}>查看详情</Text>
        </View>
        <View className={styles.statsCard}>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats?.totalOrders || 0}</Text>
              <Text className={styles.statLabel}>总工单</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats?.pendingOrders || 0}</Text>
              <Text className={styles.statLabel}>待处理</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats?.processingOrders || 0}</Text>
              <Text className={styles.statLabel}>处理中</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats?.completedOrders || 0}</Text>
              <Text className={styles.statLabel}>已完成</Text>
            </View>
          </View>
          <View className={styles.timeStats}>
            <View className={styles.timeStatItem}>
              <Text className={styles.timeStatValue}>{stats?.avgResponseTime || 0}分钟</Text>
              <Text className={styles.timeStatLabel}>平均响应时间</Text>
            </View>
            <View className={styles.timeStatItem}>
              <Text className={styles.timeStatValue}>{Math.floor((stats?.avgCompleteTime || 0) / 60)}小时</Text>
              <Text className={styles.timeStatLabel}>平均完成时间</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 最近工单 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>最近工单</Text>
          <Text className={styles.viewAll} onClick={goToOrders}>全部工单</Text>
        </View>
        <View className={styles.orderList}>
          {recentOrders.length > 0 ? (
            recentOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无工单</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
