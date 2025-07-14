import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  VolumeUp as VolumeUpIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAudio } from '../../context/AudioContext';
import AudioButton from './AudioButton';
import { AUDIO_TYPES } from '../../services/AudioService';

/**
 * Voice Selector Component
 * Allows users to select their preferred voice and configure audio settings
 */
const VoiceSelector = ({ variant = 'select', showSettings = true }) => {
  const {
    selectedVoice,
    changeVoice,
    availableVoices,
    audioEnabled,
    toggleAudio,
    getVoiceInfo
  } = useAudio();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleVoiceChange = (event) => {
    changeVoice(event.target.value);
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Voice</InputLabel>
          <Select
            value={selectedVoice}
            label="Voice"
            onChange={handleVoiceChange}
            disabled={!audioEnabled}
          >
            {availableVoices.map((voice) => (
              <MenuItem key={voice.id} value={voice.id}>
                {voice.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {showSettings && (
          <Tooltip title="Audio Settings">
            <IconButton onClick={handleSettingsOpen} size="small">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Audio Settings
          </Typography>
          
          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={audioEnabled}
                  onChange={toggleAudio}
                  color="primary"
                />
              }
              label="Enable Audio"
            />

            <FormControl fullWidth disabled={!audioEnabled}>
              <InputLabel>Voice Selection</InputLabel>
              <Select
                value={selectedVoice}
                label="Voice Selection"
                onChange={handleVoiceChange}
              >
                {availableVoices.map((voice) => (
                  <MenuItem key={voice.id} value={voice.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">{voice.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {voice.description}
                        </Typography>
                      </Box>
                      <AudioButton
                        word="Abase"
                        type={AUDIO_TYPES.PRONUNCIATION}
                        variant="icon"
                        size="small"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {audioEnabled && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Current Voice: {getVoiceInfo(selectedVoice)?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getVoiceInfo(selectedVoice)?.description}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Default select variant
  return (
    <>
      <FormControl fullWidth>
        <InputLabel>Voice</InputLabel>
        <Select
          value={selectedVoice}
          label="Voice"
          onChange={handleVoiceChange}
          disabled={!audioEnabled}
        >
          {availableVoices.map((voice) => (
            <MenuItem key={voice.id} value={voice.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box>
                  <Typography variant="body1">{voice.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {voice.description}
                  </Typography>
                </Box>
                <AudioButton
                  word="Abase"
                  type={AUDIO_TYPES.PRONUNCIATION}
                  variant="icon"
                  size="small"
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={handleSettingsClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Audio Settings
          <IconButton onClick={handleSettingsClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={audioEnabled}
                  onChange={toggleAudio}
                  color="primary"
                />
              }
              label="Enable Audio Playback"
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Voice Selection
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose your preferred voice for word pronunciation and examples.
              </Typography>
              
              <Stack spacing={2}>
                {availableVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    variant="outlined"
                    sx={{
                      cursor: audioEnabled ? 'pointer' : 'default',
                      border: selectedVoice === voice.id ? 2 : 1,
                      borderColor: selectedVoice === voice.id ? 'primary.main' : 'divider',
                      opacity: audioEnabled ? 1 : 0.5,
                    }}
                    onClick={audioEnabled ? () => changeVoice(voice.id) : undefined}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {voice.name}
                            {selectedVoice === voice.id && (
                              <Chip
                                label="Selected"
                                size="small"
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {voice.description}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <AudioButton
                            word="Abase"
                            type={AUDIO_TYPES.PRONUNCIATION}
                            variant="icon"
                            size="small"
                            disabled={!audioEnabled}
                          />
                          <AudioButton
                            word="Abase"
                            type={AUDIO_TYPES.EXAMPLE}
                            variant="icon"
                            size="small"
                            disabled={!audioEnabled}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleSettingsClose} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VoiceSelector;
