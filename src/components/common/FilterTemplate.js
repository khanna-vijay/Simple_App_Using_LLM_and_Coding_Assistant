import React from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import {
  School as NewIcon,
  Psychology as PracticeIcon,
  CheckCircle as KnownIcon,
  TrendingUp as AdvancedIcon
} from '@mui/icons-material';

/**
 * Reusable Filter Template Component
 * Used across Word Training, Flash Cards, and Quiz pages for consistent filtering UI
 */
const FilterTemplate = ({
  selectedProgressFilters = [],
  selectedLetters = [],
  selectedComplexities = [],
  selectedPartsOfSpeech = [],
  onProgressToggle,
  onLetterToggle,
  onComplexityToggle,
  onPartsOfSpeechToggle,
  availableLetters = [],
  availableComplexities = [],
  availablePartsOfSpeech = [],
  showTitle = true,
  title = "Filter Options"
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      {showTitle && (
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 600, 
          color: 'primary.main',
          mb: 3
        }}>
          {title}
        </Typography>
      )}

      <Grid container spacing={2}>
        {/* Row 1: Progress Status and Letters */}
        <Grid item xs={12} md={6}>
          {/* Progress Status Filters */}
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              height: '100%',
              border: '2px solid',
              borderColor: 'primary.light',
              borderRadius: 2,
              backgroundColor: 'rgba(99, 102, 241, 0.02)'
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1rem',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              📊 Progress Status
            </Typography>
            <ToggleButtonGroup
              value={selectedProgressFilters}
              onChange={onProgressToggle}
              aria-label="progress filters"
              size="medium"
              sx={{
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButton-root': {
                  fontSize: '0.85rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  border: '2px solid #e0e7ff',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#e0e7ff',
                    borderColor: '#c7d2fe',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(99, 102, 241, 0.15)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    borderColor: 'primary.dark',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      borderColor: 'primary.dark'
                    }
                  }
                }
              }}
            >
              <ToggleButton value="new" aria-label="new words">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NewIcon sx={{ fontSize: '1.1rem' }} />
                  New
                </Box>
              </ToggleButton>
              <ToggleButton value="practice" aria-label="needs practice">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PracticeIcon sx={{ fontSize: '1.1rem' }} />
                  Needs Practice
                </Box>
              </ToggleButton>
              <ToggleButton value="known" aria-label="mastered words">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <KnownIcon sx={{ fontSize: '1.1rem' }} />
                  Mastered
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Letter Filters */}
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              height: '100%',
              border: '2px solid',
              borderColor: 'secondary.light',
              borderRadius: 2,
              backgroundColor: 'rgba(236, 72, 153, 0.02)'
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{
              fontWeight: 700,
              color: 'secondary.main',
              fontSize: '1rem',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              🔤 Letters
            </Typography>
            <ToggleButtonGroup
              value={selectedLetters}
              onChange={onLetterToggle}
              aria-label="letter filters"
              size="medium"
              sx={{
                flexWrap: 'wrap',
                gap: 0.5,
                '& .MuiToggleButton-root': {
                  fontSize: '0.85rem',
                  minWidth: 40,
                  height: 40,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  border: '2px solid #fce7f3',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#fce7f3',
                    borderColor: '#f9a8d4',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.15)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'secondary.main',
                    borderColor: 'secondary.dark',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                      borderColor: 'secondary.dark'
                    }
                  }
                }
              }}
            >
              {availableLetters.map((letter) => (
                <ToggleButton key={letter} value={letter} aria-label={`letter ${letter}`}>
                  {letter}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Paper>
        </Grid>

        {/* Row 2: Difficulty and Word Types */}
        <Grid item xs={12} md={6}>
          {/* Complexity Filters */}
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              height: '100%',
              border: '2px solid',
              borderColor: 'warning.light',
              borderRadius: 2,
              backgroundColor: 'rgba(245, 158, 11, 0.02)'
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{
              fontWeight: 700,
              color: 'warning.main',
              fontSize: '1rem',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              📈 Difficulty Level
            </Typography>
            <ToggleButtonGroup
              value={selectedComplexities}
              onChange={onComplexityToggle}
              aria-label="complexity filters"
              size="medium"
              sx={{
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButton-root': {
                  fontSize: '0.85rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  border: '2px solid #fef3c7',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#fef3c7',
                    borderColor: '#fde68a',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(245, 158, 11, 0.15)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'warning.main',
                    borderColor: 'warning.dark',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    '&:hover': {
                      backgroundColor: 'warning.dark',
                      borderColor: 'warning.dark'
                    }
                  }
                }
              }}
            >
              {availableComplexities.map((complexity) => (
                <ToggleButton key={complexity} value={complexity} aria-label={`complexity ${complexity}`}>
                  {complexity}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Part of Speech Filters */}
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              height: '100%',
              border: '2px solid',
              borderColor: 'info.light',
              borderRadius: 2,
              backgroundColor: 'rgba(59, 130, 246, 0.02)'
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{
              fontWeight: 700,
              color: 'info.main',
              fontSize: '1rem',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              📝 Word Types
            </Typography>
            <ToggleButtonGroup
              value={selectedPartsOfSpeech}
              onChange={onPartsOfSpeechToggle}
              aria-label="part of speech filters"
              size="medium"
              sx={{
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButton-root': {
                  fontSize: '0.85rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  border: '2px solid #dbeafe',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#dbeafe',
                    borderColor: '#bfdbfe',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(59, 130, 246, 0.15)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'info.main',
                    borderColor: 'info.dark',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      backgroundColor: 'info.dark',
                      borderColor: 'info.dark'
                    }
                  }
                }
              }}
            >
              {availablePartsOfSpeech.map((pos) => (
                <ToggleButton key={pos} value={pos} aria-label={`part of speech ${pos}`}>
                  {pos}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FilterTemplate;
