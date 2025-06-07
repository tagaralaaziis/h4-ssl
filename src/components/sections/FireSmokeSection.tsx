import { Card, CardContent, CardHeader, Grid, Typography, Box, Divider, Skeleton } from '@mui/material';
import { Flame, Cloud } from 'lucide-react';
import { format } from 'date-fns';
import { FireSmokeDataType } from '../../types';
import StatusIndicator from '../ui/StatusIndicator';

interface FireSmokeSectionProps {
  data: FireSmokeDataType;
  loading: boolean;
}

const FireSmokeSection = ({ data, loading }: FireSmokeSectionProps) => {
  const isFireDetected = data.api_value < 50;
  const isSmokeDetected = data.asap_value === 0; // 0 = detected, 1 = normal

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
        height: '100%',
        backgroundImage: 'linear-gradient(to bottom right, rgba(30, 30, 60, 0.4), rgba(30, 30, 60, 0.1))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      className={`card ${(isFireDetected || isSmokeDetected) ? 'alert-pulse' : ''}`}
    >
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Flame size={24} color="#ff5252" />
            <Typography variant="h5" sx={{ ml: 1, fontWeight: 600 }}>
              Fire & Smoke Detection
            </Typography>
          </Box>
        } 
        sx={{ pb: 1 }}
      />
      <Divider sx={{ opacity: 0.1 }} />
      <CardContent>
        <Grid container spacing={4}>
          {/* Fire Detection */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                border: isFireDetected ? '1px solid rgba(255, 82, 82, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                bgcolor: isFireDetected ? 'rgba(255, 82, 82, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <Skeleton variant="circular\" width={100} height={100} />
              ) : (
                <>
                  <Flame
                    size={64}
                    color={isFireDetected ? "#ff5252" : "#666"}
                    style={{
                      opacity: isFireDetected ? 1 : 0.5,
                      marginBottom: '16px',
                      filter: isFireDetected ? 'drop-shadow(0 0 8px rgba(255, 82, 82, 0.8))' : 'none',
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      color: isFireDetected ? 'error.main' : 'text.secondary',
                      fontWeight: isFireDetected ? 700 : 400,
                    }}
                  >
                    Fire Detection
                  </Typography>
                  <StatusIndicator
                    status={isFireDetected ? 'critical' : 'normal'}
                    label={isFireDetected ? 'FIRE DETECTED!' : 'No Fire Detected'}
                    large
                  />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Value: {data.api_value} {data.api_value >= 50 ? '(Normal)' : '(Alert)'}
                  </Typography>
                </>
              )}
            </Box>
          </Grid>

          {/* Smoke Detection */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                border: isSmokeDetected ? '1px solid rgba(255, 183, 77, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                bgcolor: isSmokeDetected ? 'rgba(255, 183, 77, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <Skeleton variant="circular\" width={100} height={100} />
              ) : (
                <>
                  <Cloud
                    size={64}
                    color={isSmokeDetected ? "#ffb74d" : "#666"}
                    style={{
                      opacity: isSmokeDetected ? 1 : 0.5,
                      marginBottom: '16px',
                      filter: isSmokeDetected ? 'drop-shadow(0 0 8px rgba(255, 183, 77, 0.8))' : 'none',
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      color: isSmokeDetected ? 'warning.main' : 'text.secondary',
                      fontWeight: isSmokeDetected ? 700 : 400,
                    }}
                  >
                    Smoke Detection
                  </Typography>
                  <StatusIndicator
                    status={isSmokeDetected ? 'warning' : 'normal'}
                    label={isSmokeDetected ? 'SMOKE DETECTED!' : 'No Smoke Detected'}
                    large
                  />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Value: {data.asap_value} {data.asap_value === 1 ? '(Normal)' : '(Alert)'}
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box 
          sx={{ 
            mt: 2, 
            p: 1, 
            borderRadius: 1, 
            bgcolor: 'rgba(0, 176, 255, 0.1)', 
            border: '1px solid rgba(0, 176, 255, 0.2)' 
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', color: 'info.light' }}>
            <strong>Last Updated:</strong> {formatTime(data.waktu)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FireSmokeSection;