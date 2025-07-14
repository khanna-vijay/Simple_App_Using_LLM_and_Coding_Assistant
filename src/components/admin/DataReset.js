import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';

/**
 * Data Reset Component
 * Allows resetting all application data for testing purposes
 */
const DataReset = () => {
  const { resetAllData, users, currentUser } = useUser();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (confirmText !== 'RESET ALL DATA') {
      return;
    }

    try {
      setIsResetting(true);
      await resetAllData();
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Error resetting data. Please try again.');
    } finally {
      setIsResetting(false);
      setShowConfirmDialog(false);
      setConfirmText('');
    }
  };

  return (
    <>
      <Card sx={{ border: '2px solid #ef4444', bgcolor: '#fef2f2' }}>
        <CardContent>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon sx={{ color: 'error.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                  🚨 Admin: Reset All Data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completely reset the application to start fresh
                </Typography>
              </Box>
            </Box>

            <Alert severity="error">
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ⚠️ DANGER ZONE - This action is irreversible!
              </Typography>
              <Typography variant="body2">
                This will permanently delete ALL data including:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
                <Typography component="li" variant="body2">
                  All user profiles and accounts
                </Typography>
                <Typography component="li" variant="body2">
                  All progress data and learned words
                </Typography>
                <Typography component="li" variant="body2">
                  Complete quiz history and scores
                </Typography>
                <Typography component="li" variant="body2">
                  All settings and preferences
                </Typography>
                <Typography component="li" variant="body2">
                  Leaderboard data and rankings
                </Typography>
              </Box>
            </Alert>

            {/* Current Data Summary */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Current Data Summary:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip 
                  label={`${users.length} Users`} 
                  color={users.length > 0 ? 'primary' : 'default'}
                  size="small"
                />
                <Chip 
                  label={currentUser ? `Logged in: ${currentUser.username}` : 'No user logged in'} 
                  color={currentUser ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label="Database + localStorage" 
                  color="info"
                  size="small"
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use this to:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Start with completely fresh data
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Test new user registration flow
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Fix data corruption issues
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Ensure proper user isolation
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<DeleteIcon />}
              onClick={() => setShowConfirmDialog(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Reset All Application Data
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <WarningIcon />
          Confirm Complete Data Reset
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              This will delete EVERYTHING and cannot be undone!
            </Typography>
          </Alert>

          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to permanently delete:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mb: 3 }}>
            <Typography component="li" variant="body2">
              <strong>{users.length}</strong> user profiles
            </Typography>
            <Typography component="li" variant="body2">
              All learning progress and statistics
            </Typography>
            <Typography component="li" variant="body2">
              Complete quiz history
            </Typography>
            <Typography component="li" variant="body2">
              All application settings
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            To confirm this action, type <strong>"RESET ALL DATA"</strong> below:
          </Typography>
          
          <TextField
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type: RESET ALL DATA"
            variant="outlined"
            error={confirmText !== '' && confirmText !== 'RESET ALL DATA'}
            helperText={
              confirmText !== '' && confirmText !== 'RESET ALL DATA' 
                ? 'Please type exactly: RESET ALL DATA' 
                : ''
            }
          />
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => {
              setShowConfirmDialog(false);
              setConfirmText('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReset}
            disabled={confirmText !== 'RESET ALL DATA' || isResetting}
            startIcon={isResetting ? <RefreshIcon /> : <DeleteIcon />}
          >
            {isResetting ? 'Resetting...' : 'Reset All Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DataReset;
