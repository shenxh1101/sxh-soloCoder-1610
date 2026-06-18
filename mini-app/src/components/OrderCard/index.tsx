import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { RepairOrder, ORDER_STATUS } from '@/types';

interface OrderCardProps {
  order: RepairOrder;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const statusInfo = ORDER_STATUS[order.status];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/order-detail/index?id=${order.id}`
      });
    }
  };

  return (
    <View 
      className={classNames(styles.orderCard, order.urgent && styles.urgent)}
      onClick={handleClick}
    >
      <View className={styles.cardHeader}>
        <View className={styles.leftInfo}>
          <Text className={styles.typeIcon}>
            {order.type === 'water_electric' && '💡'}
            {order.type === 'access_control' && '🔐'}
            {order.type === 'elevator' && '🛗'}
            {order.type === 'other' && '🔧'}
          </Text>
          <Text className={styles.typeName}>{order.typeName}</Text>
          {order.urgent && (
            <View className={styles.urgentTag}>
              <Text className={styles.urgentText}>紧急</Text>
            </View>
          )}
        </View>
        <View 
          className={styles.statusTag}
          style={{ color: statusInfo.color, backgroundColor: `${statusInfo.color}15` }}
        >
          <Text className={styles.statusText}>{statusInfo.label}</Text>
        </View>
      </View>

      <View className={styles.cardBody}>
        <Text className={styles.description}>{order.description}</Text>
        {order.images.length > 0 && (
          <View className={styles.imageList}>
            {order.images.slice(0, 3).map((img, idx) => (
              <Image 
                key={idx} 
                src={img} 
                className={styles.previewImage}
                mode="aspectFill"
              />
            ))}
            {order.images.length > 3 && (
              <View className={styles.moreImages}>
                <Text className={styles.moreText}>+{order.images.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.footerLeft}>
          <Text className={styles.orderNo}>工单号: {order.orderNo}</Text>
        </View>
        <Text className={styles.time}>{order.submitTime}</Text>
      </View>

      {order.urgent && (
        <View className={styles.urgentBorder} />
      )}
    </View>
  );
};

export default OrderCard;
