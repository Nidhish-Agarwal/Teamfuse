"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#60a5fa",
  "#4ade80",
  "#f472b6",
  "#fb923c",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
];

interface ChartDataItem {
  name?: string;
  value?: number;
  commits?: number;
  prs?: number;
  chats?: number;
  [key: string]: string | number | undefined;
}

interface RechartsWrapperProps {
  type: "bar" | "pie";
  data: ChartDataItem[];
  height?: number;
}

export default function RechartsWrapper({
  type,
  data,
  height = 300,
}: RechartsWrapperProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center border border-dashed border-gray-700 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-gray-700 rounded-full" />
        </div>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid
              stroke="#1e263a"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              //   stroke="#6b7280"
              // //   fontSize={12}
              // //   tickLine={false}
              // //   axisLine={false}
              // //   angle={-45}
              //   textAnchor="end"
              //   height={60}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0d0f1a",
                border: "1px solid #1d2033",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px", color: "white" }} />
            <Bar
              dataKey="commits"
              name="Commits"
              fill="url(#commitGradient)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="prs"
              name="Pull Requests"
              fill="url(#prGradient)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="chats"
              name="Chats"
              fill="url(#chatGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="prGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "pie") {
    return (
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent = 0 }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#0d0f1a"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              layout="horizontal"
              verticalAlign="bottom"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0d0f1a",
                border: "1px solid #1d2033",
                borderRadius: "8px",
                color: "white",
              }}
              formatter={(value: number) => [`${value} points`, "Task Weight"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}
