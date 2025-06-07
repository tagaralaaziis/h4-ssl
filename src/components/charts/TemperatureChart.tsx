import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceArea,
  Brush
} from 'recharts';
import { Typography, Box, IconButton, Stack } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState, useCallback } from 'react';

interface DataPoint {
  timestamp: string;
  value: number;
}

interface TemperatureChartProps {
  nocData: DataPoint[];
  upsData: DataPoint[];
  datacenterData: DataPoint[];
  timeRange: string;
}

const TemperatureChart = ({ nocData, upsData, datacenterData, timeRange }: TemperatureChartProps) => {
  const [zoomDomain, setZoomDomain] = useState<{ left?: string; right?: string } | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<string>('');
  const [refAreaRight, setRefAreaRight] = useState<string>('');
  const [isZooming, setIsZooming] = useState(false);

  // Combine data for chart
  const mergedData = nocData.map((item, index) => ({
    timestamp: item.timestamp,
    nocTemperature: item.value,
    upsTemperature: upsData[index]?.value || null,
    datacenterTemperature: datacenterData[index]?.value || null,
  }));

  // Format x-axis ticks based on time range
  const formatXAxis = (tickItem: string) => {
    try {
      const date = parseISO(tickItem);
      if (timeRange === '24h') {
        return format(date, 'HH:mm');
      } else if (timeRange === '7d') {
        return format(date, 'dd/MM');
      } else {
        return format(date, 'dd/MM');
      }
    } catch (error) {
      return '';
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      try {
        const date = parseISO(label);
        const formattedDate = format(date, 'dd MMM yyyy HH:mm');
        
        return (
          <Box 
            sx={{ 
              bgcolor: 'background.paper', 
              p: 1.5, 
              borderRadius: 1,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              {formattedDate}
            </Typography>
            {payload.map((entry: any, index: number) => (
              <Typography 
                key={`tooltip-${index}`} 
                variant="body2"
                sx={{ 
                  color: entry.color,
                  display: 'flex',
                  alignItems: 'center',
                  my: 0.5
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    bgcolor: entry.color, 
                    borderRadius: '50%',
                    display: 'inline-block',
                    mr: 1
                  }} 
                />
                {entry.name}: {entry.value.toFixed(1)}°C
              </Typography>
            ))}
          </Box>
        );
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const handleMouseDown = useCallback((e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setIsZooming(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: any) => {
    if (isZooming && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  }, [isZooming]);

  const handleMouseUp = useCallback(() => {
    if (refAreaLeft && refAreaRight && refAreaLeft !== refAreaRight) {
      const left = refAreaLeft < refAreaRight ? refAreaLeft : refAreaRight;
      const right = refAreaLeft < refAreaRight ? refAreaRight : refAreaLeft;
      setZoomDomain({ left, right });
    }
    setRefAreaLeft('');
    setRefAreaRight('');
    setIsZooming(false);
  }, [refAreaLeft, refAreaRight]);

  const handleZoomOut = () => {
    setZoomDomain(null);
    setRefAreaLeft('');
    setRefAreaRight('');
    setIsZooming(false);
  };

  const getDisplayData = () => {
    if (!zoomDomain) return mergedData;
    
    return mergedData.filter(item => {
      const timestamp = item.timestamp;
      return timestamp >= zoomDomain.left! && timestamp <= zoomDomain.right!;
    });
  };

  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: 'flex-end' }}>
        <IconButton
          size="small"
          onClick={handleZoomOut}
          disabled={!zoomDomain}
          sx={{
            bgcolor: 'rgba(63, 136, 242, 0.1)',
            border: '1px solid rgba(63, 136, 242, 0.3)',
            '&:hover': {
              bgcolor: 'rgba(63, 136, 242, 0.2)',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          }}
        >
          <RotateCcw size={16} />
        </IconButton>
        <Typography variant="caption" sx={{ 
          alignSelf: 'center', 
          color: 'text.secondary',
          px: 1
        }}>
          {zoomDomain ? 'Zoomed View' : 'Click and drag to zoom'}
        </Typography>
      </Stack>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={getDisplayData()}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis} 
            stroke="#aaa"
            tick={{ fill: '#aaa', fontSize: 12 }}
            domain={zoomDomain ? [zoomDomain.left!, zoomDomain.right!] : ['dataMin', 'dataMax']}
          />
          <YAxis 
            stroke="#aaa"
            tick={{ fill: '#aaa', fontSize: 12 }}
            domain={[15, 40]}
            label={{ 
              value: 'Temperature (°C)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#aaa', fontSize: 12 } 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Warning and critical temperature ranges */}
          <ReferenceArea y1={28} y2={32} fill="#ffb74d" fillOpacity={0.2} />
          <ReferenceArea y1={32} y2={40} fill="#ff5252" fillOpacity={0.2} />
          
          {/* Zoom selection area */}
          {refAreaLeft && refAreaRight && (
            <ReferenceArea
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.3}
              fill="rgba(63, 136, 242, 0.2)"
              fillOpacity={0.3}
            />
          )}
          
          <Line 
            type="monotone" 
            dataKey="nocTemperature" 
            name="NOC Temperature" 
            stroke="#3f88f2" 
            dot={false} 
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="upsTemperature" 
            name="UPS Temperature" 
            stroke="#00b0ff" 
            dot={false} 
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="datacenterTemperature" 
            name="Data Center Temperature" 
            stroke="#ff9800" 
            dot={false} 
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />

          {!zoomDomain && (
            <Brush
              dataKey="timestamp"
              height={30}
              stroke="rgba(63, 136, 242, 0.5)"
              fill="rgba(63, 136, 242, 0.1)"
              tickFormatter={formatXAxis}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TemperatureChart;