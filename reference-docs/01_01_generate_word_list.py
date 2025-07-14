"""
English Vocabulary Generator using Google Gemini AI

This script generates a comprehensive English vocabulary list organized by alphabet letters.
It uses Google's Gemini AI to generate 100 intermediate to advanced English words for each
letter of the alphabet, suitable for SAT and GRE preparation.

The script includes:
- Word definitions with multiple meanings
- Example sentences for each definition
- Synonyms and antonyms
- Pronunciation guides (US and UK)
- Word origins and etymology
- Verb forms for verbs
- Word roots and their meanings

Author: [Vijay Khanna]
Date: [11 July 2025]
"""

import json
import string
import os
import time
import logging
from datetime import datetime
from google import genai
from google.genai import types


# Configure logging
def setup_logging():
    """
    Set up comprehensive logging configuration for the script.
    
    Returns:
        logging.Logger: Configured logger instance
    """
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Create a unique log filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_filename = f"logs/vocabulary_generator_{timestamp}.log"
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_filename, encoding='utf-8'),
            logging.StreamHandler()  # Also log to console
        ]
    )
    
    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized. Log file: {log_filename}")
    return logger


def calculate_word_statistics(word_batch, letter, logger=None):
    """
    Calculate statistics for a batch of words after receiving them from Gemini LLM.
    
    Args:
        word_batch (dict): Dictionary of words and their details from Gemini
        letter (str): The letter these words start with
        logger (logging.Logger, optional): Logger instance for logging statistics
    
    Returns:
        dict: Statistics including total words, complexity distribution, etc.
    """
    if not word_batch:
        return {
            "total_words": 0,
            "complexity_distribution": {},
            "word_length_stats": {},
            "part_of_speech_distribution": {}
        }
    
    # Calculate basic statistics
    total_words = len(word_batch)
    complexity_dist = {}
    word_length_stats = {}
    pos_distribution = {}
    
    for word, word_data in word_batch.items():
        # Complexity distribution - ensure proper categorization
        complexity = word_data.get("complexity", "Unknown")
        if complexity not in ["Intermediate", "Advanced"]:
            # Default to Intermediate for unknown complexity
            complexity = "Intermediate"
            if logger:
                logger.warning(f"Unknown complexity for word '{word}', defaulting to 'Intermediate'")
        
        complexity_dist[complexity] = complexity_dist.get(complexity, 0) + 1
        
        # Word length statistics
        word_length = len(word)
        word_length_stats[word_length] = word_length_stats.get(word_length, 0) + 1
        
        # Part of speech distribution (if available)
        if "meanings" in word_data and word_data["meanings"]:
            for meaning in word_data["meanings"]:
                pos = meaning.get("part_of_speech", "Unknown")
                pos_distribution[pos] = pos_distribution.get(pos, 0) + 1
    
    # Log complexity distribution for debugging
    if logger:
        logger.info(f"Complexity distribution for letter {letter}: {complexity_dist}")
    
    return {
        "total_words": total_words,
        "complexity_distribution": complexity_dist,
        "word_length_stats": word_length_stats,
        "part_of_speech_distribution": pos_distribution
    }


def get_words_for_alphabet_with_retry(letter, logger, max_retries=3, base_delay=2):
    """
    Calls the Gemini LLM to get 100 Intermediate to Advanced English words for a 
    specific alphabet letter with retry logic and backoff.
    
    Args:
        letter (str): A single letter of the alphabet (A-Z)
        logger (logging.Logger): Logger instance for detailed logging
        max_retries (int): Maximum number of retry attempts
        base_delay (int): Base delay in seconds for exponential backoff
    
    Returns:
        dict: A dictionary containing words and their detailed information, or None if error
    """
    logger.info(f"Starting word generation for letter: {letter}")
    
    for attempt in range(max_retries + 1):
        try:
            logger.info(f"Attempt {attempt + 1}/{max_retries + 1} for letter {letter}")
            
            # Initialize the Google Gemini AI client
            # Note: You need to have proper authentication set up (service account key or API key)
            client = genai.Client(
                vertexai=True,
                project=os.environ.get("GOOGLE_CLOUD_PROJECT"),  # Replaced hardcoded project ID
                location="global",
            )

            # Use the same model as the sample file (newer version)
            model = "gemini-2.5-pro"
            
            # Create a detailed prompt that instructs the AI to generate comprehensive word data
            # The prompt includes an example to show the expected JSON structure
            prompt = f"""
            Please provide a list of 100 intermediate to Advanced English words starting with 
            the letter '{letter.upper()}', suitable for SAT and GRE preparation. For each word, 
            provide its definition and an example sentence. 
            The output MUST be a valid JSON object where each key is the word and the value 
            is an object with simplified structure.

            IMPORTANT: For the "complexity" field, choose either "Intermediate" or "Advanced":
            - "Intermediate": Words that are moderately difficult, suitable for high school to early college level
            - "Advanced": Words that are very difficult, suitable for college level and above (SAT/GRE level)

            Do not include any text or formatting before or after the JSON object.

            Example for the letter 'A':
            {{
              "Abnegation": {{
                "complexity": "Intermediate",
                "definition": "The act of renouncing or rejecting something desired or valuable.",
                "example": "Her abnegation of rich food was an act of solidarity with the poor."
              }},
              "Acquiesce": {{
                "complexity": "Advanced",
                "definition": "To accept something reluctantly but without protest.",
                "example": "While I did not want to go to the party, I had to acquiesce because my friend insisted."
              }}
            }}
            """
            
            # Prepare the content for the AI model (same structure as sample)
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=prompt)]
                ),
            ]

            # Configure the AI model parameters using the same approach as sample file
            # This includes safety settings and thinking configuration for better results
            generate_content_config = types.GenerateContentConfig(
                temperature=0.5,  # Moderate creativity for better word variety
                top_p=0.95,       # High diversity in word selection
                seed=0,           # Deterministic results for consistency
                max_output_tokens=65535,  # Large response size for comprehensive word data
                response_mime_type="application/json",  # Request JSON directly
                # Safety settings (same as sample file)
                safety_settings=[
                    types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="OFF"
                    ),
                    types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="OFF"
                    ),
                    types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="OFF"
                    ),
                    types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="OFF"
                    )
                ],
                # Thinking configuration for better reasoning (same as sample file)
                thinking_config=types.ThinkingConfig(
                    thinking_budget=-1,
                ),
            )

            logger.info(f"Making API call to Gemini for letter {letter}")
            
            # Use streaming response like the sample file for better handling
            full_response = ""
            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=generate_content_config,
            ):
                if (not chunk.candidates or 
                    not chunk.candidates[0].content or 
                    not chunk.candidates[0].content.parts):
                    continue
                full_response += chunk.text
            
            logger.info(f"Received response for letter {letter}, length: {len(full_response)} characters")
            
            # Clean up the response text to ensure it's valid JSON
            # Remove any markdown formatting that might be included
            json_text = full_response.strip().replace("```json", "").replace("```", "")
            
            # Parse the JSON response and return the word data
            word_data = json.loads(json_text)
            
            # Validate the response structure
            if not isinstance(word_data, dict):
                raise ValueError(f"Expected dictionary response, got {type(word_data)}")
            
            # Validate and fix complexity classifications
            complexity_fixes = 0
            for word, word_info in word_data.items():
                if "complexity" not in word_info or word_info["complexity"] not in ["Intermediate", "Advanced"]:
                    # Default to Intermediate if complexity is missing or invalid
                    word_info["complexity"] = "Intermediate"
                    complexity_fixes += 1
            
            if complexity_fixes > 0:
                logger.warning(f"Fixed {complexity_fixes} invalid complexity classifications for letter {letter}")
            
            word_count = len(word_data)
            logger.info(f"Successfully parsed {word_count} words for letter {letter}")
            
            # Log some sample words for verification
            sample_words = list(word_data.keys())[:3]
            logger.info(f"Sample words for letter {letter}: {sample_words}")
            
            return word_data

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error for letter {letter} (attempt {attempt + 1}): {e}")
            logger.error(f"Raw response length: {len(full_response) if 'full_response' in locals() else 0}")
            if attempt < max_retries:
                delay = base_delay * (2 ** attempt)  # Exponential backoff
                logger.info(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                logger.error(f"Failed to parse JSON after {max_retries + 1} attempts for letter {letter}")
                return None
                
        except Exception as e:
            logger.error(f"API error for letter {letter} (attempt {attempt + 1}): {e}")
            if attempt < max_retries:
                delay = base_delay * (2 ** attempt)  # Exponential backoff
                logger.info(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                logger.error(f"Failed after {max_retries + 1} attempts for letter {letter}")
                return None
    
    return None


def main():
    """
    Main function to generate the complete English vocabulary list.
    
    This function:
    1. Sets up comprehensive logging
    2. Loads existing data if available (for resuming interrupted runs)
    3. Iterates through each letter of the alphabet (A-Z)
    4. Calls the AI to generate words for each letter with retry logic
    5. Calculates statistics after receiving words from Gemini
    6. Saves the data incrementally to avoid losing progress
    7. Handles errors gracefully and provides progress updates
    8. Adds 2-second delay between API calls
    """
    # Set up logging
    logger = setup_logging()
    logger.info("Starting English Vocabulary Generator")
    
    # Output file name for the complete vocabulary database
    output_filename = "99_01_English_Words.json"
    all_words = {}

    # Load existing data if the file exists
    # This allows the script to resume from where it left off if interrupted
    if os.path.exists(output_filename):
        logger.info(f"Found existing file: {output_filename}")
        try:
            with open(output_filename, 'r', encoding='utf-8') as f:
                all_words = json.load(f)
                logger.info(f"Successfully loaded existing words from {output_filename}")
                
                # Update existing data to include statistics structure if missing
                updated_count = 0
                for letter, letter_data in all_words.items():
                    if "statistics" not in letter_data:
                        # Calculate statistics for existing data
                        word_batch = letter_data.get("words", {})
                        statistics = calculate_word_statistics(word_batch, letter, logger)
                        letter_data["statistics"] = statistics
                        updated_count += 1
                
                if updated_count > 0:
                    logger.info(f"Updated {updated_count} letters with statistics structure")
                
                completed_count = sum(1 for l in all_words.values() 
                                   if l.get('statistics', {}).get('total_words', 0) > 0)
                logger.info(f"Current progress: {completed_count} letters completed")
        except json.JSONDecodeError as e:
            logger.error(f"Warning: {output_filename} is corrupted or empty. Error: {e}")
            logger.info("Starting fresh with empty dictionary.")
            all_words = {}
        except Exception as e:
            logger.error(f"Error reading existing file: {e}")
            logger.info("Starting fresh with empty dictionary.")
            all_words = {}

    # Initialize the structure for all letters (A-Z)
    for letter in string.ascii_uppercase:
        if letter not in all_words:
            all_words[letter] = {
                "letter": letter,
                "description": f"Words starting with letter {letter}",
                "words": {},
                "statistics": {
                    "total_words": 0,
                    "complexity_distribution": {},
                    "word_length_stats": {},
                    "part_of_speech_distribution": {}
                }
            }
        elif "statistics" not in all_words[letter]:
            # Ensure existing letters have statistics structure
            word_batch = all_words[letter].get("words", {})
            statistics = calculate_word_statistics(word_batch, letter, logger)
            all_words[letter]["statistics"] = statistics

    # Iterate through each letter of the alphabet (A-Z)
    # string.ascii_uppercase provides 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for i, letter in enumerate(string.ascii_uppercase):
        logger.info(f"{'='*50}")
        logger.info(f"Processing letter: {letter} ({i+1}/26)")
        logger.info(f"{'='*50}")
        
        # Skip letters that have already been processed (have words)
        total_words = all_words[letter]["statistics"]["total_words"]
        if total_words > 0:
            logger.info(f"Skipping letter '{letter}' as it already has {total_words} words.")
            continue

        # Generate words for the current letter using the AI with retry logic
        word_batch = get_words_for_alphabet_with_retry(letter, logger)

        if word_batch:
            # Update the letter's words dictionary
            all_words[letter]["words"] = word_batch
            
            # Calculate statistics after receiving words from Gemini
            logger.info("Calculating word statistics...")
            statistics = calculate_word_statistics(word_batch, letter, logger)
            all_words[letter]["statistics"] = statistics
            
            # Log detailed statistics
            logger.info(f"✓ Successfully generated words for letter '{letter}'")
            logger.info(f"  Total words: {statistics['total_words']}")
            logger.info(f"  Complexity distribution: {statistics['complexity_distribution']}")
            logger.info(f"  Word length stats: {statistics['word_length_stats']}")
            if statistics['part_of_speech_distribution']:
                logger.info(f"  Part of speech distribution: {statistics['part_of_speech_distribution']}")
            
            # Save checkpoint after each letter to avoid losing progress
            try:
                with open(output_filename, 'w', encoding='utf-8') as f:
                    json.dump(all_words, f, indent=2, ensure_ascii=False)
                
                completed_count = sum(1 for l in all_words.values() 
                                   if l['statistics']['total_words'] > 0)
                logger.info(f"  Total progress: {completed_count}/26 letters completed")
                logger.info(f"  ✓ Saved to {output_filename}")
            except Exception as e:
                logger.error(f"❌ Error saving data to {output_filename}: {e}")
                logger.error("Stopping execution to prevent data loss.")
                break  # Stop execution if we can't save
        else:
            logger.error(f"❌ Failed to generate words for letter '{letter}' after all retry attempts")
            logger.info("Continuing with next letter...")

        # Add 2-second delay between API calls (except for the last letter)
        if i < len(string.ascii_uppercase) - 1:
            logger.info("Waiting 2 seconds before next API call...")
            time.sleep(2)

    # Final summary
    logger.info(f"{'='*50}")
    logger.info("PROCESS COMPLETE")
    logger.info(f"{'='*50}")
    
    completed_letters = sum(1 for letter_data in all_words.values() 
                           if letter_data['statistics']['total_words'] > 0)
    total_words_generated = sum(letter_data['statistics']['total_words'] 
                               for letter_data in all_words.values())
    
    logger.info(f"Total letters processed: {completed_letters}/26")
    logger.info(f"Total words generated: {total_words_generated}")
    logger.info(f"Output file: {output_filename}")
    
    # Log detailed summary by letter
    logger.info("Detailed Summary by letter:")
    for letter, data in all_words.items():
        if data['statistics']['total_words'] > 0:
            stats = data['statistics']
            logger.info(f"  {letter}: {stats['total_words']} words")
            logger.info(f"    Complexity: {stats['complexity_distribution']}")
            logger.info(f"    Word lengths: {stats['word_length_stats']}")
            if stats['part_of_speech_distribution']:
                logger.info(f"    Parts of speech: {stats['part_of_speech_distribution']}")
    
    logger.info("The vocabulary database is ready for use!")


if __name__ == "__main__":
    # Entry point of the script
    print("English Vocabulary Generator")
    print("Using Google Gemini AI to generate comprehensive word lists")
    print("This may take a while depending on your internet connection and API limits.")
    print("Logs will be saved in the 'logs' directory.")
    print()
    
    main()

