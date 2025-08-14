'use client'

import React, { useState } from 'react'
import { Building2, Users, DollarSign, Download, Eye, Award, TrendingUp } from 'lucide-react'

interface BidCardProps {
  bid: {
    id: number
    title: string
    description: string
    company: string
    file: string
    price: number
    type: string
    customers: number
  }
  delay?: number
}

export function BidCard({ bid, delay = 0 }: BidCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isViewing, setIsViewing] = useState(false)

  const formatPrice = (price: number | null, type: string) => {
    if (type === 'FREE' || price === null) return 'Free'
    return `$${price.toLocaleString()}`
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsDownloading(false)
  }

  const handleView = async () => {
    setIsViewing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsViewing(false)
  }

  const getBidRank = () => {
    return bid.id <= 2 ? 'top' : 'normal'
  }

  const isTopBid = getBidRank() === 'top'

  return (
    <div 
      className={`bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-1 ${
        isTopBid ? 'border-emerald-200 ring-2 ring-emerald-100' : 'border-white/50'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 ${
              isTopBid ? 'bg-gradient-to-r from-emerald-100 to-emerald-200' : 'bg-gradient-to-r from-slate-100 to-slate-200'
            }`}>
              <Building2 className={`w-6 h-6 ${isTopBid ? 'text-emerald-600' : 'text-slate-600'}`} />
            </div>
            {isTopBid && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                <Award className="w-3 h-3" />
                Top Bid
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${
                bid.type === 'FREE' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              {bid.type}
            </span>
            {isTopBid && (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className={`font-bold mb-2 transition-colors duration-200 text-lg ${
            isTopBid 
              ? 'text-emerald-900 group-hover:text-emerald-600' 
              : 'text-slate-900 group-hover:text-emerald-600'
          }`}>
            {bid.title}
          </h3>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">{bid.description}</p>
          <p className={`text-sm font-bold mb-4 ${
            isTopBid ? 'text-emerald-600' : 'text-emerald-600'
          }`}>
            {bid.company}
          </p>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="w-4 h-4" />
            <span>{bid.customers} interested parties</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="w-5 h-5 text-slate-700" />
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(bid.price, bid.type)}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleView}
              disabled={isViewing}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-70"
            >
              {isViewing ? (
                <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed ${
                isTopBid
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isDownloading ? 'Downloading...' : 'Download'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}