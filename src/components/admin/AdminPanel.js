import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Drawer,
  Typography,
  Stack,
  Divider,
  Badge,
  Tooltip,
  TextField,
  Button,
  Alert
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import DatabaseStatus from './DatabaseStatus';
import DataReset from './DataReset';
import DictionaryImport from './DictionaryImport';
import UserStatsDebug from '../debug/UserStatsDebug';
import { useDictionary } from '../../context/DictionaryContext';

/**
 * Admin Control Panel Component
 * Provides access to admin functions in a slide-out panel
 */
const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testWord, setTestWord] = useState('Abase');
  const [testResult, setTestResult] = useState(null);
  const { getWordByName, databaseService } = useDictionary();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleTestWordLookup = async () => {
    try {
      console.log(`Testing word lookup for: "${testWord}"`);
      const result = await getWordByName(testWord);
      setTestResult(result);

      // Also test sample words
      await databaseService.getSampleWords(5);
    } catch (error) {
      console.error('Error testing word lookup:', error);
      setTestResult({ error: error.message });
    }
  };

  return (
    <>
      {/* Admin Panel Toggle Button */}
      <Tooltip title="Admin Controls">
        <IconButton
          color="inherit"
          onClick={handleToggle}
          sx={{
            color: '#64748b',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              color: '#1e293b',
            },
          }}
        >
          <Badge color="error" variant="dot">
            <SettingsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Admin Panel Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 500, md: 600 },
            maxWidth: '90vw',
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              🔧 Admin Controls
            </Typography>
            <IconButton onClick={handleClose} size="large">
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Administrative tools for managing the application data and debugging.
          </Typography>

          <Stack spacing={4}>
            {/* Dictionary Import */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Dictionary Import
              </Typography>
              <DictionaryImport />
            </Box>

            <Divider />

            {/* Dictionary Database Status */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Dictionary Management
              </Typography>
              <DatabaseStatus />
            </Box>

            <Divider />

            {/* User Stats Debug */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                User Statistics Debug
              </Typography>
              <UserStatsDebug />
            </Box>

            <Divider />

            {/* Word Lookup Test */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Word Lookup Test
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Test Word"
                    value={testWord}
                    onChange={(e) => setTestWord(e.target.value)}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleTestWordLookup}
                  >
                    Test
                  </Button>
                </Box>

                {testResult && (
                  <Alert severity={testResult.error ? 'error' : testResult ? 'success' : 'warning'}>
                    {testResult.error ? (
                      `Error: ${testResult.error}`
                    ) : testResult ? (
                      `Found: ${testResult.word} (${testResult.letter})`
                    ) : (
                      'Word not found in database'
                    )}
                  </Alert>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Data Reset */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                System Reset
              </Typography>
              <DataReset />
            </Box>
          </Stack>

          {/* Footer Warning */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="caption" color="warning.dark">
              ⚠️ These are administrative tools. Use with caution in production environments.
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AdminPanel;
