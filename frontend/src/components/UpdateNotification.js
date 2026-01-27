import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './UpdateNotification.css';

const UpdateNotification = () => {
  const { t } = useTranslation();
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 监听自定义的 swUpdated 事件
    const handleUpdate = () => {
      setShowUpdate(true);
    };

    window.addEventListener('swUpdated', handleUpdate);

    return () => {
      window.removeEventListener('swUpdated', handleUpdate);
    };
  }, []);

  const handleRefresh = () => {
    setIsUpdating(true);
    // 触发页面刷新
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="update-notification">
      <div className="update-content">
        <div className="update-icon">🎉</div>
        <div className="update-text">
          <div className="update-title">{t('update.title')}</div>
          <div className="update-message">{t('update.message')}</div>
        </div>
        <div className="update-actions">
          <button
            className="update-btn update-btn-primary"
            onClick={handleRefresh}
            disabled={isUpdating}
          >
            {isUpdating ? t('update.updating') : t('update.now')}
          </button>
          <button
            className="update-btn update-btn-secondary"
            onClick={handleDismiss}
            disabled={isUpdating}
          >
            {t('update.later')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
