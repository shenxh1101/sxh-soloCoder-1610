import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { REPAIR_TYPES } from '@/types';
import styles from './index.module.scss';

const StatisticsPage: React.FC = () => {
  const { getStatistics, getOrdersByRole } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  const [maxTypeCount, setMaxTypeCount] = useState(0);
  const [maxMonthCount, setMaxMonthCount] = useState(0);

  useEffect(() => {
    const statsData = getStatistics();
    setStats(statsData);

    if (statsData.typeStats.length > 0) {
      setMaxTypeCount(Math.max(...statsData.typeStats.map((t: any) => t.count)));
    }
    if (statsData.monthlyStats.length > 0) {
      setMaxMonthCount(Math.max(...statsData.monthlyStats.map((m: any) => m.count)));
    }
  }, [getStatistics]);

  const getTypeIcon = (type: string) => {
    const typeItem = REPAIR_TYPES.find(t => t.value === type);
    return typeItem?.icon || '🔧';
  };

  const handleExportDetail = () => {
    Taro.showLoading({ title: '正在导出...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '导出成功',
        icon: 'success'
      });
      console.log('[Statistics] 导出工单明细');
    }, 1000);
  };

  const handleExportReport = () => {
    Taro.showLoading({ title: '正在生成报表...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showModal({
        title: '报表已生成',
        content: '统计报表已生成，是否立即查看？',
        confirmText: '查看',
        success: (res) => {
          if (res.confirm) {
            Taro.showToast({ title: '报表预览', icon: 'none' });
          }
        }
      });
      console.log('[Statistics] 导出统计报表');
    }, 1500);
  };

  if (!stats) {
    return (
      <View className={styles.pageContainer}>
        <View style={{ textAlign: 'center', padding: '200rpx 0' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      {/* 头部 */}
      <View className={styles.header}>
        <Text className={styles.pageTitle}>数据统计</Text>
        <Text className={styles.pageSubtitle}>实时掌握工单运营数据</Text>
      </View>

      {/* 概览数据 */}
      <View className={styles.statsCard}>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.totalOrders}</Text>
            <Text className={styles.statLabel}>总工单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#ff7d00' }}>{stats.pendingOrders}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#722ed1' }}>{stats.processingOrders}</Text>
            <Text className={styles.statLabel}>处理中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#00b42a' }}>{stats.completedOrders}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
        <View className={styles.timeStats}>
          <View className={styles.timeStatItem}>
            <Text className={styles.timeStatValue}>{stats.avgResponseTime} 分钟</Text>
            <Text className={styles.timeStatLabel}>平均响应时间</Text>
          </View>
          <View className={styles.timeStatItem}>
            <Text className={styles.timeStatValue}>{Math.floor(stats.avgCompleteTime / 60)} 小时</Text>
            <Text className={styles.timeStatLabel}>平均完成时间</Text>
          </View>
        </View>
      </View>

      {/* 类型分布 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>报修类型分布</Text>
        <View className={styles.typeList}>
          {stats.typeStats.map((item: any, index: number) => (
            <View key={index} className={styles.typeItem}>
              <View className={styles.typeIcon}>{getTypeIcon(item.type)}</View>
              <View className={styles.typeInfo}>
                <Text className={styles.typeName}>{item.typeName}</Text>
                <View className={styles.typeBar}>
                  <View
                    className={styles.typeBarFill}
                    style={{ width: `${maxTypeCount > 0 ? (item.count / maxTypeCount) * 100 : 0}%` }}
                  />
                </View>
              </View>
              <Text className={styles.typeCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 月度趋势 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>月度工单趋势</Text>
        <View className={styles.monthChart}>
          {stats.monthlyStats.map((item: any, index: number) => (
            <View key={index} className={styles.monthBar}>
              <Text className={styles.monthValue}>{item.count}</Text>
              <View
                className={styles.monthBarFill}
                style={{ height: `${maxMonthCount > 0 ? (item.count / maxMonthCount) * 200 : 0}rpx` }}
              />
              <Text className={styles.monthLabel}>{item.month}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 导出功能 */}
      <View className={styles.exportSection}>
        <Button className={styles.exportBtn} onClick={handleExportDetail}>
          <Text className={styles.exportIcon}>📋</Text>
          <Text className={styles.exportText}>导出明细</Text>
        </Button>
        <Button className={styles.primaryExportBtn} onClick={handleExportReport}>
          <Text className={styles.exportIcon}>📊</Text>
          <Text className={styles.exportText}>生成报表</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default StatisticsPage;
