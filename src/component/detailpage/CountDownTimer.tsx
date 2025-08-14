'use client'

import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  targetDate: Date
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const isExpiring = timeLeft.days < 7

  return (
    <div className={`bg-gradient-to-r p-6 rounded-2xl border-2 shadow-lg transition-all duration-300 ${
      isExpiring 
        ? 'from-red-100 to-orange-100 border-red-200' 
        : 'from-amber-100 to-orange-100 border-amber-200'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className={`w-5 h-5 ${isExpiring ? 'text-red-600' : 'text-amber-600'}`} />
        <p className={`text-sm font-semibold ${isExpiring ? 'text-red-700' : 'text-amber-700'}`}>
          {isExpiring ? 'Expires Soon!' : 'Time Remaining'}
        </p>
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2">
          <div className={`text-2xl font-bold ${isExpiring ? 'text-red-900' : 'text-amber-900'}`}>
            {timeLeft.days}
          </div>
          <div className="text-xs font-medium text-slate-600">Days</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2">
          <div className={`text-2xl font-bold ${isExpiring ? 'text-red-900' : 'text-amber-900'}`}>
            {timeLeft.hours}
          </div>
          <div className="text-xs font-medium text-slate-600">Hours</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2">
          <div className={`text-2xl font-bold ${isExpiring ? 'text-red-900' : 'text-amber-900'}`}>
            {timeLeft.minutes}
          </div>
          <div className="text-xs font-medium text-slate-600">Min</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2">
          <div className={`text-2xl font-bold ${isExpiring ? 'text-red-900' : 'text-amber-900'}`}>
            {timeLeft.seconds}
          </div>
          <div className="text-xs font-medium text-slate-600">Sec</div>
        </div>
      </div>
    </div>
  )
}