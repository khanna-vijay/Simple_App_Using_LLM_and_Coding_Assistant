"""
Detailed English Dictionary Generator using Google Gemini AI

This script reads words from the existing JSON file (99_01_English_Words.json) and fetches
detailed information for each word from Google's Gemini AI. It then saves the comprehensive
data in a new JSON file (99_02_comprehensive_english_dict.json) with detailed statistics.

The script includes:
- Reading existing word data from 99_01_English_Words.json
- Fetching detailed information for each word from Gemini 2.5 Pro
- Comprehensive word details including pronunciation, meanings, synonyms, antonyms
- Word origins, etymology, and verb forms
- Statistics for each alphabet letter
- Progress tracking and error handling

Author: [Vijay Khanna]
Date: [11 July 2025]
"""

import json
import string
import os
import time
import logging
import random
from google import genai
from google.genai import types


def calculate_detailed_statistics(word_batch, letter):
    """
    Calculate comprehensive statistics for a batch of words with detailed information.
    
    Args:
        word_batch (dict): Dictionary of words and their detailed information
        letter (str): The letter these words start with
    
    Returns:
        dict: Comprehensive statistics including complexity, part of speech, etc.
    """
    if not word_batch:
        return {
            "total_words": 0,
            "complexity_distribution": {},
            "word_length_stats": {},
            "part_of_speech_distribution": {},
            "pronunciation_stats": {},
            "origin_stats": {},
            "phonetic_stats": {},
            "ssml_stats": {}
        }
    
    # Calculate comprehensive statistics
    total_words = len(word_batch)
    complexity_dist = {}
    word_length_stats = {}
    pos_distribution = {}
    pronunciation_stats = {"has_pronunciation": 0, "no_pronunciation": 0}
    origin_stats = {"has_origin": 0, "no_origin": 0}
    phonetic_stats = {"has_phonetic_respelling": 0, "no_phonetic_respelling": 0}
    ssml_stats = {"has_ssml_phoneme": 0, "no_ssml_phoneme": 0}
    
    for word, word_data in word_batch.items():
        # Complexity distribution - ensure proper categorization
        complexity = word_data.get("complexity", "Unknown")
        if complexity not in ["Intermediate", "Advanced"]:
            # Default to Intermediate for unknown complexity
            complexity = "Intermediate"
            logging.warning(f"Unknown complexity for word '{word}', defaulting to 'Intermediate'")
        
        complexity_dist[complexity] = complexity_dist.get(complexity, 0) + 1
        
        # Word length statistics
        word_length = len(word)
        word_length_stats[word_length] = word_length_stats.get(word_length, 0) + 1
        
        # Part of speech distribution
        if "meanings" in word_data and word_data["meanings"]:
            for meaning in word_data["meanings"]:
                pos = meaning.get("part_of_speech", "Unknown")
                pos_distribution[pos] = pos_distribution.get(pos, 0) + 1
        
        # Pronunciation statistics
        if "pronunciation" in word_data and word_data["pronunciation"]:
            pronunciation_stats["has_pronunciation"] += 1
        else:
            pronunciation_stats["no_pronunciation"] += 1
        
        # Origin statistics
        if "word_origin" in word_data and word_data["word_origin"]:
            origin_stats["has_origin"] += 1
        else:
            origin_stats["no_origin"] += 1
        
        # Phonetic respelling statistics
        if "phonetic_respelling" in word_data and word_data["phonetic_respelling"]:
            phonetic_stats["has_phonetic_respelling"] += 1
        else:
            phonetic_stats["no_phonetic_respelling"] += 1
        
        # SSML phoneme statistics
        if "ssml_phoneme" in word_data and word_data["ssml_phoneme"]:
            ssml_stats["has_ssml_phoneme"] += 1
        else:
            ssml_stats["no_ssml_phoneme"] += 1
    
    # Log complexity distribution for debugging
    logging.info(f"Complexity distribution for letter {letter}: {complexity_dist}")
    
    return {
        "total_words": total_words,
        "complexity_distribution": complexity_dist,
        "word_length_stats": word_length_stats,
        "part_of_speech_distribution": pos_distribution,
        "pronunciation_stats": pronunciation_stats,
        "origin_stats": origin_stats,
        "phonetic_stats": phonetic_stats,
        "ssml_stats": ssml_stats
    }


def get_detailed_word_info(word, letter, max_retries=3, base_delay=5):
    """
    Calls the Gemini LLM to get detailed information for a specific word with retry logic.
    
    Args:
        word (str): The word to get detailed information for
        letter (str): The letter this word starts with
        max_retries (int): Maximum number of retry attempts
        base_delay (int): Base delay in seconds between retries
    
    Returns:
        dict: Detailed word information in the format matching 00_Final_JSON.json, or None if error
    """
    logging.info(f"Fetching detailed info for word: {word}")
    print(f"Fetching detailed info for word: {word}")
    
    for attempt in range(max_retries + 1):
        try:
            # Initialize the Google Gemini AI client
            client = genai.Client(
                vertexai=True,
                project=os.environ.get("GOOGLE_CLOUD_PROJECT"),  # Replaced hardcoded project ID
                location="global",
            )

            # Use the same model as the sample file
            model = "gemini-2.5-pro"
            
            # Create a detailed prompt that instructs the AI to generate comprehensive word data
            prompt = f"""
            Please provide detailed information for the English word '{word}' starting with letter '{letter.upper()}'.
            The output MUST be a valid JSON object with the following structure:

            {{
              "complexity": "Intermediate" or "Advanced",
              "pronunciation": {{
                "General_American_GA_pronunciation_us": "/pronunciation/",
                "The_International_Phonetic_Alphabet_ipa_uk": "/pronunciation/"
              }},
              "phonetic_respelling": "uh-bate",
              "ssml_phoneme": "ph=\\"əˈbeɪt\\"",
              "meanings": [
                {{
                  "part_of_speech": "Noun/Verb/Adjective/Adverb",
                  "definitions": [
                    {{
                      "definition": "Clear definition of the word",
                      "example": "Example sentence using the word",
                      "synonyms": ["synonym1", "synonym2", "synonym3"],
                      "antonyms": ["antonym1", "antonym2", "antonym3"]
                    }}
                  ],
                  "verb_forms": {{
                    "infinitive": "to word",
                    "present_participle": "wording",
                    "past_participle": "worded"
                  }}
                }}
              ],
              "word_origin": "Etymology and origin of the word",
              "word_roots": [
                {{
                  "root": "root_word",
                  "meaning": "meaning of the root"
                }}
              ]
            }}

            IMPORTANT: For the "complexity" field, choose either "Intermediate" or "Advanced" based on the word's difficulty level:
            - "Intermediate": Words that are moderately difficult, suitable for high school to early college level
            - "Advanced": Words that are very difficult, suitable for college level and above (SAT/GRE level)

            IMPORTANT: For pronunciation fields:
            - "phonetic_respelling": Provide a simple phonetic respelling using common English sounds (e.g., "uh-bate" for "abate")
            - "ssml_phoneme": Provide the SSML phoneme tag with IPA pronunciation (e.g., ph=\\"əˈbeɪt\\" for "abate")

            If the word is not a verb, omit the "verb_forms" section.
            Provide accurate pronunciation, etymology, and comprehensive definitions.
            Do not include any text before or after the JSON object.
            """
            
            # Prepare the content for the AI model
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=prompt)]
                ),
            ]

            # Configure the AI model parameters
            generate_content_config = types.GenerateContentConfig(
                temperature=0.3,  # Lower temperature for more accurate information
                top_p=0.9,
                seed=0,
                max_output_tokens=8192,  # Sufficient for detailed word information
                response_mime_type="application/json",
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
                thinking_config=types.ThinkingConfig(
                    thinking_budget=-1,
                ),
            )

            # Use streaming response for better handling
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
            
            # Clean up the response text to ensure it's valid JSON
            json_text = full_response.strip().replace("```json", "").replace("```", "")
            
            # Parse the JSON response and return the word data
            result = json.loads(json_text)
            
            # Validate and ensure complexity field is properly set
            if "complexity" not in result or result["complexity"] not in ["Intermediate", "Advanced"]:
                # Default to Intermediate if complexity is missing or invalid
                result["complexity"] = "Intermediate"
                logging.warning(f"Invalid complexity for word '{word}', defaulting to 'Intermediate'")
            
            # Validate and ensure phonetic respelling field is properly set
            if "phonetic_respelling" not in result or not result["phonetic_respelling"]:
                # Default to empty string if phonetic respelling is missing
                result["phonetic_respelling"] = ""
                logging.warning(f"Missing phonetic respelling for word '{word}', setting to empty")
            
            # Validate and ensure SSML phoneme field is properly set
            if "ssml_phoneme" not in result or not result["ssml_phoneme"]:
                # Default to empty string if SSML phoneme is missing
                result["ssml_phoneme"] = ""
                logging.warning(f"Missing SSML phoneme for word '{word}', setting to empty")
            
            logging.info(f"Successfully processed word: {word} (complexity: {result['complexity']}, phonetic: {result.get('phonetic_respelling', 'N/A')}, ssml: {result.get('ssml_phoneme', 'N/A')})")
            return result

        except json.JSONDecodeError as e:
            logging.error(f"JSON parsing error for word {word} (attempt {attempt + 1}/{max_retries + 1}): {e}")
            print(f"JSON parsing error for word {word} (attempt {attempt + 1}/{max_retries + 1}): {e}")
            if attempt < max_retries:
                delay = base_delay * (2 ** attempt) + random.uniform(0, 1)  # Exponential backoff with jitter
                logging.info(f"Retrying in {delay:.1f} seconds...")
                print(f"Retrying in {delay:.1f} seconds...")
                time.sleep(delay)
            else:
                logging.error(f"Failed to process word {word} after {max_retries + 1} attempts")
                print(f"Failed to process word {word} after {max_retries + 1} attempts")
                return None
                
        except Exception as e:
            logging.error(f"API error for word {word} (attempt {attempt + 1}/{max_retries + 1}): {e}")
            print(f"API error for word {word} (attempt {attempt + 1}/{max_retries + 1}): {e}")
            if attempt < max_retries:
                delay = base_delay * (2 ** attempt) + random.uniform(0, 1)  # Exponential backoff with jitter
                logging.info(f"Retrying in {delay:.1f} seconds...")
                print(f"Retrying in {delay:.1f} seconds...")
                time.sleep(delay)
            else:
                logging.error(f"Failed to process word {word} after {max_retries + 1} attempts")
                print(f"Failed to process word {word} after {max_retries + 1} attempts")
                return None


def load_existing_data():
    """
    Load the existing word data from 99_01_English_Words.json.
    
    Returns:
        dict: The loaded JSON data, or empty dict if file doesn't exist
    """
    try:
        with open("99_01_English_Words.json", "r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        print("Warning: 99_01_English_Words.json not found. Starting with empty data.")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error reading 99_01_English_Words.json: {e}")
        return {}


def save_comprehensive_data(data, filename="99_02_comprehensive_english_dict.json"):
    """
    Save the comprehensive word data to a JSON file.
    
    Args:
        data (dict): The comprehensive word data to save
        filename (str): The filename to save to (default: 99_02_comprehensive_english_dict.json)
    """
    try:
        with open(filename, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
        logging.info(f"Comprehensive data saved to {filename}")
        print(f"Comprehensive data saved to {filename}")
    except Exception as e:
        logging.error(f"Error saving comprehensive data: {e}")
        print(f"Error saving comprehensive data: {e}")


def load_comprehensive_data(filename="99_02_comprehensive_english_dict.json"):
    """
    Load existing comprehensive word data from a JSON file.
    
    Args:
        filename (str): The filename to load from (default: 99_02_comprehensive_english_dict.json)
    
    Returns:
        dict: The loaded comprehensive data, or empty dict if file doesn't exist
    """
    try:
        with open(filename, "r", encoding="utf-8") as file:
            data = json.load(file)
            logging.info(f"Loaded existing data from {filename}")
            return data
    except FileNotFoundError:
        logging.warning(f"Warning: {filename} not found. Starting with empty data.")
        print(f"Warning: {filename} not found. Starting with empty data.")
        return {}
    except json.JSONDecodeError as e:
        logging.error(f"Error reading {filename}: {e}")
        print(f"Error reading {filename}: {e}")
        return {}


def save_checkpoint(comprehensive_data, letter, word, filename="99_02_comprehensive_english_dict.json"):
    """
    Save a checkpoint after processing each word.
    
    Args:
        comprehensive_data (dict): The current comprehensive data
        letter (str): The current letter being processed
        word (str): The word that was just processed
        filename (str): The filename to save to
    """
    try:
        # Update statistics for the current letter
        if letter in comprehensive_data and "words" in comprehensive_data[letter]:
            stats = calculate_detailed_statistics(comprehensive_data[letter]["words"], letter)
            comprehensive_data[letter]["statistics"] = stats
        
        # Save the current state
        save_comprehensive_data(comprehensive_data, filename)
        logging.info(f"Checkpoint saved after processing '{word}'")
        print(f"    ✓ Checkpoint saved after processing '{word}'")
    except Exception as e:
        logging.error(f"Error saving checkpoint: {e}")
        print(f"    ✗ Error saving checkpoint: {e}")


def show_progress_summary(comprehensive_data, existing_data):
    """
    Show a summary of progress across all letters.
    
    Args:
        comprehensive_data (dict): The current comprehensive data
        existing_data (dict): The original word data
    """
    logging.info("Generating progress summary...")
    print("\nProgress Summary:")
    print("-" * 40)
    
    total_processed = 0
    total_available = 0
    
    for letter in string.ascii_uppercase:
        if letter in existing_data and "words" in existing_data[letter]:
            available = len(existing_data[letter]["words"])
            processed = len(comprehensive_data.get(letter, {}).get("words", {}))
            total_available += available
            total_processed += processed
            
            if available > 0:
                percentage = (processed / available) * 100
                logging.info(f"Letter {letter}: {processed}/{available} words ({percentage:.1f}%)")
                print(f"Letter {letter}: {processed}/{available} words ({percentage:.1f}%)")
    
    if total_available > 0:
        overall_percentage = (total_processed / total_available) * 100
        logging.info(f"Overall Progress: {total_processed}/{total_available} words ({overall_percentage:.1f}%)")
        print(f"\nOverall Progress: {total_processed}/{total_available} words ({overall_percentage:.1f}%)")
    else:
        logging.info("No words found to process.")
        print("No words found to process.")


def setup_logging():
    """
    Setup logging configuration.
    """
    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/detailed_dictionary.log', encoding='utf-8'),
            logging.StreamHandler()  # Also log to console
        ]
    )


def main():
    """
    Main function to generate the comprehensive English dictionary.
    """
    # Setup logging
    setup_logging()
    
    logging.info("Starting Comprehensive English Dictionary Generation")
    print("Starting Comprehensive English Dictionary Generation")
    print("=" * 60)
    
    # Ask user if they want to start fresh or resume
    print("\nCheckpoint Options:")
    print("1. Resume from existing checkpoint (continue where left off)")
    print("2. Start fresh (overwrite existing checkpoint)")
    
    while True:
        try:
            choice = input("\nEnter your choice (1 or 2): ").strip()
            if choice in ['1', '2']:
                break
            else:
                print("Invalid choice. Please enter 1 or 2.")
        except KeyboardInterrupt:
            print("\nOperation cancelled by user.")
            return
    
    # Load existing data
    existing_data = load_existing_data()
    
    # Load existing comprehensive data based on user choice
    if choice == '1':
        # Resume from existing checkpoint
        comprehensive_data = load_comprehensive_data()
        print("Resuming from existing checkpoint...")
        logging.info("User chose to resume from existing checkpoint")
    else:
        # Start fresh - overwrite existing checkpoint
        comprehensive_data = {}
        print("Starting fresh - will overwrite existing checkpoint...")
        logging.info("User chose to start fresh and overwrite existing checkpoint")
        
        # Optionally backup existing file if it exists
        import shutil
        backup_filename = "99_02_comprehensive_english_dict_backup.json"
        try:
            if os.path.exists("99_02_comprehensive_english_dict.json"):
                shutil.copy2("99_02_comprehensive_english_dict.json", backup_filename)
                print(f"Existing file backed up as: {backup_filename}")
                logging.info(f"Existing file backed up as: {backup_filename}")
        except Exception as e:
            print(f"Warning: Could not create backup: {e}")
            logging.warning(f"Could not create backup: {e}")
    
    # Calculate total words to process
    total_words_to_process = 0
    for letter in string.ascii_uppercase:
        if letter in existing_data and "words" in existing_data[letter]:
            total_words_to_process += len(existing_data[letter]["words"])
    
    logging.info(f"Total words to process: {total_words_to_process}")
    print(f"Total words to process: {total_words_to_process}")
    
    # Show initial progress summary
    show_progress_summary(comprehensive_data, existing_data)
    
    # Track progress
    words_processed = 0
    
    # Process each letter of the alphabet
    for letter in string.ascii_uppercase:
        logging.info(f"Processing letter: {letter}")
        print(f"\nProcessing letter: {letter}")
        print("-" * 40)
        
        # Initialize letter data if not already present
        if letter not in comprehensive_data:
            comprehensive_data[letter] = {
                "letter": letter,
                "description": f"Words starting with letter {letter}",
                "words": {},
                "statistics": {}
            }
        
        # Get words for this letter from existing data
        if letter in existing_data and "words" in existing_data[letter]:
            words = existing_data[letter]["words"]
            logging.info(f"Found {len(words)} words for letter {letter}")
            print(f"Found {len(words)} words for letter {letter}")
            
            # Check how many words are already processed
            already_processed = len(comprehensive_data[letter]["words"])
            if already_processed > 0:
                logging.info(f"Resuming: {already_processed} words already processed for letter {letter}")
                print(f"Resuming: {already_processed} words already processed for letter {letter}")
            
            # Process each word
            for word, word_data in words.items():
                # Skip if already processed
                if word in comprehensive_data[letter]["words"]:
                    logging.info(f"Skipping already processed word: {word}")
                    print(f"  Skipping already processed word: {word}")
                    continue
                
                logging.info(f"Processing word: {word}")
                print(f"  Processing word: {word}")
                
                # Get detailed information from Gemini
                detailed_info = get_detailed_word_info(word, letter)
                
                if detailed_info:
                    comprehensive_data[letter]["words"][word] = detailed_info
                    words_processed += 1
                    logging.info(f"Successfully processed {word} ({words_processed}/{total_words_to_process})")
                    print(f"    ✓ Successfully processed {word} ({words_processed}/{total_words_to_process})")
                    
                    # Save checkpoint after each word
                    save_checkpoint(comprehensive_data, letter, word)
                else:
                    logging.error(f"Failed to process {word}")
                    print(f"    ✗ Failed to process {word}")
                
                # Add a 1-second delay to avoid rate limiting
                logging.info(f"Waiting 1 second before next API call...")
                time.sleep(1)
            
            # Calculate and store final statistics for this letter
            stats = calculate_detailed_statistics(comprehensive_data[letter]["words"], letter)
            comprehensive_data[letter]["statistics"] = stats
            
            logging.info(f"Completed letter {letter}: {len(comprehensive_data[letter]['words'])} words processed")
            print(f"Completed letter {letter}: {len(comprehensive_data[letter]['words'])} words processed")
            print(f"Statistics: {stats['total_words']} total words")
            
        else:
            logging.info(f"No words found for letter {letter}")
            print(f"No words found for letter {letter}")
            if letter not in comprehensive_data:
                comprehensive_data[letter]["words"] = {}
                comprehensive_data[letter]["statistics"] = calculate_detailed_statistics({}, letter)
    
    # Save the final comprehensive data
    logging.info("Saving final comprehensive data...")
    print("\n" + "=" * 60)
    print("Saving final comprehensive data...")
    save_comprehensive_data(comprehensive_data)
    
    # Show final progress summary
    show_progress_summary(comprehensive_data, existing_data)
    
    # Print final summary
    total_words = sum(len(data["words"]) for data in comprehensive_data.values())
    logging.info(f"Comprehensive dictionary generation completed! Total words processed: {total_words}")
    print(f"\nComprehensive dictionary generation completed!")
    print(f"Total words processed: {total_words}")
    print("Data saved to: 99_02_comprehensive_english_dict.json")


if __name__ == "__main__":
    main() 