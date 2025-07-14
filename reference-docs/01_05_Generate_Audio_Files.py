#!/usr/bin/env python3
"""
01_05_Generate_Audio_Files.py

This script reads word details from the comprehensive English dictionary (99_02_comprehensive_english_dict.json)
and generates MP3 audio files using Text-to-Speech APIs.

For each word, it extracts:
- Word name
- Phonetic respelling
- SSML phoneme
- Definition
- Example

It then generates audio files for all 3 Chirp3 HD voices:
1. "{word}-example_and_sample-{voice}.mp3" - Contains word, definition, and example
2. "{word}-pronunciation-{voice}.mp3" - Contains word pronunciation only

Files are saved in an "audio" subfolder. Each word gets 6 files total (3 voices × 2 types each).

Author: AI Assistant
Date: 2024
"""

import json
import os
import logging
import time
import requests
import subprocess
from typing import Dict, List, Any
import re
import base64

# Setup comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('audio_generation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AudioGenerator:
    def __init__(self, json_file_path: str = "99_02_comprehensive_english_dict.json"):
        """
        Initialize the AudioGenerator.
        
        Args:
            json_file_path (str): Path to the comprehensive dictionary JSON file
        """
        self.json_file_path = json_file_path
        self.audio_folder = "audio"
        
        # Create audio folder if it doesn't exist
        if not os.path.exists(self.audio_folder):
            os.makedirs(self.audio_folder)
            logger.info(f"Created audio folder: {self.audio_folder}")
        
        # Load all available voices
        self.available_voices = [
            "en-US-Chirp3-HD-Umbriel",
            "en-US-Chirp3-HD-Iapetus", 
            "en-US-Chirp3-HD-Puck"
        ]
        
        # Initialize gcloud path
        self.gcloud_path = self.find_gcloud()
        
        # Test TTS availability
        self.test_tts_availability()
    
    def find_gcloud(self):
        """Try to find gcloud in common locations"""
        possible_paths = [
            "gcloud",
            r"C:\Program Files\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
            r"C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
            os.path.expanduser("~/AppData/Local/Google/Cloud SDK/google-cloud-sdk/bin/gcloud.cmd"),
            os.path.expanduser("~/google-cloud-sdk/bin/gcloud.cmd")
        ]
        
        for path in possible_paths:
            try:
                result = subprocess.run([path, '--version'], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    logger.info(f"Found gcloud at: {path}")
                    return path
            except:
                continue
        
        return None
    
    def load_selected_voice(self) -> str:
        """
        Load the selected voice from the voice selection file.
        
        Returns:
            str: The selected voice name or default voice
        """
        try:
            if os.path.exists("selected_voice.json"):
                with open("selected_voice.json", "r") as f:
                    voice_data = json.load(f)
                
                selected_voice_name = voice_data["voice_info"]["name"]
                logger.info(f"Loaded selected voice: {selected_voice_name}")
                return selected_voice_name
            else:
                # Default to the original voice if no selection file exists
                default_voice = "en-US-Chirp3-HD-Algenib"
                logger.info(f"No voice selection found, using default: {default_voice}")
                return default_voice
                
        except Exception as e:
            logger.warning(f"Error loading selected voice: {e}, using default")
            return "en-US-Chirp3-HD-Algenib"
    
    def test_tts_availability(self):
        """
        Test which TTS methods are available and log the results.
        """
        logger.info("Testing TTS availability...")
        
        # Test modern Google TTS API
        try:
            if self.gcloud_path:
                logger.info("OK - Modern Google TTS API is available")
                self.modern_google_available = True
            else:
                logger.warning("X - gcloud not found. Install Google Cloud SDK")
                self.modern_google_available = False
        except Exception as e:
            logger.warning(f"X - Error testing gcloud: {e}")
            self.modern_google_available = False
        
        # Test gTTS (Google Text-to-Speech)
        try:
            from gtts import gTTS
            logger.info("OK - gTTS (Google Text-to-Speech) is available")
            self.gtts_available = True
        except ImportError:
            logger.warning("X - gTTS not available. Install with: pip install gTTS")
            self.gtts_available = False
        
        # Test pyttsx3 (offline TTS)
        try:
            import pyttsx3
            logger.info("OK - pyttsx3 (offline TTS) is available")
            self.pyttsx3_available = True
        except ImportError:
            logger.warning("X - pyttsx3 not available. Install with: pip install pyttsx3")
            self.pyttsx3_available = False
        
        # Test Google Cloud TTS
        try:
            from google.cloud import texttospeech
            logger.info("OK - Google Cloud TTS is available")
            self.google_cloud_available = True
        except ImportError:
            logger.warning("X - Google Cloud TTS not available. Install with: pip install google-cloud-texttospeech")
            self.google_cloud_available = False
        
        # Test internet connectivity
        try:
            response = requests.get("https://www.google.com", timeout=5)
            logger.info("OK - Internet connectivity available")
            self.internet_available = True
        except:
            logger.warning("X - No internet connectivity detected")
            self.internet_available = False
    
    def load_dictionary(self) -> Dict[str, Any]:
        """
        Load the comprehensive dictionary from JSON file.
        
        Returns:
            Dict[str, Any]: The loaded dictionary data
        """
        try:
            logger.info(f"Attempting to load dictionary from: {self.json_file_path}")
            
            if not os.path.exists(self.json_file_path):
                logger.error(f"Dictionary file not found: {self.json_file_path}")
                logger.info("Available files in current directory:")
                for file in os.listdir("."):
                    if file.endswith(".json"):
                        logger.info(f"  - {file}")
                raise FileNotFoundError(f"Dictionary file not found: {self.json_file_path}")
            
            with open(self.json_file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            logger.info(f"Successfully loaded dictionary from {self.json_file_path}")
            logger.info(f"Dictionary structure: {list(data.keys())}")
            return data
            
        except FileNotFoundError as e:
            logger.error(f"Dictionary file not found: {e}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON file: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error loading dictionary: {e}")
            raise
    
    def extract_word_data(self, word_name: str, word_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Extract the required fields from a word's data.
        
        Args:
            word_name (str): The name of the word
            word_data (Dict[str, Any]): The word's data from the dictionary
            
        Returns:
            Dict[str, str]: Extracted word data with required fields
        """
        logger.debug(f"Extracting data for word: {word_name}")
        
        extracted_data = {
            "word": word_name,
            "phonetic_respelling": "",
            "ssml_phoneme": "",
            "definition": "",
            "example": ""
        }
        
        # Extract phonetic respelling
        if 'phonetic_respelling' in word_data:
            extracted_data['phonetic_respelling'] = word_data['phonetic_respelling']
            logger.debug(f"Found phonetic respelling: {extracted_data['phonetic_respelling']}")
        
        # Extract SSML phoneme
        if 'ssml_phoneme' in word_data:
            extracted_data['ssml_phoneme'] = word_data['ssml_phoneme']
            logger.debug(f"Found SSML phoneme: {extracted_data['ssml_phoneme']}")
        
        # Extract definition and example from meanings
        if 'meanings' in word_data and word_data['meanings']:
            logger.debug(f"Found {len(word_data['meanings'])} meanings")
            
            # Get the first meaning's first definition
            first_meaning = word_data['meanings'][0]
            if 'definitions' in first_meaning and first_meaning['definitions']:
                logger.debug(f"Found {len(first_meaning['definitions'])} definitions")
                
                first_definition = first_meaning['definitions'][0]
                if 'definition' in first_definition:
                    extracted_data['definition'] = first_definition['definition']
                    logger.debug(f"Found definition: {extracted_data['definition'][:50]}...")
                
                if 'example' in first_definition:
                    extracted_data['example'] = first_definition['example']
                    logger.debug(f"Found example: {extracted_data['example'][:50]}...")
        
        # Log extraction results
        missing_fields = [field for field, value in extracted_data.items() if not value and field != 'word']
        if missing_fields:
            logger.warning(f"Missing fields for {word_name}: {missing_fields}")
        
        return extracted_data
    
    def create_text_for_tts(self, word_data: Dict[str, str]) -> str:
        """
        Create text for TTS with proper formatting.
        
        Args:
            word_data (Dict[str, str]): Extracted word data
            
        Returns:
            str: Formatted text for TTS
        """
        word = word_data['word']
        phonetic = word_data['phonetic_respelling']
        definition = word_data['definition']
        example = word_data['example']
        
        # Create text with proper formatting
        text = f"{word}."
        
        #if phonetic:
            #text += f" It's pronounced {phonetic}."
        
        text += f"..{word} means: {definition}"
        
        if example:
            text += f" Example: {example}"
        
        logger.debug(f"Generated TTS text for {word}: {text[:100]}...")
        return text
    
    def generate_audio_modern_google(self, word_data: Dict[str, str], voice_name: str, audio_type: str = "example") -> bool:
        """
        Generate MP3 audio file using modern Google TTS API with HD voice.
        
        Args:
            word_data (Dict[str, str]): Extracted word data
            voice_name (str): The voice to use for generation
            audio_type (str): Type of audio to generate ("example" or "pronunciation")
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            word_name = word_data['word']
            voice_short_name = voice_name.split('-')[-1]
            
            # Create appropriate filename based on audio type
            if audio_type == "pronunciation":
                filename = f"{word_name}-pronunciation-{voice_short_name}.mp3"
            else:
                filename = f"{word_name}-example_and_sample-{voice_short_name}.mp3"
            
            filepath = os.path.join(self.audio_folder, filename)
            
            # Check if file already exists
            if os.path.exists(filepath):
                logger.info(f"Audio file already exists: {filename}")
                return True
            
            # Create text for TTS based on audio type
            if audio_type == "pronunciation":
                text = f"..{word_name}.."
                #if word_data['phonetic_respelling']:
                   # text += f" It's pronounced {word_data['phonetic_respelling']}."
            else:
                text = self.create_text_for_tts(word_data)
            
            # Get project ID
            project_result = subprocess.run([self.gcloud_path, 'config', 'list', '--format=value(core.project)'], 
                                          capture_output=True, text=True, timeout=10)
            if project_result.returncode != 0:
                logger.error("Failed to get project ID")
                return False
            
            project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
            
            # Prepare the request payload
            payload = {
                "input": {
                    "text": text
                },
                "voice": {
                    "languageCode": "en-US",
                    "name": voice_name,
                    "voiceClone": {}
                },
                "audioConfig": {
                    "audioEncoding": "MP3"
                }
            }
            
            # Make the API request
            headers = {
                "Content-Type": "application/json",
                "X-Goog-User-Project": project_id
            }
            
            response = requests.post(
                "https://texttospeech.googleapis.com/v1/text:synthesize",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                # Decode the audio content
                audio_content = base64.b64decode(response.json()['audioContent'])
                
                # Save the audio file
                with open(filepath, "wb") as out:
                    out.write(audio_content)
                
                logger.info(f"Generated audio file using Modern Google TTS HD: {filename}")
                return True
            else:
                logger.error(f"API request failed: {response.status_code} - {response.text}")
                return False
            
        except Exception as e:
            logger.error(f"Error generating audio with Modern Google TTS for {word_data['word']}: {e}")
            return False
    
    def generate_audio_gtts(self, word_data: Dict[str, str]) -> bool:
        """
        Generate MP3 audio file using gTTS (Google Text-to-Speech).
        
        Args:
            word_data (Dict[str, str]): Extracted word data
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            from gtts import gTTS
            
            word_name = word_data['word']
            filename = f"{word_name}_example.mp3"
            filepath = os.path.join(self.audio_folder, filename)
            
            # Check if file already exists
            if os.path.exists(filepath):
                logger.info(f"Audio file already exists: {filename}")
                return True
            
            # Create text for TTS
            text = self.create_text_for_tts(word_data)
            
            # Generate audio using gTTS
            tts = gTTS(text=text, lang='en', slow=False)
            tts.save(filepath)
            
            logger.info(f"Generated audio file using gTTS: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Error generating audio with gTTS for {word_data['word']}: {e}")
            return False
    
    def generate_audio_pyttsx3(self, word_data: Dict[str, str]) -> bool:
        """
        Generate MP3 audio file using pyttsx3 (offline TTS).
        
        Args:
            word_data (Dict[str, str]): Extracted word data
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            import pyttsx3
            
            word_name = word_data['word']
            filename = f"{word_name}_example.mp3"
            filepath = os.path.join(self.audio_folder, filename)
            
            # Check if file already exists
            if os.path.exists(filepath):
                logger.info(f"Audio file already exists: {filename}")
                return True
            
            # Create text for TTS
            text = self.create_text_for_tts(word_data)
            
            # Initialize pyttsx3
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)  # Speed of speech
            engine.setProperty('volume', 0.9)  # Volume level
            
            # Save to file
            engine.save_to_file(text, filepath)
            engine.runAndWait()
            
            logger.info(f"Generated audio file using pyttsx3: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Error generating audio with pyttsx3 for {word_data['word']}: {e}")
            return False
    
    def generate_audio_for_all_voices(self, word_data: Dict[str, str]) -> Dict[str, Dict[str, bool]]:
        """
        Generate MP3 audio files for all voices using the best available TTS method.
        Creates both example and pronunciation audio files for each voice.
        
        Args:
            word_data (Dict[str, str]): Extracted word data
            
        Returns:
            Dict[str, Dict[str, bool]]: Results for each voice and audio type
        """
        results = {}
        
        for voice_name in self.available_voices:
            results[voice_name] = {
                "example": False,
                "pronunciation": False
            }
            
            logger.info(f"Generating audio for word '{word_data['word']}' using voice '{voice_name}'")
            
            # Try Modern Google TTS API first (HD voice)
            if self.modern_google_available:
                logger.debug(f"Attempting Modern Google TTS HD for {word_data['word']} with {voice_name}")
                
                # Generate example audio
                if self.generate_audio_modern_google(word_data, voice_name, "example"):
                    results[voice_name]["example"] = True
                
                # Generate pronunciation audio
                if self.generate_audio_modern_google(word_data, voice_name, "pronunciation"):
                    results[voice_name]["pronunciation"] = True
                
                # Add delay between requests
                time.sleep(1)
        
        return results
    
    def generate_audio(self, word_data: Dict[str, str]) -> Dict[str, bool]:
        """
        Generate MP3 audio files using the best available TTS method.
        Creates both example and pronunciation audio files.
        
        Args:
            word_data (Dict[str, str]): Extracted word data
            
        Returns:
            Dict[str, bool]: Results for both audio types
        """
        results = {
            "example": False,
            "pronunciation": False
        }
        
        # Try Modern Google TTS API first (HD voice)
        if self.modern_google_available:
            logger.debug(f"Attempting Modern Google TTS HD for {word_data['word']}")
            
            # Generate example audio
            if self.generate_audio_modern_google(word_data, self.available_voices[0], "example"):
                results["example"] = True
            
            # Generate pronunciation audio
            if self.generate_audio_modern_google(word_data, self.available_voices[0], "pronunciation"):
                results["pronunciation"] = True
            
            # If both succeeded, return results
            if results["example"] and results["pronunciation"]:
                return results
        
        # Try gTTS (if internet available)
        if self.gtts_available and self.internet_available:
            logger.debug(f"Attempting gTTS for {word_data['word']}")
            if self.generate_audio_gtts(word_data):
                results["example"] = True
        
        # Try pyttsx3 (offline)
        if self.pyttsx3_available:
            logger.debug(f"Attempting pyttsx3 for {word_data['word']}")
            if self.generate_audio_pyttsx3(word_data):
                results["example"] = True
        
        # Try Google Cloud TTS (if available)
        if self.google_cloud_available:
            logger.debug(f"Attempting Google Cloud TTS for {word_data['word']}")
            if self.generate_audio_google_cloud(word_data):
                results["example"] = True
        
        if not results["example"] and not results["pronunciation"]:
            logger.error(f"No TTS method available for {word_data['word']}")
        
        return results
    
    def generate_audio_google_cloud(self, word_data: Dict[str, str]) -> bool:
        """
        Generate MP3 audio file using Google Cloud TTS.
        
        Args:
            word_data (Dict[str, str]): Extracted word data
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            from google.cloud import texttospeech
            
            word_name = word_data['word']
            filename = f"{word_name}_example.mp3"
            filepath = os.path.join(self.audio_folder, filename)
            
            # Check if file already exists
            if os.path.exists(filepath):
                logger.info(f"Audio file already exists: {filename}")
                return True
            
            # Create text for TTS
            text = self.create_text_for_tts(word_data)
            
            # Initialize client
            client = texttospeech.TextToSpeechClient()
            
            # Configure the TTS request
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Configure the voice
            voice = texttospeech.VoiceSelectionParams(
                language_code="en-US",
                name=self.selected_voice, # Use the selected voice
                ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
            )
            
            # Configure the audio output
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=0.9,
                pitch=0.0
            )
            
            # Perform the TTS request
            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            # Save the audio file
            with open(filepath, "wb") as out:
                out.write(response.audio_content)
            
            logger.info(f"Generated audio file using Google Cloud TTS: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Error generating audio with Google Cloud TTS for {word_data['word']}: {e}")
            return False
    
    def process_all_words(self) -> Dict[str, Any]:
        """
        Process all words in the dictionary and generate audio files.
        
        Returns:
            Dict[str, Any]: Statistics about the processing
        """
        logger.info("Starting audio generation process...")
        
        # Load dictionary
        dictionary_data = self.load_dictionary()
        
        stats = {
            "total_words": 0,
            "successful_examples": 0,
            "successful_pronunciations": 0,
            "failed_generations": 0,
            "skipped_words": 0,
            "processing_time": 0,
            "total_voices": len(self.available_voices)
        }
        
        start_time = time.time()
        
        # Process each letter
        for letter, letter_data in dictionary_data.items():
            if isinstance(letter_data, dict) and 'words' in letter_data:
                words = letter_data['words']
                logger.info(f"Processing letter {letter} with {len(words)} words")
                
                for word_name, word_data in words.items():
                    stats["total_words"] += 1
                    
                    try:
                        logger.info(f"Processing word {stats['total_words']}: {word_name}")
                        
                        # Extract word data
                        extracted_data = self.extract_word_data(word_name, word_data)
                        
                        # Check if we have enough data to generate audio
                        if not extracted_data['definition'] or not extracted_data['example']:
                            logger.warning(f"Skipping {word_name}: Missing definition or example")
                            stats["skipped_words"] += 1
                            continue
                        
                        # Generate audio for all voices
                        audio_results = self.generate_audio_for_all_voices(extracted_data)
                        
                        # Count successful generations for all voices
                        for voice_name, voice_results in audio_results.items():
                            if voice_results["example"]:
                                stats["successful_examples"] += 1
                            if voice_results["pronunciation"]:
                                stats["successful_pronunciations"] += 1
                        
                        # Check if any generation failed
                        total_expected = len(self.available_voices) * 2  # 2 files per voice
                        total_generated = sum(
                            sum(1 for result in voice_results.values() if result)
                            for voice_results in audio_results.values()
                        )
                        
                        if total_generated < total_expected:
                            stats["failed_generations"] += 1
                        
                        # Add delay to avoid rate limiting
                        time.sleep(2)
                        
                    except Exception as e:
                        logger.error(f"Error processing word {word_name}: {e}")
                        stats["failed_generations"] += 1
        
        stats["processing_time"] = time.time() - start_time
        
        # Print summary
        self.print_summary(stats)
        
        return stats
    
    def print_summary(self, stats: Dict[str, Any]):
        """
        Print a summary of the audio generation process.
        
        Args:
            stats (Dict[str, Any]): Processing statistics
        """
        print("\n" + "="*60)
        print("AUDIO GENERATION SUMMARY")
        print("="*60)
        print(f"Total Words Processed: {stats['total_words']}")
        print(f"Total Voices Used: {stats['total_voices']}")
        print(f"Successful Example Audio Files: {stats['successful_examples']}")
        print(f"Successful Pronunciation Audio Files: {stats['successful_pronunciations']}")
        print(f"Failed Generations: {stats['failed_generations']}")
        print(f"Skipped Words: {stats['skipped_words']}")
        print(f"Processing Time: {stats['processing_time']:.2f} seconds")
        print(f"Audio Files Saved in: {self.audio_folder}/")
        print(f"Available Voices: {', '.join(self.available_voices)}")
        print("="*60)

def main():
    """
    Main function to run the audio generation process.
    """
    try:
        logger.info("="*60)
        logger.info("AUDIO GENERATION SCRIPT STARTED")
        logger.info("="*60)
        
        # Initialize the audio generator
        generator = AudioGenerator()
        
        # Process all words
        stats = generator.process_all_words()
        
        logger.info("Audio generation process completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main process: {e}")
        raise

if __name__ == "__main__":
    main() 