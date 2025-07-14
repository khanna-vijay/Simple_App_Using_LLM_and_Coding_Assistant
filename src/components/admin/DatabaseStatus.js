import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  Storage as DatabaseIcon,
  Refresh as RefreshIcon,
  Download as LoadIcon,
  Delete as ClearIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useDictionary } from '../../context/DictionaryContext';
import dictionaryDatabaseService from '../../services/DictionaryDatabaseService';

/**
 * Database Status Component
 * Shows dictionary database status and management options
 */
const DatabaseStatus = () => {
  const { dbStats, totalWords, categories } = useDictionary();
  const [loading, setLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [localStats, setLocalStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await dictionaryDatabaseService.getStatistics();
      setLocalStats(stats);
    } catch (error) {
      console.error('Error loading database stats:', error);
    }
  };

  const handleReloadData = async () => {
    try {
      setLoading(true);
      
      // Clear existing data
      await dictionaryDatabaseService.clearAllData();
      
      // Reload from file
      await dictionaryDatabaseService.loadDictionaryFromFile();
      
      // Refresh stats
      await loadStats();
      
      // Refresh page to reload context
      window.location.reload();
      
    } catch (error) {
      console.error('Error reloading dictionary data:', error);
      alert('Error reloading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    try {
      setLoading(true);
      await dictionaryDatabaseService.clearAllData();
      await loadStats();
      setShowClearDialog(false);
      
      // Refresh page
      window.location.reload();
      
    } catch (error) {
      console.error('Error clearing dictionary data:', error);
      alert('Error clearing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const stats = localStats || dbStats;
  const isLoaded = stats?.isLoaded || false;
  const totalWordsCount = stats?.totalWords || 0;

  return (
    <>
      <Card sx={{ border: isLoaded ? '2px solid #10b981' : '2px solid #f59e0b' }}>
        <CardContent>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DatabaseIcon sx={{ color: isLoaded ? 'success.main' : 'warning.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  📚 Dictionary Database Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  IndexedDB storage for fast word retrieval
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto' }}>
                {isLoaded ? (
                  <Chip
                    icon={<CheckIcon />}
                    label="Loaded"
                    color="success"
                    variant="filled"
                  />
                ) : (
                  <Chip
                    icon={<WarningIcon />}
                    label="Not Loaded"
                    color="warning"
                    variant="filled"
                  />
                )}
              </Box>
            </Box>

            {loading && (
              <Box>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Processing dictionary data...
                </Typography>
              </Box>
            )}

            {/* Database Statistics */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Database Statistics:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {totalWordsCount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Words
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {stats?.totalCategories || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Categories
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main' }}>
                      {categories?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Loaded Categories
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main' }}>
                      {totalWords || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Memory
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Database Info */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Database Information:
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Data Source:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats?.dataSource === 'fallback' ? 'Fallback Data' : '/data/dictionary.json'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Loaded:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(stats?.loadedAt)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Storage Type:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    IndexedDB (Browser)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Search Optimization:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Full-text + Indexed
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Features */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Database Features:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Fast Search" size="small" color="primary" />
                <Chip label="Offline Access" size="small" color="success" />
                <Chip label="Auto-complete" size="small" color="info" />
                <Chip label="Category Filtering" size="small" color="warning" />
                <Chip label="Difficulty Sorting" size="small" color="secondary" />
                <Chip label="Indexed Retrieval" size="small" color="primary" />
              </Stack>
            </Box>

            {!isLoaded && (
              <Alert severity="warning">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Dictionary Not Loaded
                </Typography>
                <Typography variant="body2">
                  The dictionary database is empty. Click "Load Dictionary Data" to import words from the JSON file.
                </Typography>
              </Alert>
            )}

            {isLoaded && stats?.dataSource === 'fallback' && (
              <Alert severity="info">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Using Fallback Data
                </Typography>
                <Typography variant="body2">
                  Could not load from /data/dictionary.json, using built-in sample data.
                  Add your dictionary.json file to the public/data/ folder for full functionality.
                </Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<LoadIcon />}
                onClick={handleReloadData}
                disabled={loading}
              >
                {isLoaded ? 'Reload Data' : 'Load Dictionary Data'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadStats}
                disabled={loading}
              >
                Refresh Stats
              </Button>
              
              {isLoaded && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={() => setShowClearDialog(true)}
                  disabled={loading}
                >
                  Clear Database
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Clear Confirmation Dialog */}
      <Dialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Clear Dictionary Database
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to clear the dictionary database?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will remove all {totalWordsCount.toLocaleString()} words and search indexes. 
            You'll need to reload the data from the JSON file.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearData}
            disabled={loading}
            startIcon={<ClearIcon />}
          >
            Clear Database
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DatabaseStatus;
