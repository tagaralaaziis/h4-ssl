import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Grid, 
  Typography, 
  Box, 
  Divider, 
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Tab,
  Tabs,
  Button,
  CircularProgress,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom,
  Chip,
} from '@mui/material';
import { BarChart3, FileSpreadsheet, Table, TrendingUp, Thermometer, Droplets, Zap } from 'lucide-react';
import { DataType } from '../../types';
import TemperatureChart from '../charts/TemperatureChart';
import HumidityChart from '../charts/HumidityChart';
import ElectricalChart from '../charts/ElectricalChart';
import { format } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';

interface HistoricalDataSectionProps {
  data: DataType;
  loading: boolean;
  isMobile: boolean;
}

const HistoricalDataSection = ({ data, loading, isMobile }: HistoricalDataSectionProps) => {
  const [timeRange, setTimeRange] = useState('realtime');
  const [activeTab, setActiveTab] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const { socket } = useSocket();
  const [historicalData, setHistoricalData] = useState(data.historical);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!socket) return;

    // Request initial data
    socket.emit('request_historical_data', { timeRange });

    // Listen for historical data updates
    socket.on('historical_data_update', (newData) => {
      setHistoricalData(newData);
      setLastUpdate(new Date());
    });

    // Optimized polling intervals for smoother performance
    const interval = setInterval(() => {
      socket.emit('request_historical_data', { timeRange });
    }, timeRange === 'realtime' ? 30000 : // 30 seconds for realtime
       timeRange === '24h' ? 60000 : // 1 minute for 24h
       timeRange === '7d' ? 300000 : // 5 minutes for 7d
       600000); // 10 minutes for 30d

    return () => {
      socket.off('historical_data_update');
      clearInterval(interval);
    };
  }, [socket, timeRange]);

  const handleTimeRangeChange = useCallback((
    _: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null,
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
      socket?.emit('request_historical_data', { timeRange: newTimeRange });
    }
  }, [socket]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleExportClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  }, []);

  const handleExportClose = useCallback(() => {
    setExportAnchorEl(null);
  }, []);

  const exportData = async () => {
    try {
      setExportLoading(true);
      handleExportClose();

      const baseUrl = import.meta.env.VITE_SOCKET_SERVER || 'http://10.10.1.25:3000';
      let endpoint = '';
      
      switch (activeTab) {
        case 0:
          endpoint = 'temperature';
          break;
        case 1:
          endpoint = 'humidity';
          break;
        case 2:
          endpoint = 'electrical';
          break;
        default:
          throw new Error('Invalid tab selection');
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${baseUrl}/api/export/${endpoint}?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Accept': 'text/csv'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.reload();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const fileName = `${endpoint}_data_${timeRange}_${timestamp}.csv`;
      
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExportLoading(false);
    }
  };

  const getTabConfig = (index: number) => {
    switch (index) {
      case 0:
        return { label: 'Temperature', icon: <Thermometer size={16} />, color: '#3f88f2' };
      case 1:
        return { label: 'Humidity', icon: <Droplets size={16} />, color: '#29b6f6' };
      case 2:
        return { label: 'Electrical', icon: <Zap size={16} />, color: '#ffb74d' };
      default:
        return { label: '', icon: null, color: '#fff' };
    }
  };

  const getDataPointCount = () => {
    const activeData = activeTab === 0 
      ? historicalData.temperature?.noc 
      : activeTab === 1 
        ? historicalData.humidity?.noc 
        : historicalData.electrical;
    
    return activeData?.length || 0;
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'realtime':
        return 'Real-time (30s refresh)';
      case '24h':
        return 'Last 24 Hours';
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      default:
        return '';
    }
  };

  // Memoize main content for better performance
  const chartContent = useMemo(() => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      );
    }

    return (
      <Fade in timeout={600}>
        <Box sx={{ mt: 1 }}>
          {activeTab === 0 && (
            <TemperatureChart 
              nocData={historicalData.temperature?.noc || []} 
              upsData={historicalData.temperature?.ups || []} 
              datacenterData={historicalData.temperature?.datacenter || []}
              timeRange={timeRange}
            />
          )}
          
          {activeTab === 1 && (
            <HumidityChart 
              nocData={historicalData.humidity?.noc || []} 
              upsData={historicalData.humidity?.ups || []} 
              datacenterData={historicalData.humidity?.datacenter || []}
              timeRange={timeRange}
            />
          )}
          
          {activeTab === 2 && (
            <ElectricalChart 
              data={historicalData.electrical || []} 
              timeRange={timeRange}
            />
          )}
        </Box>
      </Fade>
    );
  }, [loading, activeTab, historicalData, timeRange]);

  return (
    <Card 
      sx={{ 
        backgroundImage: 'linear-gradient(to bottom right, rgba(30, 30, 60, 0.4), rgba(30, 30, 60, 0.1))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      className="card"
    >
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUp size={24} color="#3f88f2" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Historical Data Analytics
            </Typography>
            <Chip 
              label={`${getDataPointCount().toLocaleString()} samples`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(63, 136, 242, 0.1)',
                color: 'primary.light',
                border: '1px solid rgba(63, 136, 242, 0.3)'
              }}
            />
          </Box>
        } 
        action={
          <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center">
            <Zoom in timeout={300}>
              <Button
                variant="outlined"
                onClick={handleExportClick}
                startIcon={exportLoading ? <CircularProgress size={18} /> : <FileSpreadsheet size={18} />}
                disabled={exportLoading}
                size="small"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'text.primary',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: 120,
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(63, 136, 242, 0.1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(63, 136, 242, 0.3)',
                  }
                }}
              >
                Export
              </Button>
            </Zoom>
            <Menu
              anchorEl={exportAnchorEl}
              open={Boolean(exportAnchorEl)}
              onClose={handleExportClose}
              TransitionComponent={Fade}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 160,
                  backdropFilter: 'blur(20px)',
                  backgroundColor: 'rgba(26, 26, 46, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  borderRadius: 2,
                }
              }}
            >
              <MenuItem 
                onClick={exportData}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(63, 136, 242, 0.1)',
                  }
                }}
              >
                <ListItemIcon>
                  <Table size={16} />
                </ListItemIcon>
                <ListItemText>Export CSV</ListItemText>
              </MenuItem>
            </Menu>
            <ToggleButtonGroup
              size="small"
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range"
              sx={{ 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                overflow: 'hidden',
                '.MuiToggleButton-root': {
                  color: 'text.secondary',
                  border: 'none',
                  px: isMobile ? 1.5 : 2,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(63, 136, 242, 0.15)',
                    transform: 'scale(1.02)',
                    boxShadow: '0 2px 8px rgba(63, 136, 242, 0.3)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(63, 136, 242, 0.05)',
                  }
                } 
              }}
            >
              <ToggleButton value="realtime" aria-label="realtime">
                Live
              </ToggleButton>
              <ToggleButton value="24h" aria-label="24 hours">
                24H
              </ToggleButton>
              <ToggleButton value="7d" aria-label="7 days">
                7D
              </ToggleButton>
              <ToggleButton value="30d" aria-label="30 days">
                30D
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        }
        sx={{ pb: 1 }}
      />
      
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', px: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ 
            '.MuiTab-root': { 
              textTransform: 'none',
              fontWeight: 500,
              minHeight: '48px',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: 'primary.light',
                transform: 'translateY(-1px)',
              },
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              }
            },
            '.MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(90deg, #3f88f2, #00b0ff)',
            }
          }}
        >
          {[0, 1, 2].map((index) => {
            const config = getTabConfig(index);
            return (
              <Tab 
                key={index}
                label={config.label}
                icon={config.icon}
                iconPosition="start"
                sx={{
                  '&.Mui-selected': {
                    color: config.color,
                  }
                }}
              />
            );
          })}
        </Tabs>
      </Box>
      
      <CardContent sx={{ pt: 2 }}>
        {chartContent}
        
        <Fade in timeout={800}>
          <Box 
            sx={{ 
              mt: 2, 
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(63, 136, 242, 0.08)', 
              border: '1px solid rgba(63, 136, 242, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="primary.light" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Current View
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getTabConfig(activeTab).label} • {getTimeRangeLabel()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="primary.light" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Data Points
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getDataPointCount().toLocaleString()} samples
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="primary.light" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Last Updated
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(lastUpdate, 'HH:mm:ss')}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </CardContent>
    </Card>
  );
};

export default HistoricalDataSection;