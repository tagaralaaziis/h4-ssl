import { useState, useEffect } from 'react';
import { Alert, AlertTitle, Collapse, IconButton, Box } from '@mui/material';
import { X } from 'lucide-react';

interface AlertBannerProps {
  message: string;
  onClose: () => void;
}

export const AlertBanner = ({ message, onClose }: AlertBannerProps) => {
  const [open, setOpen] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
      setTimeout(onClose, 300);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };
  
  const isWarning = message.toLowerCase().includes('warning');
  const isCritical = message.toLowerCase().includes('critical');
  
  const severity = isCritical ? 'error' : isWarning ? 'warning' : 'info';
  const title = isCritical ? 'CRITICAL ALERT' : isWarning ? 'WARNING' : 'Information';
  
  return (
    <Box sx={{ position: 'relative', zIndex: 1000 }}>
      <Collapse in={open}>
        <Alert
          severity={severity}
          sx={{ 
            mb: 1, 
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            backgroundColor: isCritical 
              ? 'rgba(211, 47, 47, 0.15)' 
              : isWarning 
                ? 'rgba(237, 108, 2, 0.15)' 
                : 'rgba(2, 136, 209, 0.15)',
            border: `1px solid ${isCritical 
              ? 'rgba(211, 47, 47, 0.3)' 
              : isWarning 
                ? 'rgba(237, 108, 2, 0.3)' 
                : 'rgba(2, 136, 209, 0.3)'}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.3s ease-in',
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <X size={16} />
            </IconButton>
          }
        >
          <AlertTitle>{title}</AlertTitle>
          {message}
        </Alert>
      </Collapse>
    </Box>
  );
};