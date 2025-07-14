import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Slider,
  Alert
} from '@mui/material';
import { EmojiEvents as TargetIcon } from '@mui/icons-material';

const GoalSettingDialog = ({ open, onClose, currentGoal, onSave }) => {
  const [goal, setGoal] = useState(currentGoal || 50);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGoalChange = (event, newValue) => {
    const value = typeof newValue === 'number' ? newValue : parseInt(event.target.value);
    if (value >= 1 && value <= 1000) {
      setGoal(value);
      setError('');
    } else {
      setError('Goal must be between 1 and 1000 words');
    }
  };

  const handleSave = async () => {
    if (goal < 1 || goal > 1000) {
      setError('Goal must be between 1 and 1000 words');
      return;
    }

    setSaving(true);
    try {
      await onSave(goal);
      onClose();
    } catch (error) {
      setError('Failed to save goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setGoal(currentGoal || 50);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TargetIcon color="primary" />
          <Typography variant="h6">Set Your Learning Goal</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" gutterBottom>
            How many words would you like to master? Set a realistic goal that motivates you to keep learning.
          </Typography>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Goal: {goal} words
            </Typography>
            <Slider
              value={goal}
              onChange={handleGoalChange}
              min={1}
              max={500}
              step={5}
              marks={[
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
                { value: 200, label: '200' },
                { value: 500, label: '500' }
              ]}
              valueLabelDisplay="auto"
              sx={{ mt: 2 }}
            />
          </Box>

          <TextField
            label="Custom Goal"
            type="number"
            value={goal}
            onChange={(e) => handleGoalChange(e)}
            inputProps={{ min: 1, max: 1000 }}
            fullWidth
            sx={{ mt: 2 }}
            helperText="Enter a number between 1 and 1000"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Tip:</strong> Start with a smaller goal and increase it as you progress. 
              A goal of 50-100 words is great for beginners!
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saving || !!error}
        >
          {saving ? 'Saving...' : 'Save Goal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalSettingDialog;
