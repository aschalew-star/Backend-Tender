"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Heart,
  Download,
  ShoppingCart,
  Mail,
  User,
  CreditCard,
  Bell,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
  Zap,
  Award,
  Target,
} from "lucide-react"
import Navbar from "../component/Layout/Navbar"
import Footer from "../component/Layout/Footer"

export default function StartPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const quickStats = [
    { label: "Active Tenders", value: "24", icon: <TrendingUp className="w-5 h-5" />, color: "text-blue-600" },
    { label: "Deadline Today", value: "3", icon: <Clock className="w-5 h-5" />, color: "text-red-600" },
    { label: "Success Rate", value: "87%", icon: <Star className="w-5 h-5" />, color: "text-yellow-600" },
    { label: "This Month", value: "12", icon: <Award className="w-5 h-5" />, color: "text-green-600" },
  ]

  const recentActivity = [
    { action: "New tender published", tender: "Road Construction Project", time: "2 hours ago", type: "new" },
    { action: "Document downloaded", tender: "IT Equipment Supply", time: "4 hours ago", type: "download" },
    { action: "Bid submitted", tender: "Office Renovation", time: "1 day ago", type: "bid" },
  ]

  const navigationSections = [
    {
      title: "Tenders For Me",
      description: "Personalized tender recommendations based on your profile and interests",
      icon: <FileText className="w-8 h-8" />,
      href: "/tenders/for-me",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      stats: "24 New Tenders",
      badge: "Hot",
      pulse: true,
    },
    {
      title: "Saved Tenders",
      description: "Your bookmarked and favorite tender opportunities for quick access",
      icon: <Heart className="w-8 h-8" />,
      href: "/tenders/saved",
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
      stats: "12 Saved Items",
      badge: null,
    },
    {
      title: "Tender Documents",
      description: "Browse and download all available tender documents and specifications",
      icon: <Download className="w-8 h-8" />,
      href: "/Tenders",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      stats: "156 Documents",
      badge: null,
    },
    {
      title: "My Purchased Documents",
      description: "Access your purchased tender documents and downloaded files",
      icon: <ShoppingCart className="w-8 h-8" />,
      href: "/documents/purchased",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      stats: "8 Purchased",
      badge: null,
    },
    {
      title: "Tender Alert Emails",
      description: "Manage your email notifications and tender alert preferences",
      icon: <Mail className="w-8 h-8" />,
      href: "/alerts/email",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      stats: "Alerts Active",
      badge: null,
    },
    {
      title: "My Account",
      description: "Update your profile, company information, and account settings",
      icon: <User className="w-8 h-8" />,
      href: "/account/profile",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      stats: "Profile Complete",
      badge: null,
    },
    {
      title: "Billing & Subscription",
      description: "Manage your subscription plan, payments, and billing history",
      icon: <CreditCard className="w-8 h-8" />,
      href: "/account/billing",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      stats: "Premium Plan",
      badge: "Pro",
    },
  ]

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <Navbar/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Welcome back! You have 3 urgent deadlines today
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tender Success
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features you need to manage tenders efficiently and
            win more contracts.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>{stat.icon}</div>
                <Target className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {navigationSections.map((section, index) => (
            <a
              key={index}
              href={section.href}
              className="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${section.bgColor} rounded-full -translate-y-16 translate-x-16 opacity-60 group-hover:scale-110 transition-transform duration-500`}
              />

              {section.pulse && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/10 to-indigo-400/10 animate-pulse" />
              )}

              {section.badge && (
                <div
                  className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    section.badge === "Hot"
                      ? "bg-red-100 text-red-700 animate-pulse"
                      : section.badge === "Pro"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {section.badge}
                </div>
              )}

              <div
                className={`w-20 h-20 bg-gradient-to-br ${section.color} rounded-3xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}
              >
                {section.icon}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {section.title}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{section.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full shadow-sm">
                  {section.stats}
                </span>
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300" />
              </div>
            </a>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "new"
                        ? "bg-green-500"
                        : activity.type === "download"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-sm text-slate-600">{activity.tender}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
            <h3 className="text-xl font-semibold mb-4">🎯 Quick Tip</h3>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Set up tender alerts to never miss opportunities in your industry. Our AI-powered matching ensures you get
              the most relevant tenders.
            </p>
            <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-colors backdrop-blur-sm">
              Set Up Alerts
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Need Help Getting Started?</h3>
            <p className="text-slate-600 mb-6">
              Our support team is here to help you make the most of your tender management experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
                Contact Support
              </button>
              <button className="px-8 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all">
                View Documentation
              </button>
            </div>
          </div>
        </div>
          </main>
          <Footer/>
    </div>
  )
}