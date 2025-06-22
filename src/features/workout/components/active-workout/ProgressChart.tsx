
import React from "react";

interface ProgressChartProps {
  data: { date: string; maxWeight: number }[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No hay datos suficientes para mostrar progreso
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map(d => d.maxWeight));
  const minValue = Math.min(...data.map(d => d.maxWeight));
  const range = maxValue - minValue || 1;
  
  const chartHeight = 120;
  const chartWidth = 280;
  const padding = 20;
  
  const getY = (value: number) => {
    return chartHeight - padding - ((value - minValue) / range) * (chartHeight - 2 * padding);
  };
  
  const getX = (index: number) => {
    return padding + (index / (data.length - 1 || 1)) * (chartWidth - 2 * padding);
  };
  
  const pathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.maxWeight);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  return (
    <div className="space-y-3">
      <h5 className="text-sm font-medium">Progreso de peso máximo</h5>
      
      <div className="bg-secondary/10 rounded-lg p-4">
        <svg 
          width={chartWidth} 
          height={chartHeight} 
          className="w-full h-auto"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Grid lines */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + ratio * (chartHeight - 2 * padding)}
              x2={chartWidth - padding}
              y2={padding + ratio * (chartHeight - 2 * padding)}
              stroke="hsl(var(--border))"
              strokeOpacity="0.3"
              strokeWidth="1"
            />
          ))}
          
          {/* Progress line */}
          {data.length > 1 && (
            <path
              d={pathData}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Data points */}
          {data.map((point, index) => (
            <circle
              key={index}
              cx={getX(index)}
              cy={getY(point.maxWeight)}
              r="4"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
          ))}
        </svg>
        
        {/* Legend */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
      
      <div className="flex justify-between text-xs">
        <div>
          <span className="text-muted-foreground">Mín: </span>
          <span className="font-medium">{minValue} kg</span>
        </div>
        <div>
          <span className="text-muted-foreground">Máx: </span>
          <span className="font-medium">{maxValue} kg</span>
        </div>
      </div>
    </div>
  );
};
