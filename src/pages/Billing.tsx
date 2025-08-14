"use client"

import { useState } from "react"
import {
  CreditCard,
  Calendar,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Receipt,
  Settings,
  Plus,
  Trash2,
  Edit,
  Star,
  Shield,
  Zap,
  Crown,
} from "lucide-react"

// Main App component
export default function Billing() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPlan, setSelectedPlan] = useState("YEARLY")

  // Mock data based on Prisma models. In a real application, this would come from an API.
  const currentSubscription = {
    isSubscribed: true,
    plan: "YEARLY",
    endDate: "2024-12-15",
    price: 299.99,
    status: "active",
  }

  const paymentHistory = [
    {
      id: 1,
      price: 299.99,
      howLong: "YEARLY",
      approvedAt: "2024-01-15",
      status: "approved",
      bank: { name: "Commercial Bank of Ethiopia", account: "****1234", logo: "https://placehold.co/40x40/E5E7EB/4B5563?text=CBE" },
    },
    {
      id: 2,
      price: 79.99,
      howLong: "THREEMONTHLY",
      approvedAt: "2023-10-15",
      status: "approved",
      bank: { name: "Dashen Bank", account: "****5678", logo: "https://placehold.co/40x40/E5E7EB/4B5563?text=DB" },
    },
    {
      id: 3,
      price: 149.99,
      howLong: "SIXMONTHLY",
      approvedAt: "2023-07-15",
      status: "pending",
      bank: { name: "Awash Bank", account: "****9012", logo: "https://placehold.co/40x40/E5E7EB/4B5563?text=AB" },
    },
  ]

  const subscriptionPlans = [
    {
      type: "TENDER",
      name: "Per Tender",
      price: 9.99,
      period: "per tender",
      description: "Pay only for what you use",
      features: ["Access to single tender", "Basic document download", "Email notifications", "Standard support"],
      color: "from-blue-500 to-blue-600",
      popular: false,
    },
    {
      type: "THREEMONTHLY",
      name: "Quarterly",
      price: 79.99,
      period: "3 months",
      description: "Perfect for short-term projects",
      features: [
        "Unlimited tender access",
        "Premium document downloads",
        "Priority notifications",
        "Advanced search filters",
        "Email support",
      ],
      color: "from-emerald-500 to-emerald-600",
      popular: false,
    },
    {
      type: "SIXMONTHLY",
      name: "Semi-Annual",
      price: 149.99,
      period: "6 months",
      description: "Great value for growing businesses",
      features: [
        "Everything in Quarterly",
        "Advanced analytics",
        "Custom alerts",
        "API access",
        "Phone support",
        "Priority processing",
      ],
      color: "from-purple-500 to-purple-600",
      popular: true,
    },
    {
      type: "YEARLY",
      name: "Annual",
      price: 299.99,
      period: "12 months",
      description: "Best value for established companies",
      features: [
        "Everything in Semi-Annual",
        "White-label options",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 priority support",
        "Advanced reporting",
      ],
      color: "from-orange-500 to-orange-600",
      popular: false,
    },
  ]

  const paymentMethods = [
    {
      id: 1,
      name: "Commercial Bank of Ethiopia",
      account: "****1234",
      logo: "https://placehold.co/40x40/E5E7EB/4B5563?text=CBE",
      isDefault: true,
    },
    {
      id: 2,
      name: "Dashen Bank",
      account: "****5678",
      logo: "https://placehold.co/40x40/E5E7EB/4B5563?text=DB",
      isDefault: false,
    },
  ]

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Helper function to get status-specific Tailwind classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50"
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "failed":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  // Helper function to get status-specific icons
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "failed":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-inter">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
                <p className="text-sm text-slate-600">Manage your subscription and payment methods</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 mb-8 shadow-sm border border-slate-200">
          {[
            { id: "overview", label: "Overview", icon: <Receipt className="w-4 h-4" /> },
            { id: "plans", label: "Subscription Plans", icon: <Star className="w-4 h-4" /> },
            { id: "history", label: "Payment History", icon: <Calendar className="w-4 h-4" /> },
            { id: "methods", label: "Payment Methods", icon: <CreditCard className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Current Subscription Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Current Subscription</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Subscription Plan Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Annual Plan</h3>
                      <p className="text-sm text-slate-600">Premium features included</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">${currentSubscription.price}</div>
                  <div className="text-sm text-slate-600">per year</div>
                </div>
                {/* Next Billing Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Next Billing</h3>
                      <p className="text-sm text-slate-600">Automatic renewal</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-2">{formatDate(currentSubscription.endDate)}</div>
                  <div className="text-sm text-slate-600">in 45 days</div>
                </div>
                {/* Usage Card */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Usage This Month</h3>
                      <p className="text-sm text-slate-600">Tender downloads</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-2">247 / Unlimited</div>
                  <div className="text-sm text-slate-600">documents accessed</div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                    <Download className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-slate-900">Download Latest Invoice</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl hover:shadow-md transition-all">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-slate-900">Update Payment Method</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:shadow-md transition-all">
                    <Star className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-slate-900">Upgrade Plan</span>
                  </button>
                </div>
              </div>
              {/* Recent Activity Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Payment Successful</div>
                      <div className="text-sm text-slate-600">$299.99 charged to ****1234</div>
                    </div>
                    <div className="text-sm text-slate-500">2 days ago</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Plan Renewed</div>
                      <div className="text-sm text-slate-600">Annual subscription activated</div>
                    </div>
                    <div className="text-sm text-slate-500">2 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans Tab Content */}
        {activeTab === "plans" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Select the perfect subscription plan that fits your business needs and budget
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.type}
                  className={`relative bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:shadow-lg ${
                    plan.popular ? "border-purple-200 ring-2 ring-purple-100" : "border-slate-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-slate-900">${plan.price}</div>
                    <div className="text-sm text-slate-600">{plan.period}</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      currentSubscription.plan === plan.type
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg`
                    }`}
                    disabled={currentSubscription.plan === plan.type}
                  >
                    {currentSubscription.plan === plan.type ? "Current Plan" : "Select Plan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment History Tab Content */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">Payment History</h2>
                <p className="text-slate-600">View all your past transactions and invoices</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900">Date</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Amount</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Plan</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Payment Method</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{formatDate(payment.approvedAt)}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">${payment.price}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-600">{payment.howLong.replace("MONTHLY", " Monthly")}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={payment.bank.logo || "https://placehold.co/40x40/E5E7EB/4B5563?text=Bank"}
                              alt={payment.bank.name}
                              className="w-6 h-6 rounded"
                            />
                            <div>
                              <div className="font-medium text-slate-900">{payment.bank.name}</div>
                              <div className="text-sm text-slate-600">{payment.bank.account}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}
                          >
                            {getStatusIcon(payment.status)}
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </div>
                        </td>
                        <td className="p-4">
                          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                            <Download className="w-4 h-4" />
                            Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Tab Content */}
        {activeTab === "methods" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Payment Methods</h2>
                  <p className="text-slate-600">Manage your saved payment methods</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <Plus className="w-4 h-4" />
                  Add Method
                </button>
              </div>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                      method.isDefault ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={method.logo || "https://placehold.co/40x40/E5E7EB/4B5563?text=Bank"}
                        alt={method.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{method.name}</div>
                        <div className="text-sm text-slate-600">{method.account}</div>
                      </div>
                      {method.isDefault && (
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          Default
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
