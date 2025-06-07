import { Card, CardContent, CardHeader, Grid, Typography, Box, Divider, Skeleton } from '@mui/material';
import { Zap, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ElectricalDataType } from '../../types';
import ValueDisplay from '../ui/ValueDisplay';
import GaugeChart from '../charts/GaugeChart';
import StatusIndicator from '../ui/StatusIndicator';

interface ElectricalSectionProps {
  data: ElectricalDataType;
  loading: boolean;
  thresholds: {
    warning: { low: number, high: number },
    critical: { low: number, high: number }
  };
}

const ElectricalSection = ({ data, loading, thresholds }: ElectricalSectionProps) => {
  const getVoltageStatus = (value: number) => {
    if (value <= thresholds.critical.low || value >= thresholds.critical.high) return 'critical';
    if (value <= thresholds.warning.low || value >= thresholds.warning.high) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#ff5252';
      case 'warning': return '#ffb74d';
      default: return '#4caf50';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), 'HH:mm:ss dd/MM/yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Zap size={24} color="#ffb74d" />
            <Typography variant="h5" sx={{ ml: 1, fontWeight: 600 }}>
              Electrical Monitoring
            </Typography>
          </Box>
        } 
        sx={{ pb: 1 }}
      />
      <Divider sx={{ opacity: 0.1 }} />
      <CardContent>
        <Grid container spacing={3}>
          {/* Phase Voltage Gauges */}
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.7 }}>
                Phase Voltage Monitoring
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={280} width="100%" />
              ) : (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'relative', textAlign: 'center' }}>
                      {/* Phase Title */}
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#ff5252' }}>
                        Phase R
                      </Typography>
                      
                      {/* Status indicator positioned directly below title with minimal spacing */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 1
                      }}>
                        <StatusIndicator 
                          status={getVoltageStatus(data.phase_r)} 
                          label={getVoltageStatus(data.phase_r) === 'normal' ? 'NORMAL' : getVoltageStatus(data.phase_r) === 'warning' ? 'WARNING' : 'CRITICAL'}
                          glowing={getVoltageStatus(data.phase_r) === 'normal'}
                        />
                      </Box>
                      
                      {/* Gauge Chart */}
                      <GaugeChart
                        value={data.phase_r}
                        title=""
                        min={180}
                        max={260}
                        unit="V"
                        color={getStatusColor(getVoltageStatus(data.phase_r))}
                        thresholds={{
                          danger: [thresholds.critical.low, thresholds.critical.high],
                          warning: [thresholds.warning.low, thresholds.warning.high]
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'relative', textAlign: 'center' }}>
                      {/* Phase Title */}
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#ffb74d' }}>
                        Phase S
                      </Typography>
                      
                      {/* Status indicator positioned directly below title with minimal spacing */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 1
                      }}>
                        <StatusIndicator 
                          status={getVoltageStatus(data.phase_s)} 
                          label={getVoltageStatus(data.phase_s) === 'normal' ? 'NORMAL' : getVoltageStatus(data.phase_s) === 'warning' ? 'WARNING' : 'CRITICAL'}
                          glowing={getVoltageStatus(data.phase_s) === 'normal'}
                        />
                      </Box>
                      
                      {/* Gauge Chart */}
                      <GaugeChart
                        value={data.phase_s}
                        title=""
                        min={180}
                        max={260}
                        unit="V"
                        color={getStatusColor(getVoltageStatus(data.phase_s))}
                        thresholds={{
                          danger: [thresholds.critical.low, thresholds.critical.high],
                          warning: [thresholds.warning.low, thresholds.warning.high]
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'relative', textAlign: 'center' }}>
                      {/* Phase Title */}
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#4caf50' }}>
                        Phase T
                      </Typography>
                      
                      {/* Status indicator positioned directly below title with minimal spacing */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 1
                      }}>
                        <StatusIndicator 
                          status={getVoltageStatus(data.phase_t)} 
                          label={getVoltageStatus(data.phase_t) === 'normal' ? 'NORMAL' : getVoltageStatus(data.phase_t) === 'warning' ? 'WARNING' : 'CRITICAL'}
                          glowing={getVoltageStatus(data.phase_t) === 'normal'}
                        />
                      </Box>
                      
                      {/* Gauge Chart */}
                      <GaugeChart
                        value={data.phase_t}
                        title=""
                        min={180}
                        max={260}
                        unit="V"
                        color={getStatusColor(getVoltageStatus(data.phase_t))}
                        thresholds={{
                          danger: [thresholds.critical.low, thresholds.critical.high],
                          warning: [thresholds.warning.low, thresholds.warning.high]
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Grid>

          {/* Additional Electrical Parameters */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.7 }}>
              Power Monitoring
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={280} width="100%" />
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ValueDisplay 
                    value={data.power_3ph.toFixed(1)}
                    unit="kW"
                    icon={<Activity size={20} />}
                    status="normal"
                    subtitle="Total Power"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ValueDisplay 
                    value={data.frequency_3ph.toFixed(1)}
                    unit="Hz"
                    icon={<Activity size={20} />}
                    status="normal"
                    subtitle="Frequency"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ValueDisplay 
                    value={data.pf_3ph.toFixed(2)}
                    icon={<Activity size={20} />}
                    status="normal"
                    subtitle="Power Factor"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ValueDisplay 
                    value={data.energy_3ph.toFixed(1)}
                    unit="kWh"
                    icon={<Activity size={20} />}
                    status="normal"
                    subtitle="Energy"
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Box 
          sx={{ 
            mt: 2, 
            p: 1, 
            borderRadius: 1, 
            bgcolor: 'rgba(255, 183, 77, 0.1)', 
            border: '1px solid rgba(255, 183, 77, 0.2)' 
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={12} md={7}>
              <Typography variant="caption" sx={{ display: 'block', color: 'warning.light' }}>
                <strong>Voltage Thresholds:</strong> Warning: {thresholds.warning.low}V - {thresholds.warning.high}V, 
                Critical: {thresholds.critical.low}V - {thresholds.critical.high}V
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="caption" sx={{ display: 'block', color: 'warning.light' }}>
                <strong>Last Updated:</strong> {formatTime(data.waktu)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ElectricalSection;