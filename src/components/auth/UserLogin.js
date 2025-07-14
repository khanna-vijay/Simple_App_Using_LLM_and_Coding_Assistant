import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Login as LoginIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';
import ProfileManager from '../profile/ProfileManager';

/**
 * User Login Component
 * Handles user selection and creation
 */
const UserLogin = ({ open, onClose }) => {
  const { users, createUser, loginUser, deleteUser } = useUser();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [isCreating, setIsCreating] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [selectedUserForManagement, setSelectedUserForManagement] = useState(null);

  // Available avatars
  const avatars = ['👤', '👨', '👩', '🧑', '👦', '👧', '🧒', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍💼', '👩‍💼', '🧑‍💼'];

  const handleCreateUser = async () => {
    if (!newUsername.trim()) return;

    try {
      setIsCreating(true);
      const user = await createUser(newUsername.trim(), selectedAvatar);
      await loginUser(user.id);
      // Small delay to ensure authentication state is updated
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoginUser = async (userId) => {
    try {
      await loginUser(userId);
      // Small delay to ensure authentication state is updated
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again.');
    }
  };

  const resetCreateForm = () => {
    setNewUsername('');
    setSelectedAvatar('👤');
    setShowCreateUser(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  return (
    <>
    <Dialog
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Welcome to English Leap
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select your profile or create a new one
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {!showCreateUser ? (
          <>
            {/* Existing Users */}
            {users.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Select Your Profile
                </Typography>
                <Grid container spacing={2}>
                  {users.map((user) => (
                    <Grid item xs={12} sm={6} md={4} key={user.id}>
                      <Card
                        sx={{
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                          }
                        }}
                      >
                        {/* User Options */}
                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                          <Tooltip title="Manage Profile">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserForManagement(user);
                                setShowProfileManager(true);
                              }}
                              sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                              }}
                            >
                              <SettingsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <CardContent
                          sx={{ textAlign: 'center', p: 3, cursor: 'pointer' }}
                          onClick={() => handleLoginUser(user.id)}
                        >
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              fontSize: '2rem',
                              mx: 'auto',
                              mb: 2,
                              bgcolor: 'primary.50'
                            }}
                          >
                            {user.avatar || '👤'}
                          </Avatar>
                          
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {user.username}
                          </Typography>
                          
                          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                            <Chip
                              label={user.level || 'Beginner'}
                              size="small"
                              color={getLevelColor(user.level)}
                            />
                          </Stack>
                          
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                Words Learned
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {user.totalWordsLearned || 0}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                Quizzes Taken
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {user.totalQuizzesTaken || 0}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                Last Login
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {formatDate(user.lastLoginAt)}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Create New User Button */}
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                border: '2px dashed #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
              onClick={() => setShowCreateUser(true)}
            >
              <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                <AddIcon sx={{ fontSize: '2rem' }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Create New Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start your vocabulary learning journey
              </Typography>
            </Paper>
          </>
        ) : (
          /* Create New User Form */
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Create Your Profile
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                label="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                fullWidth
                placeholder="Enter your name"
                autoFocus
              />
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Choose Your Avatar
                </Typography>
                <Grid container spacing={1}>
                  {avatars.map((avatar) => (
                    <Grid item key={avatar}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          cursor: 'pointer',
                          border: selectedAvatar === avatar ? 3 : 1,
                          borderColor: selectedAvatar === avatar ? 'primary.main' : 'divider',
                          fontSize: '1.5rem',
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
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        {showCreateUser ? (
          <>
            <Button onClick={resetCreateForm}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateUser}
              disabled={!newUsername.trim() || isCreating}
              startIcon={<PersonIcon />}
            >
              {isCreating ? 'Creating...' : 'Create Profile'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>

    {/* Profile Manager for selected user */}
    {selectedUserForManagement && (
      <ProfileManager
        open={showProfileManager}
        onClose={() => {
          setShowProfileManager(false);
          setSelectedUserForManagement(null);
        }}
        user={selectedUserForManagement}
      />
    )}
  </>
  );
};

export default UserLogin;
