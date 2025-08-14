import { useState, useCallback } from 'react';
import type{ Tender, TenderDoc } from './Tender';

export const useTender = (tender: Tender | null) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [descriptionMode, setDescriptionMode] = useState<'auto' | 'html' | 'text'>('auto');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorited(prev => !prev);
    // Here you would typically make an API call to update the favorite status
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: tender?.title || 'Tender Details',
        text: tender?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, [tender]);

  const handleDocumentDownload = useCallback((doc: TenderDoc) => {
    if (doc.type === 'PAID' && !isSubscribed) {
      alert('Please subscribe to download paid documents');
      return;
    }
    console.log(`Downloading: ${doc.name}`);
    // Here you would typically trigger the actual download
  }, [isSubscribed]);

  return {
    isFavorited,
    activeTab,
    descriptionMode,
    isSubscribed,
    setActiveTab,
    setDescriptionMode,
    setIsSubscribed,
    handleToggleFavorite,
    handleShare,
    handleDocumentDownload,
  };
};