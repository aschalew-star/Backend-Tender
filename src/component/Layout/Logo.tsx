"use client"

import { motion } from "framer-motion"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 40, textSize: "text-lg" },
    md: { width: 160, height: 50, textSize: "text-xl" },
    lg: { width: 200, height: 60, textSize: "text-2xl" },
  }

  const currentSize = sizes[size]

  return (
    <motion.div
      className={`flex items-center ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox="0 0 200 60"
        className="mr-2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="zGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>

          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>

          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="30%" stopColor="#EF4444" />
            <stop offset="70%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* Shadow filter */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Background circle with animation */}
        <motion.circle
          cx="25"
          cy="30"
          r="20"
          fill="url(#circleGradient)"
          filter="url(#shadow)"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Decorative elements */}
        <motion.path
          d="M15 20 L35 20 M15 25 L35 25 M15 30 L35 30"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Main Z letter */}
        <motion.text
          x="25"
          y="38"
          textAnchor="middle"
          className="font-bold text-2xl"
          fill="white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Z
        </motion.text>

        {/* Company name */}
        <motion.text
          x="55"
          y="25"
          className="font-bold text-lg"
          fill="url(#textGradient)"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          ZEMEN
        </motion.text>

        <motion.text
          x="55"
          y="42"
          className="font-semibold text-sm"
          fill="#6B7280"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          TENDERS
        </motion.text>

        {/* Decorative dots */}
        <motion.circle
          cx="170"
          cy="15"
          r="2"
          fill="#EF4444"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
        />
        <motion.circle
          cx="180"
          cy="20"
          r="1.5"
          fill="#3B82F6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        />
        <motion.circle
          cx="175"
          cy="45"
          r="1"
          fill="#10B981"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        />

        {/* Success arrow */}
        <motion.path
          d="M150 35 L160 30 L160 33 L170 33 L170 37 L160 37 L160 40 Z"
          fill="url(#circleGradient)"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        />
      </svg>
    </motion.div>
  )
}
