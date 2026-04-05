import { useState } from 'react';
import { Container, Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { Build as BuildIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import healthService from '../services/healthService';
import config from '../config';

interface UnderMaintenancePageProps {
  onServiceRestored: () => void;
}

export default function UnderMaintenancePage({ onServiceRestored }: UnderMaintenancePageProps) {
  const appName = config.appName;
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const response = await healthService.checkHealth();
      if (response.success) {
        onServiceRestored();
      }
    } catch (error) {
      console.log('Service still under maintenance');
    } finally {
      setIsChecking(false);
      setLastCheck(new Date());
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          <Box sx={{ p: 6 }}>
            {/* App Name */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'primary.main',
              }}
            >
              🔗 {appName}
            </Typography>

            {/* Construction Icon */}
            <BuildIcon
              sx={{
                fontSize: 100,
                color: 'warning.main',
                mb: 3,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            />

            {/* Title */}
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Under Maintenance
            </Typography>

            {/* Description */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              We're currently experiencing technical difficulties.
              <br />
              Please check back shortly.
            </Typography>

            {/* Status Indicator */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                mb: 3,
              }}
            >
              {isChecking ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Checking service status...
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  The service is currently unavailable. Please try again later.
                </Typography>
              )}
            </Box>

            {/* Last Check Time */}
            {lastCheck && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Last check: {lastCheck.toLocaleTimeString()}
              </Typography>
            )}

            {/* Manual Check Button */}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={checkHealth}
              disabled={isChecking}
            >
              Check Now
            </Button>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              bgcolor: 'grey.50',
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              We apologize for the inconvenience
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
