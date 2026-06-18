import React, { useState } from 'react';
import { View, Text, Image, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { useAppStore } from '@/store';
import { REPAIR_TYPES, RepairType } from '@/types';
import styles from './index.module.scss';

const RepairPage: React.FC = () => {
  const { submitRepair, currentUser } = useAppStore();
  const [selectedType, setSelectedType] = useState<RepairType | ''>('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleTypeSelect = (type: RepairType) => {
    setSelectedType(type);
  };

  const handleDescriptionChange = (e: any) => {
    const value = e.detail.value || e.target?.value || '';
    setDescription(value.slice(0, 500));
  };

  const handleChooseImage = async () => {
    if (images.length >= 9) {
      Taro.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }

    try {
      const res = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      const tempFiles = res.tempFilePaths || [];
      setImages([...images, ...tempFiles]);
      console.log('[Repair] 选择图片:', tempFiles.length, '张');
    } catch (err) {
      console.error('[Repair] 选择图片失败:', err);
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const toggleUrgent = () => {
    setIsUrgent(!isUrgent);
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Taro.showToast({ title: '请选择报修类型', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请填写报修描述', icon: 'none' });
      return;
    }

    setSubmitting(true);
    
    const typeInfo = REPAIR_TYPES.find(t => t.value === selectedType)!;
    const newOrder = await submitRepair({
      type: selectedType,
      typeName: typeInfo.label,
      description: description.trim(),
      images,
      urgent: isUrgent
    });

    setSubmitting(false);
    
    if (newOrder) {
      Taro.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      });

      console.log('[Repair] 工单已提交:', newOrder.orderNo);

      setTimeout(() => {
        setSelectedType('');
        setDescription('');
        setImages([]);
        setIsUrgent(false);
        Taro.switchTab({ url: '/pages/orders/index' });
      }, 1500);
    } else {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
    }
  };

  const canSubmit = selectedType && description.trim().length > 0 && !submitting;

  if (currentUser.role !== 'owner') {
    return (
      <View className={styles.pageContainer}>
        <View style={{ textAlign: 'center', padding: '200rpx 32rpx' }}>
          <Text style={{ fontSize: '80rpx', display: 'block', marginBottom: '32rpx' }}>🔧</Text>
          <Text style={{ fontSize: '32rpx', color: '#1d2129', fontWeight: '600', display: 'block', marginBottom: '16rpx' }}>
            仅业主可提交报修
          </Text>
          <Text style={{ fontSize: '28rpx', color: '#86909c' }}>
            请切换到业主角色后再提交报修工单
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      {/* 报修类型 */}
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>报修类型</Text>
        <View className={styles.typeGrid}>
          {REPAIR_TYPES.map(item => (
            <View
              key={item.value}
              className={classNames(styles.typeItem, selectedType === item.value && styles.selected)}
              onClick={() => handleTypeSelect(item.value)}
            >
              <Text className={styles.typeIcon}>{item.icon}</Text>
              <Text className={styles.typeLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 报修描述 */}
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>问题描述</Text>
        <View className={styles.formItem}>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述您遇到的问题，例如：具体位置、问题现象、方便维修的时间等"
            placeholderClass={styles.textareaPlaceholder}
            value={description}
            onInput={handleDescriptionChange}
            maxlength={500}
            autoHeight
          />
          <Text className={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* 图片上传 */}
        <View className={styles.uploadSection}>
          <Text className={styles.formLabel}>上传图片（可选，最多9张）</Text>
          <View className={styles.imageList}>
            {images.map((img, idx) => (
              <View key={idx} className={styles.imageItem}>
                <Image src={img} className={styles.uploadImage} mode="aspectFill" />
                <View className={styles.deleteBtn} onClick={() => handleDeleteImage(idx)}>
                  <Text className={styles.deleteText}>×</Text>
                </View>
              </View>
            ))}
            {images.length < 9 && (
              <View className={styles.addBtn} onClick={handleChooseImage}>
                <Text className={styles.addIcon}>+</Text>
                <Text className={styles.addText}>添加图片</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 紧急标记 */}
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>其他设置</Text>
        <View className={styles.urgentSection} onClick={toggleUrgent}>
          <View className={styles.urgentLeft}>
            <Text className={styles.urgentIcon}>🚨</Text>
            <View>
              <Text className={styles.urgentText}>紧急报修</Text>
              <Text className={styles.urgentDesc}>紧急情况将优先安排处理</Text>
            </View>
          </View>
          <View className={classNames(styles.switch, isUrgent && styles.active)}>
            <View className={styles.switchDot} />
          </View>
        </View>
      </View>

      {/* 温馨提示 */}
      <View className={styles.formSection}>
        <View className={styles.tipsSection}>
          <Text className={styles.tipsTitle}>💡 温馨提示</Text>
          <Text className={styles.tipsText}>
            1. 提交后工作人员会尽快与您联系，请保持电话畅通{'\n'}
            2. 水电、电梯等紧急故障请务必标记"紧急报修"{'\n'}
            3. 上传图片能帮助维修人员更好地了解问题
          </Text>
        </View>
      </View>

      {/* 底部提交按钮 */}
      <View className={styles.submitBar}>
        <Button
          className={classNames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          <Text className={styles.submitBtnText}>
            {submitting ? '提交中...' : '提交报修'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default RepairPage;
