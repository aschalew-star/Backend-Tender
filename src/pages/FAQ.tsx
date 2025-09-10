import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Users, 
  FileText, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle,
  MessageCircle,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  helpful?: number;
  tags?: string[];
}
import Navbar from '../component/Layout/Navbar';

const faqData: FAQItem[] = [
  // Account & Registration
  {
    id: 1,
    question: "How do I create an account on the tender platform?",
    answer: "To create an account, click on the 'Sign Up' button on the homepage. Fill in your details including first name, last name, email, and phone number. You'll automatically be registered as a customer and can immediately start browsing available tenders.",
    category: "Account",
    helpful: 45,
    tags: ["registration", "signup", "account"]
  },
  {
    id: 2,
    question: "What are the different user roles available?",
    answer: "Our platform supports four user roles: Customer (default for general users), Data Entry (for content management), Admin (for administrative functions), and Super User (full system access). Each role has specific permissions and access levels.",
    category: "Account",
    helpful: 32,
    tags: ["roles", "permissions", "access"]
  },
  {
    id: 3,
    question: "How do I reset my password?",
    answer: "On the login page, click 'Forgot Password' and enter your email address. You'll receive instructions to reset your password. Make sure to check your spam folder if you don't see the email within a few minutes.",
    category: "Account",
    helpful: 28,
    tags: ["password", "reset", "login"]
  },

  // Tenders & Bidding
  {
    id: 4,
    question: "How do I find and browse available tenders?",
    answer: "Navigate to the 'Tenders' section from the main menu. You can filter tenders by category, subcategory, region, and bidding status. Use the search function to find specific tenders by keywords or company names.",
    category: "Tenders",
    helpful: 67,
    tags: ["browse", "search", "filter"]
  },
  {
    id: 5,
    question: "What's the difference between free and paid tenders?",
    answer: "Free tenders allow you to view basic information and submit bids at no cost. Paid tenders require a subscription or one-time payment to access detailed documents, specifications, and participate in the bidding process.",
    category: "Tenders",
    helpful: 54,
    tags: ["pricing", "subscription", "access"]
  },
  {
    id: 6,
    question: "How do I submit a bid for a tender?",
    answer: "After viewing a tender's details, click 'Submit Bid' if you're eligible. Upload your bidding documents, enter your proposed price, and company information. Ensure all required documents are attached before submission.",
    category: "Tenders",
    helpful: 89,
    tags: ["bidding", "submit", "documents"]
  },
  {
    id: 7,
    question: "Can I edit my bid after submission?",
    answer: "Bid modifications depend on the tender's status and deadline. Generally, you can edit bids before the bidding deadline closes. Contact support if you need assistance with bid modifications.",
    category: "Tenders",
    helpful: 23,
    tags: ["edit", "modify", "deadline"]
  },

  // Payments & Subscriptions
  {
    id: 8,
    question: "What payment methods do you accept?",
    answer: "We accept payments through various banks integrated into our system. You can pay using bank transfers, and all payments require admin approval for security purposes. Check the 'Payment' section for supported banks.",
    category: "Payments",
    helpful: 41,
    tags: ["payment", "banks", "transfer"]
  },
  {
    id: 9,
    question: "How do subscription plans work?",
    answer: "We offer flexible subscription plans: 3-month, 6-month, and yearly options. Subscriptions give you access to premium tenders and advanced features. Your subscription status and end date are visible in your billing section.",
    category: "Payments",
    helpful: 36,
    tags: ["subscription", "plans", "billing"]
  },
  {
    id: 10,
    question: "How long does payment approval take?",
    answer: "Payment approvals typically take 1-3 business days. You'll receive notifications once your payment is approved and your subscription is activated. You can track payment status in your billing dashboard.",
    category: "Payments",
    helpful: 19,
    tags: ["approval", "processing", "timeline"]
  },

  // Documents & Downloads
  {
    id: 11,
    question: "How do I download tender documents?",
    answer: "Navigate to the 'Documents' section or click on a specific tender. If the documents are free, you can download immediately. For paid documents, you'll need an active subscription or to purchase access.",
    category: "Documents",
    helpful: 72,
    tags: ["download", "documents", "access"]
  },
  {
    id: 12,
    question: "What file formats are supported for document uploads?",
    answer: "We support common file formats including PDF, DOC, DOCX, XLS, XLSX, and image formats (JPG, PNG). File size limit is typically 10MB per document. Ensure documents are clear and readable.",
    category: "Documents",
    helpful: 15,
    tags: ["formats", "upload", "size"]
  },

  // Notifications & Alerts
  {
    id: 13,
    question: "How do I set up tender notifications?",
    answer: "Go to 'Notification Settings' to configure your preferences. You can choose to receive notifications in the morning, afternoon, evening, or daily summaries. Set up reminders for categories, subcategories, and regions of interest.",
    category: "Notifications",
    helpful: 58,
    tags: ["notifications", "settings", "reminders"]
  },
  {
    id: 14,
    question: "Why am I not receiving notifications?",
    answer: "Check your notification settings and ensure your email is verified. Also verify that notifications aren't going to your spam folder. You can view notification history in the 'Notifications' section.",
    category: "Notifications",
    helpful: 34,
    tags: ["troubleshooting", "email", "spam"]
  },

  // Technical Support
  {
    id: 15,
    question: "What browsers are supported?",
    answer: "Our platform works best on modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, ensure your browser is updated to the latest version and JavaScript is enabled.",
    category: "Technical",
    helpful: 12,
    tags: ["browsers", "compatibility", "requirements"]
  },
  {
    id: 16,
    question: "Is my data secure on the platform?",
    answer: "Yes, we implement industry-standard security measures including data encryption, secure authentication, and role-based access control. Your personal and business information is protected according to data privacy regulations.",
    category: "Technical",
    helpful: 87,
    tags: ["security", "privacy", "encryption"]
  },

  // General Support
  {
    id: 17,
    question: "How can I contact customer support?",
    answer: "You can reach our support team through the contact form on our website, email us directly, or call our support hotline during business hours. We typically respond to inquiries within 24 hours.",
    category: "Support",
    helpful: 93,
    tags: ["contact", "support", "help"]
  },
  {
    id: 18,
    question: "Can I request new features or improvements?",
    answer: "Absolutely! We value user feedback. Submit feature requests through our support channels or feedback form. Popular requests are prioritized in our development roadmap.",
    category: "Support",
    helpful: 26,
    tags: ["features", "feedback", "improvements"]
  }
];

const categories = [
  { name: "All", icon: HelpCircle, color: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800", count: faqData.length },
  { name: "Account", icon: Users, color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800", count: faqData.filter(f => f.category === "Account").length },
  { name: "Tenders", icon: FileText, color: "bg-gradient-to-r from-green-100 to-green-200 text-green-800", count: faqData.filter(f => f.category === "Tenders").length },
  { name: "Payments", icon: CreditCard, color: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800", count: faqData.filter(f => f.category === "Payments").length },
  { name: "Documents", icon: FileText, color: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800", count: faqData.filter(f => f.category === "Documents").length },
  { name: "Notifications", icon: Bell, color: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800", count: faqData.filter(f => f.category === "Notifications").length },
  { name: "Technical", icon: Shield, color: "bg-gradient-to-r from-red-100 to-red-200 text-red-800", count: faqData.filter(f => f.category === "Technical").length },
  { name: "Support", icon: HelpCircle, color: "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800", count: faqData.filter(f => f.category === "Support").length }
];

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [helpfulVotes, setHelpfulVotes] = useState<{[key: number]: boolean}>({});

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const markAsHelpful = (id: number) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Auto-expand first result when searching
  useEffect(() => {
    if (searchTerm && filteredFAQs.length > 0) {
      setExpandedItems([filteredFAQs[0].id]);
    }
  }, [searchTerm, filteredFAQs]);

  return (
    <div className='flex flex-col pt-16'>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our tender platform. Can't find what you're looking for? 
              <span className="text-blue-600 font-semibold hover:text-blue-700 cursor-pointer transition-colors"> Contact our support team</span>.
            </p>
            
            {/* Quick Stats Bar */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span>{faqData.length} Questions Answered</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                <span>Updated Daily</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                <span>95% Satisfaction Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Search and Filters */}
        <div className="mb-12">
          <div className="relative max-w-lg mx-auto mb-10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search questions, answers, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Category Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`group relative inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                    isSelected
                      ? category.color + ' shadow-lg shadow-blue-200/50'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span>{category.name}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    isSelected ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {category.count}
                  </span>
                  {isSelected && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Found <span className="font-semibold text-blue-600">{filteredFAQs.length}</span> results for 
                <span className="font-semibold"> "{searchTerm}"</span>
              </p>
            </div>
          )}
        </div>

        {/* Enhanced FAQ Items */}
        <div className="max-w-5xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No FAQs found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or selecting a different category to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFAQs.map((item, index) => {
                const isExpanded = expandedItems.includes(item.id);
                const categoryInfo = categories.find(cat => cat.name === item.category);
                const isHelpful = helpfulVotes[item.id];
                
                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full px-8 py-6 text-left focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center mb-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${categoryInfo?.color || 'bg-gray-100 text-gray-800'} mr-3`}>
                              {item.category}
                            </span>
                            {item.helpful && item.helpful > 50 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Star className="w-3 h-3 mr-1" />
                                Popular
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                            {item.question}
                          </h3>
                          {item.tags && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <div className={`p-2 rounded-full transition-all duration-300 ${
                            isExpanded ? 'bg-blue-100 rotate-180' : 'bg-gray-100 group-hover:bg-blue-50'
                          }`}>
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    <div className={`transition-all duration-500 ease-in-out ${
                      isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}>
                      <div className="px-8 pb-6">
                        <div className="border-t border-gray-100 pt-6">
                          <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 leading-relaxed text-lg">
                              {item.answer}
                            </p>
                          </div>
                          
                          {/* Helpful Section */}
                          <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">Was this helpful?</span>
                              <button
                                onClick={() => markAsHelpful(item.id)}
                                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  isHelpful
                                    ? 'bg-green-100 text-green-700 shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                                }`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {isHelpful ? 'Thanks!' : 'Yes'}
                              </button>
                            </div>
                            {item.helpful && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="w-4 h-4 mr-1" />
                                <span>{item.helpful} people found this helpful</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enhanced Contact Support Section */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl transform rotate-1"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-center text-white shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
              <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                Our dedicated support team is ready to assist you with any questions about the tender platform. 
                We're committed to helping you succeed in your procurement journey.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                  <MessageCircle className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-blue-100 text-sm">Get instant help from our support team</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                  <Mail className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-blue-100 text-sm">Response within 24 hours</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                  <Phone className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-blue-100 text-sm">Mon-Fri, 9AM-6PM</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <span className="flex items-center">
                    Contact Support
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="group bg-blue-500/80 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-400 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <span className="flex items-center">
                    Schedule a Demo
                    <Calendar className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">500+ Active Tenders</h3>
            <p className="text-gray-600 leading-relaxed">Browse hundreds of active procurement opportunities across various industries and regions</p>
            <div className="mt-4 text-sm text-green-600 font-medium">Updated hourly</div>
          </div>
          
          <div className="group bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">10,000+ Verified Users</h3>
            <p className="text-gray-600 leading-relaxed">Join thousands of verified businesses, contractors, and government agencies</p>
            <div className="mt-4 text-sm text-blue-600 font-medium">Growing daily</div>
          </div>
          
          <div className="group bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Bank-Grade Security</h3>
            <p className="text-gray-600 leading-relaxed">Enterprise-grade security with encryption, secure authentication, and compliance</p>
            <div className="mt-4 text-sm text-purple-600 font-medium">ISO 27001 Certified</div>
          </div>
        </div>

        {/* Popular Questions Section */}
        {selectedCategory === 'All' && !searchTerm && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Most Popular Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqData
                .sort((a, b) => (b.helpful || 0) - (a.helpful || 0))
                .slice(0, 4)
                .map((item) => {
                  const categoryInfo = categories.find(cat => cat.name === item.category);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(item.category);
                        setExpandedItems([item.id]);
                      }}
                    >
                      <div className="flex items-start">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${categoryInfo?.color || 'bg-gray-100'}`}>
                          {React.createElement(categoryInfo?.icon || HelpCircle, { className: "w-5 h-5" })}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {item.question}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {item.answer}
                          </p>
                          <div className="flex items-center mt-3 text-xs text-gray-500">
                            <Users className="w-3 h-3 mr-1" />
                            <span>{item.helpful} found helpful</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
      
  );
};

export default FAQ;


