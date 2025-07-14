import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Avatar,
  TextField,
  Grid,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';

/**
 * Profile Manager Component
 * Allows users to edit or delete their profile
 */
const ProfileManager = ({ open, onClose }) => {
  const { currentUser, updateCurrentUser, deleteUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedUsername, setEditedUsername] = useState(currentUser?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '👤');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Available avatars
  const avatars = ['👤', '👨', '👩', '🧑', '👦', '👧', '🧒', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍💼', '👩‍💼', '🧑‍💼'];

  const handleEditStart = () => {
    setEditedUsername(currentUser?.username || '');
    setSelectedAvatar(currentUser?.avatar || '👤');
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditedUsername(currentUser?.username || '');
    setSelectedAvatar(currentUser?.avatar || '👤');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedUsername.trim()) return;

    try {
      setIsSaving(true);
      await updateCurrentUser({
        username: editedUsername.trim(),
        avatar: selectedAvatar
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentUser) return;

    try {
      setIsDeleting(true);
      await deleteUser(currentUser.id);
      onClose();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'success';
      case 'Advanced': return 'info';
      case 'Intermediate': return 'warning';
      case 'Beginner': return 'primary';
      default: return 'default';
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              👤 Profile Settings
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {/* Profile Header */}
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2.5rem',
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.50'
                }}
              >
                {isEditing ? selectedAvatar : currentUser.avatar || '👤'}
              </Avatar>
              
              {isEditing ? (
                <TextField
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                  autoFocus
                />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {currentUser.username}
                </Typography>
              )}
              
              <Chip
                label={currentUser.level || 'Beginner'}
                color={getLevelColor(currentUser.level)}
                sx={{ mb: 1 }}
              />
            </Box>

            {/* Avatar Selection (when editing) */}
            {isEditing && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Choose Avatar:
                </Typography>
                <Grid container spacing={1}>
                  {avatars.map((avatar) => (
                    <Grid item key={avatar}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          cursor: 'pointer',
                          border: selectedAvatar === avatar ? 3 : 1,
                          borderColor: selectedAvatar === avatar ? 'primary.main' : 'divider',
                          fontSize: '1.2rem',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => setSelectedAvatar(avatar)}
                      >
                        {avatar}
                      </Avatar>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Divider />

            {/* Profile Stats */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                📊 Your Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {currentUser.totalWordsLearned || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Words Learned
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {currentUser.totalQuizzesTaken || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quizzes Taken
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main' }}>
                      {currentUser.averageScore || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Score
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main' }}>
                      {currentUser.experience || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Experience Points
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Account Info */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                📅 Account Information
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Member Since:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(currentUser.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Login:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(currentUser.lastLoginAt)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Danger Zone */}
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  ⚠️ Danger Zone
                </Typography>
                <Typography variant="body2">
                  Deleting your profile will permanently remove all your progress, quiz history, and settings. This action cannot be undone.
                </Typography>
              </Alert>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setShowDeleteConfirm(true)}
                fullWidth
              >
                Delete Profile
              </Button>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          {isEditing ? (
            <>
              <Button onClick={handleEditCancel} startIcon={<CancelIcon />}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!editedUsername.trim() || isSaving}
                startIcon={<SaveIcon />}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={handleEditStart}
                startIcon={<EditIcon />}
              >
                Edit Profile
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Confirm Profile Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete your profile <strong>"{currentUser.username}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              All your learned words and progress
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Complete quiz history and scores
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All settings and preferences
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Your position on the leaderboard
            </Typography>
          </Box>
          <Alert severity="error" sx={{ mt: 2 }}>
            <strong>This action cannot be undone!</strong>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete Profile'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileManager;
