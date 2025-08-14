import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, Lock, Star, FileText, Calendar, MapPin, Tag, Users, DollarSign, Clock, Shield, CheckCircle } from 'lucide-react';
import type { Tender, TenderDoc } from './type/Tender';

interface TenderDocPageProps {
  tender: Tender;
  isSubscribed: boolean;
  onBack: () => void;
}

export function TenderDocPage({ tender, isSubscribed, onBack }: TenderDocPageProps) {
  const [selectedDoc, setSelectedDoc] = useState<TenderDoc | null>(null);
  
  const canViewDates = isSubscribed || tender.type === 'FREE';
  const canDownloadDocs = isSubscribed || tender.type === 'FREE';
  const isExpired = new Date(tender.biddingClosed) < new Date();
  const daysLeft = Math.ceil((new Date(tender.biddingClosed).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (doc: TenderDoc) => {
    if (!canDownloadDocs && doc.type === 'PAID') {
      return;
    }
    // Simulate download
    console.log('Downloading:', doc.name);
  };

  const mockDocs: TenderDoc[] = [
    {
      id: 1,
      name: 'tender_specifications.pdf',
      title: 'Technical Specifications',
      file: '/docs/tender_specifications.pdf',
      type: 'FREE',
      createdAt: '2024-01-15T10:00:00Z',
      tenderId: tender.id,
    },
    {
      id: 2,
      name: 'bidding_guidelines.pdf',
      title: 'Bidding Guidelines & Requirements',
      file: '/docs/bidding_guidelines.pdf',
      type: 'FREE',
      createdAt: '2024-01-15T10:00:00Z',
      tenderId: tender.id,
    },
    {
      id: 3,
      name: 'detailed_drawings.dwg',
      title: 'Detailed Engineering Drawings',
      file: '/docs/detailed_drawings.dwg',
      type: 'PAID',
      price: 150,
      createdAt: '2024-01-15T10:00:00Z',
      tenderId: tender.id,
    },
    {
      id: 4,
      name: 'financial_requirements.xlsx',
      title: 'Financial Requirements & Budget',
      file: '/docs/financial_requirements.xlsx',
      type: 'PAID',
      price: 75,
      createdAt: '2024-01-15T10:00:00Z',
      tenderId: tender.id,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-gray-200/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  tender.type === 'FREE' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                }`}>
                  {tender.type === 'FREE' ? '🆓 FREE TENDER' : '💎 PREMIUM TENDER'}
                </span>
                {!isExpired && daysLeft <= 7 && (
                  <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-bold animate-pulse">
                    ⏰ {daysLeft} days remaining
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{tender.title}</h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-500" />
                  <span>{tender.category.name} • {tender.subcategory.name}</span>
                </div>
                {tender.region && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{tender.region.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tender Overview */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                Tender Overview
              </h2>
              
              {tender.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Description</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">{tender.description}</p>
                </div>
              )}

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {canViewDates ? (
                  <>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-green-800">Opening Date</h4>
                      </div>
                      <p className="text-gray-800 font-semibold text-lg">
                        📅 {formatDate(tender.biddingOpen)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-red-800">Closing Date</h4>
                      </div>
                      <p className="text-gray-800 font-semibold text-lg">
                        📅 {formatDate(tender.biddingClosed)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
                    <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl w-fit mx-auto mb-4">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-amber-800 text-xl font-bold mb-3">🔒 Premium Information</h4>
                    <p className="text-amber-700 font-medium mb-6">
                      Subscribe to access opening and closing dates, detailed specifications, and premium documents
                    </p>
                    <button className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-xl">
                      ⭐ Upgrade to Premium
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                Tender Documents
                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold">
                  {mockDocs.length} files
                </span>
              </h2>

              <div className="grid gap-6">
                {mockDocs.map((doc) => {
                  const canAccess = canDownloadDocs || doc.type === 'FREE';
                  
                  return (
                    <div
                      key={doc.id}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        canAccess
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 hover:border-blue-300 hover:shadow-lg'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-3 rounded-2xl ${
                            doc.type === 'FREE' 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}>
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{doc.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{doc.name}</p>
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                doc.type === 'FREE' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {doc.type === 'FREE' ? '🆓 FREE' : `💎 $${doc.price}`}
                              </span>
                              <span className="text-xs text-gray-500">
                                📅 {formatDate(doc.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {canAccess ? (
                            <>
                              <button
                                onClick={() => setSelectedDoc(doc)}
                                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                title="Preview"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                title="Download"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-gray-300 rounded-2xl">
                                <Lock className="w-5 h-5 text-gray-500" />
                              </div>
                              <button className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-sm font-bold hover:from-amber-700 hover:to-orange-700 transition-all duration-300">
                                Subscribe
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Documents</span>
                  </div>
                  <span className="font-bold text-blue-600">{mockDocs.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">Bidders</span>
                  </div>
                  <span className="font-bold text-emerald-600">24</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Views</span>
                  </div>
                  <span className="font-bold text-purple-600">1.2k</span>
                </div>
              </div>
            </div>

            {/* Subscription CTA */}
            {!isSubscribed && (
              <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl mb-4">⭐</div>
                  <h3 className="text-2xl font-bold mb-3">Unlock Premium</h3>
                  <p className="text-purple-100 mb-6 leading-relaxed">
                    Get access to all tender documents, detailed specifications, and exclusive bidding information
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span className="text-sm">Unlimited document downloads</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span className="text-sm">Early access to new tenders</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span className="text-sm">Priority customer support</span>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-white/20 backdrop-blur-sm rounded-2xl font-bold hover:bg-white/30 transition-all duration-300 transform hover:scale-105 text-lg">
                    🚀 Subscribe Now
                  </button>
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Need Help?
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">
                  Have questions about this tender? Our support team is here to help.
                </p>
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                  📞 Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{selectedDoc.title}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 h-96 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Document preview would appear here</p>
                <p className="text-sm text-gray-500 mt-2">{selectedDoc.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}