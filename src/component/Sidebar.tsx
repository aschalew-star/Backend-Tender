import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Award, Building2, MessageCircle, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../component/detailpage/Card';
import { Button } from '../component/detailpage/Botton';
import { type Tender } from './type/Tender';

interface SidebarProps {
  tender: Tender;
  formatDate: (date: Date) => string;
  getDaysRemaining: (date: Date) => number;
  isExpired: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ tender, formatDate, getDaysRemaining, isExpired }) => {
  // Safe defaults
  const tenderDocs = tender.tenderDocs ?? [];
  const postedBy = tender.postedBy ?? { firstName: 'System', lastName: '' };
  const approvedBy = tender.approvedBy ?? { firstName: 'Pending', lastName: '' };
  const regionName = tender.region?.name ?? 'Not specified';
  const approvedDate = tender.approvedAt ? formatDate(tender.approvedAt) : 'Pending';

  return (
    <div className="space-y-6">

      {/* Key Information */}
      <Card className="bg-white/95 backdrop-blur-md border-indigo-100">
        <CardHeader>
          <CardTitle className="text-lg">Key Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Bidding Opens</p>
              <p className="text-sm text-gray-600">{formatDate(tender.biddingOpen)}</p>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Bidding Closes</p>
              <p className="text-sm text-gray-600">{formatDate(tender.biddingClosed)}</p>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Region</p>
              <p className="text-sm text-gray-600">{regionName}</p>
            </div>
          </div>

          {tender.approvedAt && (
            <>
              <hr className="my-4 border-gray-200" />
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Approved</p>
                  <p className="text-sm text-gray-600">{approvedDate}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* CTA Card */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl">
        <CardContent className="p-6">
          <div className="text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-white/90" />
            <h3 className="text-xl font-bold mb-2">Ready to Bid?</h3>
            <p className="text-indigo-100 mb-6 text-sm">
              Download the tender documents and submit your proposal before the deadline.
            </p>
            <Button
              className="w-full bg-white text-indigo-600 hover:bg-gray-100 shadow-lg mb-3"
              disabled={isExpired}
              size="lg"
            >
              <Building2 className="w-5 h-5 mr-2" />
              {isExpired ? 'Bidding Closed' : 'Start Bidding Process'}
            </Button>
            <Button variant="ghost" className="w-full text-white hover:bg-white/10">
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask Questions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white/95 backdrop-blur-md border-indigo-100">
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div>
                <h3 className="font-semibold text-indigo-900">Days Remaining</h3>
                <p className="text-2xl font-bold text-indigo-600">{getDaysRemaining(tender.biddingClosed)}</p>
              </div>
              <Clock className="w-8 h-8 text-indigo-500" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-600">Posted By</span>
                <span className="font-medium text-gray-900">{`${postedBy.firstName} ${postedBy.lastName}`}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-600">Approved By</span>
                <span className="font-medium text-gray-900">{`${approvedBy.firstName} ${approvedBy.lastName}`}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-600">Approved Date</span>
                <span className="font-medium text-gray-900">{approvedDate}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-600">Documents</span>
                <span className="font-medium text-gray-900">{tenderDocs.length} files</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
