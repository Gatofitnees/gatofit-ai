
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  current: number | null;
  initial: number | null;
  change: number | null;
  changePercentage: number | null;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  isPositiveTrend?: boolean; // Si el aumento es positivo (ej: peso para ganar músculo)
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  current,
  initial,
  change,
  changePercentage,
  trend,
  unit,
  isPositiveTrend = false
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    if (trend === 'stable') return 'text-muted-foreground';
    
    const isGoodChange = isPositiveTrend ? trend === 'up' : trend === 'down';
    return isGoodChange ? 'text-green-600' : 'text-red-600';
  };

  const formatValue = (value: number | null) => {
    if (value === null) return '--';
    return `${value.toFixed(1)} ${unit}`;
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Actual</span>
          <span className="text-lg font-semibold">{formatValue(current)}</span>
        </div>
        
        {initial !== null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Inicial</span>
            <span className="text-sm">{formatValue(initial)}</span>
          </div>
        )}
        
        {change !== null && changePercentage !== null && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {change > 0 ? '+' : ''}{change.toFixed(1)} {unit}
              </span>
            </div>
            <span className={`text-xs ${getTrendColor()}`}>
              {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
