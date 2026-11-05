"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { ClientChart } from "../ui/client-chart"

const data = [
  { name: "Mon", value: 20 },
  { name: "Tue", value: 40 },
  { name: "Wed", value: 35 },
  { name: "Thu", value: 70 },
  { name: "Fri", value: 90 },
  { name: "Sat", value: 75 },
  { name: "Sun", value: 95 },
]

export function ProgressAndPerformance() {

  return (

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">

      {/* LEFT CARD */}

      <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800">

        <h2 className="text-white text-xl font-semibold mb-5">
          Internship Progress
        </h2>

        <div className="flex items-center justify-center">

          <ProgressRing percent={75} />

        </div>

      </div>

      {/* RIGHT GRAPH */}

      <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800 min-h-[350px]">

        <h2 className="text-white text-xl font-semibold mb-5">
          Performance Overview
        </h2>

        <div className="w-full h-[260px] min-w-0">
          <ClientChart height={260} minHeight={240}>
            <AreaChart data={data}>

              <defs>

                <linearGradient
                  id="colorValue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="5%"
                    stopColor="#8b5cf6"
                    stopOpacity={0.8}
                  />

                  <stop
                    offset="95%"
                    stopColor="#8b5cf6"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />

              <XAxis
                dataKey="name"
                stroke="#9ca3af"
              />

              <YAxis
                stroke="#9ca3af"
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={3}
              />

            </AreaChart>
          </ClientChart>
        </div>

      </div>

    </div>
  )
}

function ProgressRing({ percent }) {

  const r = 70

  const c = 2 * Math.PI * r

  const dash =
    (percent / 100) * c

  return (

    <div className="relative w-40 h-40">

      <svg
        className="w-full h-full -rotate-90"
      >

        <circle
          cx="80"
          cy="80"
          r={r}
          stroke="#1f2937"
          strokeWidth="10"
          fill="none"
        />

        <circle
          cx="80"
          cy="80"
          r={r}
          stroke="#8b5cf6"
          strokeWidth="10"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />

      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <h1 className="text-3xl font-bold text-white">
          {percent}%
        </h1>

        <p className="text-gray-400 text-sm">
          Completed
        </p>

      </div>

    </div>
  )
}