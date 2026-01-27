import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface MarketChartProps {
  history: ChartDataPoint[];
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
  color: string;
}

// Custom Tooltip Component to replace inline styles
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, color }) => {
  if (active && payload && payload.length && label) {
    return (
      <div className="bg-slate-900/90 border border-white/10 rounded-lg p-3 shadow-lg backdrop-blur-md">
        <p className="text-xs text-slate-400 mb-1">{new Date(label).toLocaleTimeString()}</p>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
                ${payload[0].value?.toLocaleString()}
            </span>
            <span className="text-xs font-medium" style={{ color: color }}>Price</span>
        </div>
      </div>
    );
  }
  return null;
};

export const MarketChart: React.FC<MarketChartProps> = ({ history, color }) => {
  if (!history || history.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-white/5 rounded-xl border border-dashed border-slate-700/50">
        <p className="text-sm font-medium">Chart data currently unavailable</p>
      </div>
    );
  }

  const minPrice = Math.min(...history.map(d => d.price));
  const maxPrice = Math.max(...history.map(d => d.price));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={history}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis 
            dataKey="timestamp" 
            hide={true} 
            type="number"
            domain={['dataMin', 'dataMax']}
        />
        <YAxis 
            hide={true} 
            domain={[minPrice * 0.999, maxPrice * 1.001]} // tight crop
        />
        <Tooltip 
            content={<CustomTooltip color={color} />}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};