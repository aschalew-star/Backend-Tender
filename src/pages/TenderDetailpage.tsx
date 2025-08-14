import React from 'react';
import { ArrowLeft, AlertCircle, Info, Clock } from 'lucide-react';
// import { Navbar } from '../component/detailpage/Navbar';
import Navbar from '../component/Layout/Navbar';
import { Button } from '../component/detailpage/Botton';
import { Card, CardHeader, CardTitle, CardContent } from '../component/detailpage/Card';
import { TenderHeader } from '../component/TenderHeader';
import { TabNavigation } from '../component/detailpage/TabNavigation';
import { DynamicDescription } from '../component/detailpage/DaynamicDescription';
import { DocumentsTab } from '../component/detailpage/DocumentsTab';
import { ContactTab } from '../component/detailpage/ContactTab';
import { Sidebar } from '../component/Sidebar';
import { mockTenders, mockHtmlDescription } from '../component/mockData';
import { formatDate, getDaysRemaining } from '../component/detailpage/Datautilis';
import { useTender } from '../component/type/useTender';

const TenderDetailApp: React.FC = () => {
  const tender = mockTenders[0]; // In a real app, this would come from props or URL params
  const {
    isFavorited,
    activeTab,
    descriptionMode,
    setActiveTab,
    setDescriptionMode,
    handleToggleFavorite,
    handleShare,
    handleDocumentDownload,
  } = useTender(tender);

  const navigate = (path: string) => {
    window.location.href = path;
  };

  if (!tender) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Tender Not Found</h1>
              <p className="text-gray-600 mb-8 text-lg">
                The tender you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/tenders')} size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Tenders
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(tender.biddingClosed);
  const isExpired = daysRemaining <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      {/* Enhanced CSS Styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced Description Styles */
        .tender-description {
          font-family: 'Inter', sans-serif;
          line-height: 1.7;
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #4f46e5;
          margin: 1.5rem 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e0e7ff;
        }
        .highlight-text {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 1rem;
          border-radius: 0.75rem;
          border-left: 4px solid #4f46e5;
          margin: 1rem 0;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }
        .feature-list li {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          margin: 0.5rem 0;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
          transition: transform 0.2s;
        }
        .feature-list li:hover {
          transform: translateX(4px);
        }
        .feature-icon {
          font-size: 1.25rem;
          margin-right: 0.75rem;
        }
        .requirements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }
        .requirement-card {
          background: white;
          padding: 1.25rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }
        .requirement-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }
        .requirement-card h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        /* Enhanced Plain Text Styles */
        .dynamic-description.plain-text {
          font-family: 'Inter', sans-serif;
          line-height: 1.7;
        }
        .enhanced-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: #4f46e5;
          margin: 1.5rem 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e0e7ff;
          text-transform: capitalize;
        }
        .enhanced-paragraph {
          margin: 1rem 0;
          color: #374151;
          font-size: 1rem;
          line-height: 1.7;
        }
        .enhanced-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
          background: #f8fafc;
          border-radius: 0.75rem;
          padding: 1rem;
          border: 1px solid #e2e8f0;
        }
        .enhanced-list-item {
          display: flex;
          align-items: flex-start;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
          position: relative;
          padding-left: 1.5rem;
          transition: background-color 0.2s;
        }
        .enhanced-list-item:hover {
          background-color: #f1f5f9;
          border-radius: 0.5rem;
        }
        .enhanced-list-item:last-child {
          border-bottom: none;
        }
        .enhanced-list-item:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #4f46e5;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .enhanced-key-value {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0.75rem 0;
          padding: 1rem;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 0.5rem;
          border-left: 4px solid #4f46e5;
        }
        .enhanced-key-value .key {
          font-weight: 600;
          color: #374151;
          min-width: 120px;
        }
        .enhanced-key-value .value {
          color: #6b7280;
          flex: 1;
        }

        @media (max-width: 768px) {
          .requirements-grid {
            grid-template-columns: 1fr;
          }
          .enhanced-key-value {
            flex-direction: column;
            gap: 0.25rem;
          }
          .enhanced-key-value .key {
            min-width: auto;
          }
        }
      `}</style>

      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="animate-fade-in mb-8">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/tenders')}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tenders
              </Button>

              <div className="flex gap-2">
                <Button
                  variant={descriptionMode === 'html' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDescriptionMode('html')}
                >
                  HTML Demo
                </Button>
                <Button
                  variant={descriptionMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDescriptionMode('text')}
                >
                  Plain Text Demo
                </Button>
                <Button
                  variant={descriptionMode === 'auto' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDescriptionMode('auto')}
                >
                  Auto Detect
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Header */}
              <div className="animate-fade-in">
                <TenderHeader
                  tender={tender}
                  isFavorited={isFavorited}
                  onToggleFavorite={handleToggleFavorite}
                  onShare={handleShare}
                  formatDate={formatDate}
                  daysRemaining={daysRemaining}
                  isExpired={isExpired}
                />
              </div>

              {/* Tabs Navigation */}
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {activeTab === 'overview' && (
                  <Card className="bg-white/95 backdrop-blur-md border-indigo-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-600" />
                        Project Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 flex gap-2">
                        <Button
                          variant={descriptionMode === 'auto' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDescriptionMode('auto')}
                        >
                          Auto Detect
                        </Button>
                        <Button
                          variant={descriptionMode === 'html' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDescriptionMode('html')}
                        >
                          HTML Mode
                        </Button>
                        <Button
                          variant={descriptionMode === 'text' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDescriptionMode('text')}
                        >
                          Plain Text
                        </Button>
                      </div>

                      <DynamicDescription
                        description={tender.description}
                        htmlDescription={
                          descriptionMode === 'html'
                            ? mockHtmlDescription
                            : descriptionMode === 'text'
                            ? undefined
                            : tender.description
                        }
                      />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'documents' && (
                  <DocumentsTab
                    documents={tender.tenderDocs}
                    formatDate={formatDate}
                    onDocumentDownload={handleDocumentDownload}
                  />
                )}

                {activeTab === 'timeline' && (
                  <Card className="bg-white/95 backdrop-blur-md border-indigo-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        Project Timeline & Milestones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Timeline information will be available soon.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'contact' && <ContactTab postedBy={tender.postedBy} />}
              </div>
            </div>

            {/* Sidebar */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Sidebar
                tender={tender}
                formatDate={formatDate}
                getDaysRemaining={getDaysRemaining}
                isExpired={isExpired}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderDetailApp;