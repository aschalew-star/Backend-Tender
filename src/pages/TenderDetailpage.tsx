import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Info, Clock } from 'lucide-react';
import Navbar from '../component/Layout/Navbar';
import { Button } from '../component/detailpage/Botton';
import { Card, CardHeader, CardTitle, CardContent } from '../component/detailpage/Card';
import { TenderHeader } from '../component/TenderHeader';
import { TabNavigation } from '../component/detailpage/TabNavigation';
import { DynamicDescription } from '../component/detailpage/DaynamicDescription';
import { DocumentsTab } from '../component/detailpage/DocumentsTab';
import { ContactTab } from '../component/detailpage/ContactTab';
import { Sidebar } from '../component/Sidebar';
import { formatDate, getDaysRemaining } from '../component/detailpage/Datautilis';
import { useTender } from '../component/type/useTender';

// Define Tender type for frontend compatibility
interface Tender {
  id: number;
  title: string;
  description: string;
  biddingClosed: string;
  biddingOpen: string;
  category?: { id: number | null; name: string };
  subcategory?: { id: number | null; name: string };
  region?: { id: number | null; name: string };
  postedBy?: { firstName: string; lastName: string; email: string; phoneNo: string };
  approvedBy?: { firstName: string; lastName: string; email: string; phoneNo: string };
  approvedAt?: string | null;
  tenderDocs?: { id: number; name: string; title: string; file: string; price?: string | null; type: string }[];
  biddingDocs?: { id: number; title: string; description: string; company: string; file: string; price?: string | null; type: string }[];
  [key: string]: any; // For additional dynamic fields
}

const TenderDetailApp: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch tender from backend
  useEffect(() => {
    const fetchTender = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/tender/${id}`);
        if (!response.ok) throw new Error('Tender not found');

        const result = await response.json();
        const tenderData = result.data;

        // Provide defaults for safety
        const safeTender: Tender = {
          ...tenderData,
          tenderDocs: tenderData.tenderDocs || [],
          biddingDocs: tenderData.biddingDocs || [],
          postedBy: tenderData.postedBy || { firstName: '', lastName: '', email: '', phoneNo: '' },
          approvedBy: tenderData.approvedBy || { firstName: '', lastName: '', email: '', phoneNo: '' },
          category: tenderData.category || { id: null, name: 'Not specified' },
          subcategory: tenderData.subcategory || { id: null, name: 'Not specified' },
          region: tenderData.region || { id: null, name: 'Not specified' },
          approvedAt: tenderData.approvedAt || null,
        };

        setTender(safeTender);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch tender details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTender();
  }, [id]);

  const handleNavigate = (path: string) => navigate(path);

  const daysRemaining = tender ? getDaysRemaining(tender.biddingClosed) : 0;
  const isExpired = daysRemaining <= 0;

  // Loading
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading...</h1>
            <p className="text-gray-600 mb-8 text-lg">Fetching tender details...</p>
          </div>
        </div>
      </div>
    );

  // Error
  if (error || !tender)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tender Not Found</h1>
            <p className="text-gray-600 mb-8 text-lg">{error || "This tender doesn't exist."}</p>
            <Button onClick={() => handleNavigate('/tenders')} size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Tenders
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Button & Description Mode */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => handleNavigate('/tenders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tenders
            </Button>
            <div className="flex gap-2">
              <Button variant={descriptionMode === 'html' ? 'default' : 'outline'} size="sm" onClick={() => setDescriptionMode('html')}>HTML Demo</Button>
              <Button variant={descriptionMode === 'text' ? 'default' : 'outline'} size="sm" onClick={() => setDescriptionMode('text')}>Plain Text Demo</Button>
              <Button variant={descriptionMode === 'auto' ? 'default' : 'outline'} size="sm" onClick={() => setDescriptionMode('auto')}>Auto Detect</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <TenderHeader
                tender={tender}
                isFavorited={isFavorited}
                onToggleFavorite={handleToggleFavorite}
                onShare={handleShare}
                formatDate={formatDate}
                daysRemaining={daysRemaining}
                isExpired={isExpired}
              />

              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

              <div>
                {activeTab === 'overview' && (
                  <Card className="bg-white/95 backdrop-blur-md border-indigo-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-600" />
                        Project Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DynamicDescription
                        description={tender.description}
                        htmlDescription={descriptionMode === 'html' ? tender.description : undefined}
                      />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'documents' && (
                  <DocumentsTab
                    documents={tender.tenderDocs || []}
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
  );
};

export default TenderDetailApp;
