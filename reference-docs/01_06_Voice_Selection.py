#!/usr/bin/env python3
"""
01_06_Voice_Selection.py

This script tests and generates audio samples for the best US English male Chirp3 voices.
It allows users to select from 5 recommended male voices for their audio generation.

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
import base64

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('voice_selection.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class VoiceSelector:
    def __init__(self):
        """
        Initialize the VoiceSelector with recommended US English male Chirp3 voices.
        """
        self.voice_samples_folder = "voice_samples"
        
        # Create voice samples folder if it doesn't exist
        if not os.path.exists(self.voice_samples_folder):
            os.makedirs(self.voice_samples_folder)
            logger.info(f"Created voice samples folder: {self.voice_samples_folder}")
        
        # Recommended US English Male Chirp3 voices
        self.recommended_voices = {
            1: {
                "name": "en-US-Chirp3-HD-Antares",
                "description": "Deep, authoritative male voice with excellent clarity",
                "characteristics": "Professional, clear, authoritative"
            },
            2: {
                "name": "en-US-Chirp3-HD-Betelgeuse", 
                "description": "Warm, friendly male voice with natural intonation",
                "characteristics": "Friendly, warm, conversational"
            },
            3: {
                "name": "en-US-Chirp3-HD-Capella",
                "description": "Clear, articulate male voice with precise pronunciation",
                "characteristics": "Clear, articulate, educational"
            },
            4: {
                "name": "en-US-Chirp3-HD-Deneb",
                "description": "Smooth, professional male voice with balanced tone",
                "characteristics": "Professional, smooth, balanced"
            },
            5: {
                "name": "en-US-Chirp3-HD-Elnath",
                "description": "Confident, engaging male voice with good pacing",
                "characteristics": "Confident, engaging, well-paced"
            }
        }
        
        # Test text for voice samples
        self.sample_text = "Hello! I'm a sample of this voice. I can pronounce words clearly and help you learn English vocabulary. This voice is designed to be natural and easy to understand."
    
    def test_gcloud_availability(self) -> bool:
        """
        Test if gcloud is available and configured.
        
        Returns:
            bool: True if gcloud is available, False otherwise
        """
        try:
            result = subprocess.run(['gcloud', 'config', 'list'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                logger.info("OK - gcloud is available and configured")
                return True
            else:
                logger.error("X - gcloud not configured. Run: gcloud auth login")
                return False
        except FileNotFoundError:
            logger.error("X - gcloud not installed. Install Google Cloud SDK")
            return False
        except Exception as e:
            logger.error(f"X - Error testing gcloud: {e}")
            return False
    
    def generate_voice_sample(self, voice_name: str, voice_number: int) -> bool:
        """
        Generate an audio sample for a specific voice.
        
        Args:
            voice_name (str): The Chirp3 voice name
            voice_number (int): The voice number (1-5)
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            filename = f"voice_sample_{voice_number}_{voice_name.split('-')[-1]}.mp3"
            filepath = os.path.join(self.voice_samples_folder, filename)
            
            # Check if file already exists
            if os.path.exists(filepath):
                logger.info(f"Voice sample already exists: {filename}")
                return True
            
            # Get project ID
            project_result = subprocess.run(['gcloud', 'config', 'list', '--format=value(core.project)'], 
                                          capture_output=True, text=True, timeout=10)
            if project_result.returncode != 0:
                logger.error("Failed to get project ID")
                return False
            
            project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
            
            # Prepare the request payload
            payload = {
                "input": {
                    "text": self.sample_text
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
                
                logger.info(f"Generated voice sample: {filename}")
                return True
            else:
                logger.error(f"API request failed for {voice_name}: {response.status_code} - {response.text}")
                return False
            
        except Exception as e:
            logger.error(f"Error generating voice sample for {voice_name}: {e}")
            return False
    
    def generate_all_samples(self) -> Dict[str, Any]:
        """
        Generate audio samples for all recommended voices.
        
        Returns:
            Dict[str, Any]: Statistics about the sample generation
        """
        logger.info("Generating voice samples for all recommended US English male voices...")
        
        stats = {
            "total_voices": len(self.recommended_voices),
            "successful_samples": 0,
            "failed_samples": 0,
            "processing_time": 0
        }
        
        start_time = time.time()
        
        for voice_number, voice_info in self.recommended_voices.items():
            logger.info(f"Generating sample for Voice {voice_number}: {voice_info['name']}")
            
            if self.generate_voice_sample(voice_info['name'], voice_number):
                stats["successful_samples"] += 1
            else:
                stats["failed_samples"] += 1
            
            # Add delay between requests
            time.sleep(2)
        
        stats["processing_time"] = time.time() - start_time
        
        return stats
    
    def display_voice_options(self):
        """
        Display all voice options with descriptions.
        """
        print("\n" + "="*80)
        print("US ENGLISH MALE CHIRP3 VOICE OPTIONS")
        print("="*80)
        
        for voice_number, voice_info in self.recommended_voices.items():
            print(f"\n{voice_number}. {voice_info['name']}")
            print(f"   Description: {voice_info['description']}")
            print(f"   Characteristics: {voice_info['characteristics']}")
            if os.path.exists(os.path.join(self.voice_samples_folder, f"voice_sample_{voice_number}_{voice_info['name'].split('-')[-1]}.mp3")):
                print(f"   Sample File: voice_samples/voice_sample_{voice_number}_{voice_info['name'].split('-')[-1]}.mp3 (Available)")
            else:
                print(f"   Sample File: voice_samples/voice_sample_{voice_number}_{voice_info['name'].split('-')[-1]}.mp3 (Not generated)")
        
        print("\n" + "="*80)
        print("INSTRUCTIONS:")
        print("1. If samples are available, listen to them in the 'voice_samples' folder")
        print("2. Choose your preferred voice (1-5)")
        print("3. Use that voice number in your audio generation script")
        print("4. If no samples are available, you can still select a voice based on descriptions")
        print("="*80)
    
    def get_user_selection(self) -> int:
        """
        Get user's voice selection.
        
        Returns:
            int: Selected voice number (1-5)
        """
        while True:
            try:
                selection = input("\nEnter your voice choice (1-5): ").strip()
                voice_number = int(selection)
                
                if voice_number in self.recommended_voices:
                    selected_voice = self.recommended_voices[voice_number]
                    print(f"\nOK - You selected: {selected_voice['name']}")
                    print(f"   Description: {selected_voice['description']}")
                    return voice_number
                else:
                    print("X - Invalid choice. Please enter a number between 1 and 5.")
                    
            except ValueError:
                print("X - Invalid input. Please enter a number between 1 and 5.")
            except KeyboardInterrupt:
                print("\n\nExiting...")
                exit(0)
    
    def print_summary(self, stats: Dict[str, Any]):
        """
        Print a summary of the voice sample generation.
        
        Args:
            stats (Dict[str, Any]): Generation statistics
        """
        print("\n" + "="*60)
        print("VOICE SAMPLE GENERATION SUMMARY")
        print("="*60)
        print(f"Total Voices: {stats['total_voices']}")
        print(f"Successful Samples: {stats['successful_samples']}")
        print(f"Failed Samples: {stats['failed_samples']}")
        print(f"Processing Time: {stats['processing_time']:.2f} seconds")
        print(f"Sample Files Saved in: {self.voice_samples_folder}/")
        print("="*60)

def main():
    """
    Main function to run the voice selection process.
    """
    try:
        logger.info("="*60)
        logger.info("VOICE SELECTION SCRIPT STARTED")
        logger.info("="*60)
        
        # Initialize the voice selector
        selector = VoiceSelector()
        
        # Test gcloud availability
        gcloud_available = selector.test_gcloud_availability()
        
        if gcloud_available:
            # Generate all voice samples
            stats = selector.generate_all_samples()
            
            # Print summary
            selector.print_summary(stats)
        else:
            print("\n" + "="*60)
            print("GCLOUD NOT AVAILABLE")
            print("="*60)
            print("Google Cloud SDK is not installed or configured.")
            print("You can still select a voice based on descriptions.")
            print("To install Google Cloud SDK:")
            print("1. Download from: https://cloud.google.com/sdk/docs/install")
            print("2. Run: gcloud auth login")
            print("3. Run: gcloud config set project YOUR_PROJECT_ID")
            print("="*60)
        
        # Display voice options
        selector.display_voice_options()
        
        # Get user selection
        selected_voice = selector.get_user_selection()
        
        # Save selection to file
        with open("selected_voice.json", "w") as f:
            json.dump({
                "selected_voice_number": selected_voice,
                "voice_info": selector.recommended_voices[selected_voice]
            }, f, indent=2)
        
        print(f"\nOK - Voice selection saved to 'selected_voice.json'")
        print(f"   You can now use voice number {selected_voice} in your audio generation script.")
        
        if not gcloud_available:
            print(f"\nNOTE: To use the selected voice, you'll need to:")
            print(f"1. Install Google Cloud SDK")
            print(f"2. Configure authentication")
            print(f"3. Run the voice selection script again to generate samples")
        
        logger.info("Voice selection process completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main process: {e}")
        raise

if __name__ == "__main__":
    main() 