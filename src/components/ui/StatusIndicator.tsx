import { Box, Typography } from '@mui/material';

interface StatusIndicatorProps {
  status: 'normal' | 'warning' | 'critical';
  label: string;
  large?: boolean;
  glowing?: boolean;
}

const StatusIndicator = ({ status, label, large = false, glowing = false }: StatusIndicatorProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return '#ff5252';
      case 'warning': return '#ffb74d';
      default: return '#4caf50';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'critical': return 'rgba(255, 82, 82, 0.1)';
      case 'warning': return 'rgba(255, 183, 77, 0.1)';
      default: return 'rgba(76, 175, 80, 0.1)';
    }
  };

  const color = getStatusColor();
  const bgColor = getBackgroundColor();

  return (
    <Box
      className="status-indicator"
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: large ? '8px 16px' : '4px 8px',
        borderRadius: large ? 2 : 1,
        bgcolor: bgColor,
        border: `1px solid ${color}`,
        animation: status !== 'normal' ? 'pulse 2s infinite' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: large ? 12 : 8,
          height: large ? 12 : 8,
          borderRadius: '50%',
          bgcolor: color,
          mr: 1,
          boxShadow: glowing && status === 'normal' 
            ? `0 0 ${large ? 12 : 8}px ${color}, 0 0 ${large ? 20 : 16}px ${color}` 
            : `0 0 ${large ? 8 : 4}px ${color}`,
          animation: glowing && status === 'normal' 
            ? 'normalGlow 2s ease-in-out infinite' 
            : 'none',
          position: 'relative',
          '&::before': glowing && status === 'normal' ? {
            content: '""',
            position: 'absolute',
            inset: -2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
            animation: 'pulseRing 2s ease-in-out infinite',
          } : {},
          '@keyframes normalGlow': {
            '0%, 100%': {
              boxShadow: `0 0 ${large ? 8 : 6}px ${color}, 0 0 ${large ? 16 : 12}px ${color}40`,
            },
            '50%': {
              boxShadow: `0 0 ${large ? 16 : 12}px ${color}, 0 0 ${large ? 24 : 20}px ${color}60`,
            },
          },
          '@keyframes pulseRing': {
            '0%': {
              transform: 'scale(1)',
              opacity: 0.8,
            },
            '100%': {
              transform: 'scale(2.5)',
              opacity: 0,
            },
          },
        }}
      />
      <Typography
        variant={large ? "subtitle1" : "caption"}
        sx={{
          color: color,
          fontWeight: status !== 'normal' ? 600 : 500,
          textTransform: status !== 'normal' ? 'uppercase' : 'none',
          textShadow: glowing && status === 'normal' 
            ? `0 0 8px ${color}40` 
            : 'none',
        }}
      >
        {label}
      </Typography>
      
      {/* Shimmer effect for normal status */}
      {glowing && status === 'normal' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${color}20, transparent)`,
            animation: 'shimmer 3s linear infinite',
            '@keyframes shimmer': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(300%)' },
            },
          }}
        />
      )}
    </Box>
  );
};

export default StatusIndicator;