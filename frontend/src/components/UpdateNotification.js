import React, { useState, useEffect } from 'react';
import './UpdateNotification.css';

const UpdateNotification = () => {
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
          <div className="update-title">新版本可用</div>
          <div className="update-message">有新功能和改进等你体验</div>
        </div>
        <div className="update-actions">
          <button
            className="update-btn update-btn-primary"
            onClick={handleRefresh}
            disabled={isUpdating}
          >
            {isUpdating ? '更新中...' : '立即更新'}
          </button>
          <button
            className="update-btn update-btn-secondary"
            onClick={handleDismiss}
            disabled={isUpdating}
          >
            稍后
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
