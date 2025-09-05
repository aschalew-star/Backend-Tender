import React from 'react';
import { Calendar, Clock, MapPin, Tag, Heart, Share2, Bookmark } from 'lucide-react';
import { Card, CardHeader } from '../component/detailpage/Card';
import { Badge } from '../component/detailpage/Bage';
import { Button } from '../component/detailpage/Botton';
import { type Tender } from './type/Tender';

interface TenderHeaderProps {
  tender: Tender;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  formatDate: (date: Date) => string;
  daysRemaining: number;
  isExpired: boolean;
}

export const TenderHeader: React.FC<TenderHeaderProps> = ({
  tender,
  isFavorited,
  onToggleFavorite,
  onShare,
  formatDate,
  daysRemaining,
  isExpired,
}) => (
  <Card className="bg-white/95 backdrop-blur-md border-indigo-100 transform transition-all duration-300 hover:scale-[1.02]">
    <CardHeader>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">{tender.title}</h1>
              <div className="flex items-center gap-3">
                <Badge
                  variant={tender.type === 'PAID' ? 'default' : 'secondary'}
                  className="text-sm px-3 py-1"
                >
                  {tender.type}
                </Badge>
                <button
                  onClick={onToggleFavorite}
                  className={`
                    p-2 rounded-full transition-all duration-200 transform hover:scale-110
                    ${isFavorited ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}
                  `}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bidding Opens */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Bidding Opens</span>
                </div>
                <p className="text-blue-800 font-medium">{formatDate(tender.biddingOpen)}</p>
              </div>

              {/* Bidding Closes */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-100 transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">Bidding Closes</span>
                </div>
                <p className="text-red-800 font-medium">{formatDate(tender.biddingClosed)}</p>
              </div>

              {/* Region */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Region</span>
                </div>
                <p className="text-green-800 font-medium">
                  {tender.region?.name ?? 'Not specified'}
                </p>
              </div>

              {/* Category + Subcategory */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100 transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">Category</span>
                </div>
                <p className="text-purple-800 font-medium">
                  {tender.category?.name ?? 'No Category'}
                  {tender.subcategory ? ` - ${tender.subcategory.name}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 transform transition-all duration-200 hover:scale-105">
          <div className="text-center">
            <div
              className={`text-2xl font-bold mb-2 ${
                isExpired
                  ? 'text-red-600'
                  : daysRemaining <= 7
                  ? 'text-orange-600'
                  : 'text-green-600'
              }`}
            >
              {isExpired ? 'Expired' : `${daysRemaining} days`}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {isExpired ? 'Bidding closed' : 'remaining'}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                className={isFavorited ? 'text-red-500' : 'text-gray-500'}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  </Card>
);
