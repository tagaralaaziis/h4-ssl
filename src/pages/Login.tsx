import { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Fade,
} from '@mui/material';
import { Eye, EyeOff, Server } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SOCKET_SERVER}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        onLogin(data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background animations */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: '150%',
            height: '150%',
            top: '-25%',
            left: '-25%',
            background: 'radial-gradient(circle, rgba(63, 136, 242, 0.1) 0%, transparent 60%)',
            animation: 'rotateBackground 30s linear infinite',
          },
          '&::after': {
            background: 'radial-gradient(circle, rgba(0, 176, 255, 0.1) 0%, transparent 60%)',
            animationDirection: 'reverse',
            animationDuration: '25s',
          },
          '@keyframes rotateBackground': {
            '0%': { transform: 'rotate(0deg) scale(1)' },
            '50%': { transform: 'rotate(180deg) scale(1.2)' },
            '100%': { transform: 'rotate(360deg) scale(1)' },
          },
          pointerEvents: 'none', // Ensure background doesn't interfere with clicks
        }}
      />

      <Fade in timeout={1000}>
        <Card
          sx={{
            maxWidth: 400,
            width: '100%',
            p: 4,
            backdropFilter: 'blur(20px)',
            background: 'rgba(26, 26, 46, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            zIndex: 1, // Ensure card is above background
          }}
        >
          {/* Card effects */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 0%, rgba(63, 136, 242, 0.15), transparent 70%)',
              pointerEvents: 'none', // Ensure overlay doesn't interfere with clicks
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              animation: 'shimmerEffect 6s linear infinite',
              pointerEvents: 'none',
              '@keyframes shimmerEffect': {
                '0%': { transform: 'translateX(-200%) rotate(45deg)' },
                '100%': { transform: 'translateX(200%) rotate(45deg)' },
              },
            }}
          />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'primary.light',
                  letterSpacing: 2,
                  opacity: 0.9,
                  textShadow: '0 0 10px rgba(63, 136, 242, 0.5)',
                  animation: 'fadeInDown 1s ease-out',
                  '@keyframes fadeInDown': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(-20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                BSID-UMM
              </Typography>

              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -10,
                    background: 'radial-gradient(circle, rgba(63, 136, 242, 0.3) 0%, transparent 70%)',
                    animation: 'pulseGlow 2s ease-in-out infinite',
                    pointerEvents: 'none',
                  },
                  '@keyframes pulseGlow': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                      opacity: 0.5,
                    },
                    '50%': {
                      transform: 'scale(1.2)',
                      opacity: 0.8,
                    },
                  },
                }}
              >
                <Server
                  size={48}
                  color="#3f88f2"
                  style={{
                    filter: 'drop-shadow(0 0 15px rgba(63, 136, 242, 0.6))',
                    animation: 'floatIcon 3s ease-in-out infinite',
                  }}
                />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  mt: 2,
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #3f88f2 30%, #00b0ff 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 10px rgba(63, 136, 242, 0.3)',
                  animation: 'fadeInUp 1s ease-out',
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                NOC Monitoring
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: 'text.secondary',
                  animation: 'fadeIn 1s ease-out 0.5s both',
                  '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                  },
                }}
              >
                Sign in to access the dashboard
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                InputProps={{
                  sx: {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                }}
                sx={{
                  mb: 2,
                  animation: 'slideIn 0.5s ease-out',
                  '@keyframes slideIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateX(-20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateX(0)',
                    },
                  },
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(63, 136, 242, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 10px rgba(63, 136, 242, 0.2)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  sx: {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{
                          color: 'text.secondary',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: 'primary.main',
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  animation: 'slideIn 0.5s ease-out 0.2s both',
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(63, 136, 242, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 10px rgba(63, 136, 242, 0.2)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
              />

              {error && (
                <Fade in>
                  <Typography
                    color="error"
                    sx={{
                      mb: 2,
                      textAlign: 'center',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 82, 82, 0.1)',
                      border: '1px solid rgba(255, 82, 82, 0.2)',
                      animation: 'shake 0.5s ease-in-out',
                      '@keyframes shake': {
                        '0%, 100%': { transform: 'translateX(0)' },
                        '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
                        '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
                      },
                    }}
                  >
                    {error}
                  </Typography>
                </Fade>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  bgcolor: 'primary.main',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'slideUp 0.5s ease-out 0.4s both',
                  '@keyframes slideUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(63, 136, 242, 0.4)',
                  },
                  '&:active': {
                    transform: 'translateY(1px)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: -100,
                    width: 50,
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    animation: loading ? 'shimmer 1.5s infinite' : 'none',
                    pointerEvents: 'none',
                  },
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(400%)' },
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Box>
        </Card>
      </Fade>
    </Box>
  );
};

export default Login;