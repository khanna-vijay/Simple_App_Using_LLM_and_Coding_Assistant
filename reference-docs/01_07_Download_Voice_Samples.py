#!/usr/bin/env python3
"""
01_07_Download_Voice_Samples.py

This script downloads voice samples for the 3 recommended US English Chirp3 HD voices
using the sentence "Hello World. I am Vijay".

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
        logging.FileHandler('voice_samples_download.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class VoiceSampleDownloader:
    def __init__(self):
        """
        Initialize the VoiceSampleDownloader with recommended US English Chirp3 HD voices.
        """
        self.voice_samples_folder = "voice_samples"
        
        # Create voice samples folder if it doesn't exist
        if not os.path.exists(self.voice_samples_folder):
            os.makedirs(self.voice_samples_folder)
            logger.info(f"Created voice samples folder: {self.voice_samples_folder}")
        
        # Recommended US English Chirp3 voices (newer HD models)
        self.recommended_voices = {
            1: {
                "name": "en-US-Chirp3-HD-Umbriel",
                "description": "Confident, engaging voice with good pacing",
                "characteristics": "Confident, engaging, well-paced"
            },
            2: {
                "name": "en-US-Chirp3-HD-Iapetus",
                "description": "Deep, authoritative voice with excellent clarity",
                "characteristics": "Professional, clear, authoritative"
            },
            3: {
                "name": "en-US-Chirp3-HD-Puck",
                "description": "Professional voice with excellent clarity",
                "characteristics": "Professional, clear, authoritative"
            }
        }
        
        # Commented out other voices for now
        # 4: {
        #     "name": "en-US-Chirp3-HD-Algenib",
        #     "description": "Clear, articulate voice with excellent pronunciation",
        #     "characteristics": "Clear, articulate, educational"
        # },
        # 5: {
        #     "name": "en-US-Chirp3-HD-Alnilam", 
        #     "description": "Warm, friendly voice with natural intonation",
        #     "characteristics": "Friendly, warm, conversational"
        # },
        # 6: {
        #     "name": "en-US-Chirp3-HD-Orus",
        #     "description": "Smooth, professional voice with balanced tone",
        #     "characteristics": "Professional, smooth, balanced"
        # },
        # 7: {
        #     "name": "en-US-Chirp3-HD-Sadaltager",
        #     "description": "Clear, articulate voice with precise pronunciation",
        #     "characteristics": "Clear, articulate, educational"
        # },
        # 8: {
        #     "name": "en-US-Chirp3-HD-Algieba",
        #     "description": "Warm, friendly voice with natural flow",
        #     "characteristics": "Friendly, warm, conversational"
        # }
        
        # Custom test text
        self.sample_text = "Hello World, I am Vijay. Nice to Meet you. \"Abase\" is pronounced as \"uh-BAYS\". \"Aberration\" is pronounced as \"ab-uh-RAY-shun\". \"Affidavit\" is pronounced as \"af-uh-DAY-vit\"."
    
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
    
    def test_gcloud_availability(self) -> bool:
        """
        Test if gcloud is available and configured.
        
        Returns:
            bool: True if gcloud is available, False otherwise
        """
        gcloud_path = self.find_gcloud()
        if not gcloud_path:
            logger.error("X - gcloud not found in common locations")
            return False
        
        try:
            result = subprocess.run([gcloud_path, 'config', 'list'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                logger.info("OK - gcloud is available and configured")
                self.gcloud_path = gcloud_path
                return True
            else:
                logger.error("X - gcloud not configured. Run: gcloud auth login")
                return False
        except Exception as e:
            logger.error(f"X - Error testing gcloud: {e}")
            return False
    
    def download_voice_sample(self, voice_name: str, voice_number: int) -> bool:
        """
        Download an audio sample for a specific voice.
        
        Args:
            voice_name (str): The Chirp3 HD voice name
            voice_number (int): The voice number (1-3)
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            filename = f"voice_sample_{voice_number}_{voice_name.split('-')[-1]}_vijay.mp3"
            filepath = os.path.join(self.voice_samples_folder, filename)
            
            # Check if file already exists
            if os.path.exists(filepath):
                logger.info(f"Voice sample already exists: {filename}")
                return True
            
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
                
                logger.info(f"Downloaded voice sample: {filename}")
                return True
            else:
                logger.error(f"API request failed for {voice_name}: {response.status_code} - {response.text}")
                return False
            
        except Exception as e:
            logger.error(f"Error downloading voice sample for {voice_name}: {e}")
            return False
    
    def download_all_samples(self) -> Dict[str, Any]:
        """
        Download audio samples for all recommended voices.
        
        Returns:
            Dict[str, Any]: Statistics about the download process
        """
        logger.info("Downloading voice samples for all recommended US English Chirp3 HD voices...")
        logger.info(f"Sample text: '{self.sample_text}'")
        
        stats = {
            "total_voices": len(self.recommended_voices),
            "successful_downloads": 0,
            "failed_downloads": 0,
            "processing_time": 0
        }
        
        start_time = time.time()
        
        for voice_number, voice_info in self.recommended_voices.items():
            logger.info(f"Downloading sample for Voice {voice_number}: {voice_info['name']}")
            
            if self.download_voice_sample(voice_info['name'], voice_number):
                stats["successful_downloads"] += 1
            else:
                stats["failed_downloads"] += 1
            
            # Add delay between requests
            time.sleep(2)
        
        stats["processing_time"] = time.time() - start_time
        
        return stats
    
    def display_download_summary(self):
        """
        Display summary of downloaded files.
        """
        print("\n" + "="*80)
        print("DOWNLOADED VOICE SAMPLES")
        print("="*80)
        print(f"Sample Text: '{self.sample_text}'")
        print(f"Files saved in: {self.voice_samples_folder}/")
        print("\nDownloaded files:")
        
        for voice_number, voice_info in self.recommended_voices.items():
            filename = f"voice_sample_{voice_number}_{voice_info['name'].split('-')[-1]}_vijay.mp3"
            filepath = os.path.join(self.voice_samples_folder, filename)
            
            if os.path.exists(filepath):
                file_size = os.path.getsize(filepath)
                print(f"✓ {filename} ({file_size} bytes)")
            else:
                print(f"✗ {filename} (Failed to download)")
        
        print("\n" + "="*80)
        print("INSTRUCTIONS:")
        print("1. Listen to each sample file to compare the voices")
        print("2. Choose your preferred voice based on the samples")
        print("3. Use the voice selection script to save your choice")
        print("="*80)
    
    def print_summary(self, stats: Dict[str, Any]):
        """
        Print a summary of the download process.
        
        Args:
            stats (Dict[str, Any]): Download statistics
        """
        print("\n" + "="*60)
        print("VOICE SAMPLE DOWNLOAD SUMMARY")
        print("="*60)
        print(f"Sample Text: '{self.sample_text}'")
        print(f"Total Voices: {stats['total_voices']}")
        print(f"Successful Downloads: {stats['successful_downloads']}")
        print(f"Failed Downloads: {stats['failed_downloads']}")
        print(f"Processing Time: {stats['processing_time']:.2f} seconds")
        print(f"Sample Files Saved in: {self.voice_samples_folder}/")
        print("="*60)

def main():
    """
    Main function to run the voice sample download process.
    """
    try:
        logger.info("="*60)
        logger.info("VOICE SAMPLE DOWNLOAD SCRIPT STARTED")
        logger.info("="*60)
        
        # Initialize the downloader
        downloader = VoiceSampleDownloader()
        
        # Test gcloud availability
        if not downloader.test_gcloud_availability():
            logger.error("gcloud is not available. Please install and configure Google Cloud SDK.")
            print("\n" + "="*60)
            print("GCLOUD NOT AVAILABLE")
            print("="*60)
            print("To download voice samples, you need to:")
            print("1. Install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install")
            print("2. Run: gcloud auth login")
            print("3. Run: gcloud config set project YOUR_PROJECT_ID")
            print("4. Run this script again")
            print("="*60)
            return
        
        # Download all voice samples
        stats = downloader.download_all_samples()
        
        # Print summary
        downloader.print_summary(stats)
        
        # Display download summary
        downloader.display_download_summary()
        
        logger.info("Voice sample download process completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main process: {e}")
        raise

if __name__ == "__main__":
    main() 