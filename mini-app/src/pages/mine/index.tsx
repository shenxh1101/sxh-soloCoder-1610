import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { UserRole } from '@/types';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { currentUser, switchRole, getOrdersByRole } = useAppStore();
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0
  });

  useEffect(() => {
    const orders = getOrdersByRole();
    setOrderStats({
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending' || o.status === 'assigned').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'rated').length
    });
  }, [getOrdersByRole, currentUser.role]);

  const getRoleLabel = (role: UserRole) => {
    const roleMap: Record<UserRole, string> = {
      owner: '业主',
      worker: '维修师傅',
      admin: '管理员'
    };
    return roleMap[role] || '业主';
  };

  const handleSwitchRole = () => {
    const roles: Array<{ value: UserRole; label: string }> = [
      { value: 'owner', label: '业主' },
      { value: 'worker', label: '维修师傅' },
      { value: 'admin', label: '管理员' }
    ];
    Taro.showActionSheet({
      itemList: roles.map(r => r.label),
      success: (res) => {
        const selectedRole = roles[res.tapIndex].value;
        switchRole(selectedRole);
        Taro.showToast({
          title: `已切换为${roles[res.tapIndex].label}`,
          icon: 'success'
        });
      }
    });
  };

  const goToStatistics = () => {
    Taro.navigateTo({ url: '/pages/statistics/index' });
  };

  const goToOrders = (status?: string) => {
    Taro.switchTab({ url: '/pages/orders/index' });
  };

  const handleContact = () => {
    Taro.makePhoneCall({
      phoneNumber: '400-123-4567'
    }).catch(err => {
      console.error('[Mine] 拨打电话失败:', err);
    });
  };

  const handleAbout = () => {
    Taro.showModal({
      title: '关于我们',
      content: '物业报修服务平台 v1.0.0\n\n致力于为业主提供便捷、高效的报修服务体验。',
      showCancel: false
    });
  };

  const menuItems = [
    { icon: '📊', title: '统计报表', desc: '查看工单统计数据', onClick: goToStatistics },
    { icon: '📞', title: '联系客服', desc: '400-123-4567', onClick: handleContact },
    { icon: 'ℹ️', title: '关于我们', desc: '版本信息', onClick: handleAbout }
  ];

  const workerMenuItems = [
    { icon: '📋', title: '我的工单', desc: '查看所有指派工单', onClick: () => goToOrders() },
    { icon: '📊', title: '工作统计', desc: '查看个人工作数据', onClick: goToStatistics },
    { icon: '⚙️', title: '设置', desc: '通知、账号设置', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) }
  ];

  const ownerMenuItems = [
    { icon: '🏠', title: '我的房屋', desc: '阳光花园1栋2单元301', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '📋', title: '我的报修', desc: '查看历史报修记录', onClick: () => goToOrders() },
    { icon: '📞', title: '联系客服', desc: '400-123-4567', onClick: handleContact },
    { icon: 'ℹ️', title: '关于我们', desc: '版本信息', onClick: handleAbout }
  ];

  const displayMenuItems = currentUser.role === 'worker' 
    ? workerMenuItems 
    : currentUser.role === 'admin'
      ? menuItems
      : ownerMenuItems;

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      {/* 顶部用户信息 */}
      <View className={styles.header}>
        <View className={styles.userCard}>
          <Image src={currentUser.avatar} className={styles.avatar} mode="aspectFill" />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{currentUser.name}</Text>
            <Text className={styles.userPhone}>{currentUser.phone}</Text>
          </View>
          <View className={styles.roleBadge}>
            <Text className={styles.roleBadgeText}>{getRoleLabel(currentUser.role)}</Text>
          </View>
        </View>

        {/* 数据统计 */}
        <View className={styles.statsRow}>
          <View className={styles.statItem} onClick={() => goToOrders('all')}>
            <Text className={styles.statNumber}>{orderStats.total}</Text>
            <Text className={styles.statLabel}>总工单</Text>
          </View>
          <View className={styles.statItem} onClick={() => goToOrders('pending')}>
            <Text className={styles.statNumber}>{orderStats.pending}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statItem} onClick={() => goToOrders('processing')}>
            <Text className={styles.statNumber}>{orderStats.processing}</Text>
            <Text className={styles.statLabel}>处理中</Text>
          </View>
          <View className={styles.statItem} onClick={() => goToOrders('completed')}>
            <Text className={styles.statNumber}>{orderStats.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      {/* 角色切换 */}
      <View className={styles.menuSection}>
        <View className={styles.switchRoleItem} onClick={handleSwitchRole}>
          <View className={styles.switchRoleLeft}>
            <View className={styles.menuIcon}>🔄</View>
            <Text className={styles.switchRoleText}>切换角色</Text>
          </View>
          <Text className={styles.currentRole}>{getRoleLabel(currentUser.role)}</Text>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className={styles.menuSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>常用功能</Text>
        </View>
        {displayMenuItems.map((item, index) => (
          <View key={index} className={styles.menuItem} onClick={item.onClick}>
            <View className={styles.menuIcon}>{item.icon}</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>{item.title}</Text>
              <Text className={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      {/* 设置 */}
      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={() => Taro.showToast({ title: '设置功能开发中', icon: 'none' })}>
          <View className={styles.menuIcon}>⚙️</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>设置</Text>
            <Text className={styles.menuDesc}>消息通知、隐私设置</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
