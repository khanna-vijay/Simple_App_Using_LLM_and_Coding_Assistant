import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDictionary } from '../../context/DictionaryContext';

/**
 * Dictionary Import Component
 * Handles manual import of dictionary data from JSON file
 */
const DictionaryImport = () => {
  const { databaseService, dbStats } = useDictionary();
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [importStats, setImportStats] = useState(null);

  const handleImportFromFile = async () => {
    try {
      setImporting(true);
      setImportProgress(0);
      setImportMessage('Starting import...');
      setImportResult(null);

      // Clear existing data first
      setImportMessage('Clearing existing data...');
      setImportProgress(5);
      await databaseService.clearDictionaryData();

      // Import from JSON file
      setImportMessage('Loading dictionary file...');
      setImportProgress(10);
      
      const response = await fetch('/data/dictionary.json');
      if (!response.ok) {
        throw new Error(`Failed to load dictionary file: ${response.status}`);
      }

      const rawData = await response.json();
      setImportMessage('Transforming data structure...');
      setImportProgress(20);

      // Transform nested structure to flat array
      const flattenedWords = transformDictionaryData(rawData);
      
      setImportMessage('Storing words in database...');
      setImportProgress(30);

      // Store in database with progress tracking
      await databaseService.storeDictionaryData(flattenedWords, (progress, message) => {
        setImportProgress(30 + (progress * 0.6)); // 30% to 90%
        setImportMessage(message);
      });

      // Set metadata
      setImportMessage('Finalizing import...');
      setImportProgress(95);
      await databaseService.setMetadata('dataLoaded', true);
      await databaseService.setMetadata('loadedAt', new Date().toISOString());
      await databaseService.setMetadata('totalWords', flattenedWords.length);
      await databaseService.setMetadata('dataSource', 'manual_import');
      await databaseService.setMetadata('dbVersion', 2);

      setImportProgress(100);
      setImportMessage('Import completed successfully!');
      
      // Get final stats
      const stats = await databaseService.getStatistics();
      setImportStats(stats);
      
      setImportResult({
        success: true,
        message: `Successfully imported ${flattenedWords.length} words`,
        wordsCount: flattenedWords.length
      });

    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: error.message || 'Import failed'
      });
    } finally {
      setImporting(false);
    }
  };

  const transformDictionaryData = (nestedData) => {
    const flattenedWords = [];
    
    // Iterate through each letter
    Object.keys(nestedData).forEach(letter => {
      const letterData = nestedData[letter];
      
      // Skip if no words property
      if (!letterData.words) return;
      
      // Iterate through words in this letter
      Object.keys(letterData.words).forEach(wordName => {
        const wordData = letterData.words[wordName];
        
        // Create flattened word object
        const flattenedWord = {
          word: wordName,
          letter: letter,
          wordLowercase: wordName.toLowerCase(),
          ...wordData
        };
        
        flattenedWords.push(flattenedWord);
      });
    });
    
    console.log(`Transformed ${flattenedWords.length} words from nested structure`);
    return flattenedWords;
  };

  const handleTestImport = async () => {
    try {
      // Test with a small sample
      const sampleWords = [
        {
          word: "Test",
          letter: "T",
          wordLowercase: "test",
          complexity: "Beginner",
          meanings: [{
            part_of_speech: "Noun",
            definitions: [{
              definition: "A procedure intended to establish the quality, performance, or reliability of something.",
              example: "This is a test word."
            }]
          }]
        }
      ];

      await databaseService.storeDictionaryData(sampleWords);
      
      // Test retrieval
      const retrievedWord = await databaseService.getWordByName("Test");
      console.log('Test word retrieval:', retrievedWord);
      
      setImportResult({
        success: true,
        message: `Test completed. Retrieved: ${retrievedWord ? retrievedWord.word : 'null'}`
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: `Test failed: ${error.message}`
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              📚 Dictionary Data Import
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manually import dictionary data from JSON file into the database
            </Typography>
          </Box>

          {/* Current Status */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Current Database Status:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip 
                label={`${dbStats?.totalWords || 0} Words`} 
                color={dbStats?.totalWords > 0 ? 'success' : 'default'}
                size="small"
              />
              <Chip 
                label={dbStats?.dataSource || 'Unknown Source'} 
                color="info"
                size="small"
              />
              {dbStats?.loadedAt && (
                <Chip 
                  label={`Loaded: ${new Date(dbStats.loadedAt).toLocaleDateString()}`} 
                  size="small"
                />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Import Progress */}
          {importing && (
            <Box>
              <Typography variant="body2" gutterBottom>
                {importMessage}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={importProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round(importProgress)}% complete
              </Typography>
            </Box>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert 
              severity={importResult.success ? 'success' : 'error'}
              icon={importResult.success ? <CheckIcon /> : <ErrorIcon />}
            >
              {importResult.message}
            </Alert>
          )}

          {/* Import Stats */}
          {importStats && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Import Statistics:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`${importStats.totalWords} Words`} color="success" size="small" />
                <Chip label={`${importStats.totalCategories} Categories`} color="info" size="small" />
                <Chip label={importStats.dataSource} color="primary" size="small" />
              </Stack>
            </Box>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleImportFromFile}
              disabled={importing}
              size="large"
            >
              {importing ? 'Importing...' : 'Import Dictionary'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleTestImport}
              disabled={importing}
            >
              Test Import
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            ⚠️ This will replace all existing dictionary data. Make sure to backup if needed.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DictionaryImport;
