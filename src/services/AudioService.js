/**
 * Audio Service for English Leap
 * Handles word pronunciation and example audio playback with voice selection
 */

// Available voice options
export const AVAILABLE_VOICES = [
  { id: 'Puck', name: 'Puck', description: 'Clear and crisp voice' },
  { id: 'Umbriel', name: 'Umbriel', description: 'Warm and friendly voice' },
  { id: 'Iapetus', name: 'Iapetus', description: 'Professional and authoritative voice' }
];

// Audio types
export const AUDIO_TYPES = {
  PRONUNCIATION: 'pronunciation',
  EXAMPLE: 'example_and_sample'
};

class AudioService {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
    this.selectedVoice = this.getStoredVoice();
  }

  /**
   * Get the stored voice preference from localStorage
   */
  getStoredVoice() {
    const stored = localStorage.getItem('englishLeap_selectedVoice');
    return stored || 'Puck'; // Default to Puck
  }

  /**
   * Set and store the selected voice
   */
  setVoice(voiceId) {
    this.selectedVoice = voiceId;
    localStorage.setItem('englishLeap_selectedVoice', voiceId);
  }

  /**
   * Get the current selected voice
   */
  getCurrentVoice() {
    return this.selectedVoice;
  }

  /**
   * Generate audio file path based on word, type, and voice
   */
  getAudioPath(word, type) {
    // Normalize word name (capitalize first letter, handle special characters)
    const normalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    const audioPath = `/audio/${normalizedWord}-${type}-${this.selectedVoice}.mp3`;
    console.log('Generated audio path:', audioPath); // Debug log
    return audioPath;
  }

  /**
   * Check if audio file exists for a word and type
   */
  async checkAudioExists(word, type) {
    const audioPath = this.getAudioPath(word, type);
    try {
      console.log('Checking if audio exists:', audioPath); // Debug log
      const response = await fetch(audioPath, { method: 'HEAD' });
      console.log('Audio check response:', response.status, response.ok); // Debug log
      return response.ok;
    } catch (error) {
      console.error('Error checking audio existence:', error);
      return false;
    }
  }

  /**
   * Play audio for a word
   */
  async playAudio(word, type = AUDIO_TYPES.PRONUNCIATION) {
    try {
      console.log('PlayAudio called with:', { word, type, voice: this.selectedVoice }); // Debug log

      // Stop any currently playing audio
      this.stopAudio();

      const audioPath = this.getAudioPath(word, type);
      console.log('Attempting to play audio from:', audioPath); // Debug log

      // Check if audio file exists
      const exists = await this.checkAudioExists(word, type);
      console.log('Audio file exists:', exists); // Debug log

      if (!exists) {
        console.warn(`Audio file not found: ${audioPath}`);
        return { success: false, error: 'Audio file not available' };
      }

      // Create and play audio
      this.currentAudio = new Audio(audioPath);
      this.isPlaying = true;

      // Set up event listeners
      this.currentAudio.addEventListener('ended', () => {
        console.log('Audio playback ended');
        this.isPlaying = false;
        this.currentAudio = null;
      });

      this.currentAudio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        console.error('Failed audio path:', audioPath);
        this.isPlaying = false;
        this.currentAudio = null;
      });

      this.currentAudio.addEventListener('loadstart', () => {
        console.log('Audio loading started');
      });

      this.currentAudio.addEventListener('canplay', () => {
        console.log('Audio can play');
      });

      // Play the audio
      console.log('Starting audio playback...');
      await this.currentAudio.play();
      console.log('Audio playback started successfully');

      return { success: true };
    } catch (error) {
      console.error('Error playing audio:', error);
      console.error('Error details:', { word, type, voice: this.selectedVoice });
      this.isPlaying = false;
      this.currentAudio = null;
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop currently playing audio
   */
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Get available audio types for a word
   */
  async getAvailableAudioTypes(word) {
    const types = [];
    
    for (const type of Object.values(AUDIO_TYPES)) {
      const exists = await this.checkAudioExists(word, type);
      if (exists) {
        types.push(type);
      }
    }
    
    return types;
  }

  /**
   * Preload audio for better performance
   */
  preloadAudio(word, type = AUDIO_TYPES.PRONUNCIATION) {
    const audioPath = this.getAudioPath(word, type);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = audioPath;
    return audio;
  }

  /**
   * Get voice information
   */
  getVoiceInfo(voiceId) {
    return AVAILABLE_VOICES.find(voice => voice.id === voiceId);
  }

  /**
   * Get all available voices
   */
  getAvailableVoices() {
    return AVAILABLE_VOICES;
  }
}

// Create singleton instance
const audioService = new AudioService();

export default audioService;
