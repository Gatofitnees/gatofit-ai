
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBodyMeasurementsHistory } from '@/hooks/useBodyMeasurementsHistory';
import StatCard from '@/components/progress/StatCard';
import ProgressChart from '@/components/progress/ProgressChart';

const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { measurements, stats, loading } = useBodyMeasurementsHistory();
  const [selectedPeriod, setSelectedPeriod] = useState('3m');

  const periods = [
    { key: '1w', label: '1S' },
    { key: '1m', label: '1M' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1A' }
  ];

  const getFilteredData = () => {
    if (!measurements.length) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case '1w':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return measurements;
    }
    
    return measurements.filter(m => new Date(m.measured_at) >= cutoffDate);
  };

  const getChartData = (field: string) => {
    return getFilteredData()
      .filter(m => m[field as keyof typeof m] !== null)
      .map(m => ({
        date: m.measured_at,
        value: Number(m[field as keyof typeof m])
      }))
      .reverse();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-32"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-bold">Progreso</h1>
        
        <Button
          size="sm"
          onClick={() => navigate('/profile/body-measurements')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Añadir
        </Button>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
        {periods.map(period => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === period.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          title="Peso"
          current={stats.weight.current}
          initial={stats.weight.initial}
          change={stats.weight.change}
          changePercentage={stats.weight.changePercentage}
          trend={stats.weight.trend}
          unit="kg"
          isPositiveTrend={false}
        />
        
        <StatCard
          title="Grasa Corporal"
          current={stats.bodyFat.current}
          initial={stats.bodyFat.initial}
          change={stats.bodyFat.change}
          changePercentage={stats.bodyFat.changePercentage}
          trend={stats.bodyFat.trend}
          unit="%"
          isPositiveTrend={false}
        />
        
        <StatCard
          title="IMC"
          current={stats.bmi.current}
          initial={stats.bmi.initial}
          change={stats.bmi.change}
          changePercentage={stats.bmi.changePercentage}
          trend={stats.bmi.trend}
          unit=""
          isPositiveTrend={false}
        />
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {getChartData('weight_kg').length > 0 && (
          <ProgressChart
            data={getChartData('weight_kg')}
            title="Evolución del Peso"
            unit="kg"
            color="#3b82f6"
          />
        )}
        
        {getChartData('body_fat_percentage').length > 0 && (
          <ProgressChart
            data={getChartData('body_fat_percentage')}
            title="Evolución del Porcentaje Graso"
            unit="%"
            color="#ef4444"
          />
        )}
      </div>

      {/* Empty State */}
      {measurements.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No hay datos de progreso</h3>
          <p className="text-muted-foreground mb-6">
            Añade tu primera medición corporal para comenzar a ver tu progreso
          </p>
          <Button onClick={() => navigate('/profile/body-measurements')}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir primera medición
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
