import { useEffect, useState } from 'react';
import { Box, CssBaseline, useMediaQuery } from '@mui/material';
import { useTheme } from './contexts/ThemeContext';
import { useSocket } from './contexts/SocketContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import useAlarmSound from './hooks/useAlarmSound';
import { AlertBanner } from './components/AlertBanner';

function App() {
  const { theme } = useTheme();
  const { socket, connected } = useSocket();
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const { playAlarm } = useAlarmSound();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token: string) => {
    setIsAuthenticated(true);
  };

  // Function to add alerts
  const addAlert = (message: string) => {
    setAlerts((prev) => {
      if (prev.includes(message)) return prev;
      playAlarm();
      return [...prev, message];
    });
  };

  // Function to remove alerts
  const removeAlert = (index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <CssBaseline />
      <Header 
        connected={connected} 
        isMobile={isMobile}
        alertCount={alerts.length}
        clearAlerts={clearAlerts}
      />
      
      {alerts.length > 0 && (
        <Box sx={{ mt: 2, px: 2 }}>
          {alerts.map((alert, index) => (
            <AlertBanner 
              key={`${alert}-${index}`}
              message={alert}
              onClose={() => removeAlert(index)}
            />
          ))}
        </Box>
      )}
      
      <Dashboard 
        addAlert={addAlert}
        isMobile={isMobile}
      />
    </Box>
  );
}

export default App;