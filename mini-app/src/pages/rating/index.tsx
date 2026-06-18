import React, { useState, useEffect } from 'react';
import { View, Text, Image, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classNames from 'classnames';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

const ratingLabels = ['非常不满意', '不满意', '一般', '满意', '非常满意'];
const ratingTags = [
  ['态度差', '速度慢', '不专业', '乱收费'],
  ['态度一般', '速度一般', '技术一般'],
  ['态度好', '速度快', '专业', '干净整洁', '价格合理']
];

const RatingPage: React.FC = () => {
  const router = useRouter();
  const { rateOrder, getOrderById } = useAppStore();
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  const orderId = router.params.id;

  useEffect(() => {
    if (orderId) {
      const order = getOrderById(orderId);
      if (order) {
        setOrderInfo(order);
      }
    }
  }, [orderId, getOrderById]);

  const handleStarClick = (index: number) => {
    setRating(index + 1);
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleContentChange = (e: any) => {
    const value = e.detail.value || e.target?.value || '';
    setContent(value.slice(0, 500));
  };

  const getDisplayTags = () => {
    if (rating <= 2) return ratingTags[0];
    if (rating === 3) return ratingTags[1];
    return ratingTags[2];
  };

  const handleSubmit = () => {
    if (!orderId) return;
    if (rating === 0) {
      Taro.showToast({ title: '请选择评分', icon: 'none' });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const finalContent = content || selectedTags.join('、');
      const success = rateOrder(orderId, rating, finalContent);
      setSubmitting(false);

      if (success) {
        Taro.showToast({
          title: '评价成功',
          icon: 'success',
          duration: 2000
        });
        console.log('[Rating] 评价提交:', rating, '星,', finalContent);
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      }
    }, 500);
  };

  const displayTags = getDisplayTags();

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      {/* 评分星星 */}
      <View className={styles.ratingCard}>
        <Text className={styles.ratingTitle}>请为本次服务打分</Text>
        <View className={styles.starsRow}>
          {[0, 1, 2, 3, 4].map(index => (
            <Text
              key={index}
              className={styles.star}
              onClick={() => handleStarClick(index)}
            >
              {index < rating ? '⭐' : '☆'}
            </Text>
          ))}
        </View>
        <Text className={styles.ratingLabel}>{ratingLabels[rating - 1] || '请评分'}</Text>
        <Text className={styles.ratingDesc}>您的评价对我们很重要</Text>
      </View>

      {/* 维修师傅信息 */}
      {orderInfo && orderInfo.workerName && (
        <View className={styles.workerInfo}>
          <Image
            src="https://picsum.photos/id/1012/200/200"
            className={styles.workerAvatar}
            mode="aspectFill"
          />
          <View className={styles.workerDetail}>
            <Text className={styles.workerName}>{orderInfo.workerName}</Text>
            <Text className={styles.workerType}>{orderInfo.typeName}</Text>
          </View>
        </View>
      )}

      {/* 评价标签 */}
      <View className={styles.tagsSection}>
        <Text className={styles.sectionTitle}>快捷评价</Text>
        <View className={styles.tagsList}>
          {displayTags.map(tag => (
            <View
              key={tag}
              className={classNames(styles.tagItem, selectedTags.includes(tag) && styles.selected)}
              onClick={() => handleTagClick(tag)}
            >
              <Text className={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 评价内容 */}
      <View className={styles.textareaSection}>
        <Text className={styles.sectionTitle}>详细评价</Text>
        <Textarea
          className={styles.textarea}
          placeholder="请输入您的评价内容，帮助其他业主更好地了解服务质量"
          value={content}
          onInput={handleContentChange}
          maxlength={500}
          autoHeight
        />
        <Text className={styles.charCount}>{content.length}/500</Text>
      </View>

      {/* 底部提交按钮 */}
      <View className={styles.bottomBar}>
        <Button
          className={classNames(styles.submitBtn, (rating === 0 || submitting) && styles.disabled)}
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          <Text className={styles.submitBtnText}>
            {submitting ? '提交中...' : '提交评价'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default RatingPage;
