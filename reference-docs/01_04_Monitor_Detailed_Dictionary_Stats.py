#!/usr/bin/env python3
"""
01_04_Monitor_Detailed_Dictionary_Stats.py

This script analyzes the comprehensive English dictionary (99_02_comprehensive_english_dict.json)
and provides detailed statistics about the completeness of word entries.

The script checks for the presence of various fields:
- Basic fields: complexity, definition, example
- Pronunciation fields: pronunciation, phonetic_respelling, ssml_phoneme
- Detailed fields: meanings, part_of_speech, synonyms, antonyms
- Advanced fields: word_origin, word_roots, verb_forms

It then displays comprehensive statistics in a tabular format.

Author: AI Assistant
Date: 2024
"""

import json
import logging
from typing import Dict, List, Set, Any
from collections import defaultdict, Counter
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('01_04_Monitor_Detailed_Dictionary_Stats.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DictionaryAnalyzer:
    """Analyzes the comprehensive dictionary and provides statistics."""
    
    def __init__(self, filename: str):
        """
        Initialize the analyzer with the dictionary file.
        
        Args:
            filename (str): Path to the comprehensive dictionary JSON file
        """
        self.filename = filename
        self.data = {}
        self.stats = {}
        
    def load_data(self) -> bool:
        """
        Load the dictionary data from JSON file.
        
        Returns:
            bool: True if successful, False otherwise
        """
        logger.info(f"Loading dictionary data from {self.filename}")
        
        try:
            with open(self.filename, 'r', encoding='utf-8') as file:
                self.data = json.load(file)
            logger.info("Successfully loaded dictionary data")
            return True
        except FileNotFoundError:
            logger.error(f"File {self.filename} not found")
            return False
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON from {self.filename}: {e}")
            return False
        except Exception as e:
            logger.error(f"Error loading file {self.filename}: {e}")
            return False
    
    def analyze_word_completeness(self, word_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze the completeness of a single word entry.
        
        Args:
            word_data (Dict[str, Any]): The word entry data
            
        Returns:
            Dict[str, Any]: Analysis results for the word
        """
        analysis = {
            'has_complexity': False,
            'has_definition': False,
            'has_example': False,
            'has_pronunciation': False,
            'has_phonetic_respelling': False,
            'has_ssml_phoneme': False,
            'has_meanings': False,
            'has_part_of_speech': False,
            'has_synonyms': False,
            'has_antonyms': False,
            'has_word_origin': False,
            'has_word_roots': False,
            'has_verb_forms': False,
            'total_definitions': 0,
            'total_synonyms': 0,
            'total_antonyms': 0,
            'total_meanings': 0
        }
        
        # Check basic fields
        analysis['has_complexity'] = bool('complexity' in word_data and word_data['complexity'])
        
        # Check for definitions and examples in the nested structure
        has_definition = False
        has_example = False
        if 'meanings' in word_data and word_data['meanings']:
            for meaning in word_data['meanings']:
                if 'definitions' in meaning and meaning['definitions']:
                    for definition in meaning['definitions']:
                        if 'definition' in definition and definition['definition']:
                            has_definition = True
                        if 'example' in definition and definition['example']:
                            has_example = True
        
        analysis['has_definition'] = has_definition
        analysis['has_example'] = has_example
        
        # Check pronunciation fields
        analysis['has_pronunciation'] = bool('pronunciation' in word_data and word_data['pronunciation'])
        analysis['has_phonetic_respelling'] = bool('phonetic_respelling' in word_data and word_data['phonetic_respelling'])
        analysis['has_ssml_phoneme'] = bool('ssml_phoneme' in word_data and word_data['ssml_phoneme'])
        
        # Check advanced fields
        analysis['has_word_origin'] = bool('word_origin' in word_data and word_data['word_origin'])
        analysis['has_word_roots'] = bool('word_roots' in word_data and word_data['word_roots'])
        
        # Check meanings and related fields
        if 'meanings' in word_data and word_data['meanings']:
            analysis['has_meanings'] = True
            analysis['total_meanings'] = len(word_data['meanings'])
            
            for meaning in word_data['meanings']:
                if 'part_of_speech' in meaning and meaning['part_of_speech']:
                    analysis['has_part_of_speech'] = True
                
                if 'definitions' in meaning and meaning['definitions']:
                    analysis['total_definitions'] += len(meaning['definitions'])
                    
                    for definition in meaning['definitions']:
                        if 'synonyms' in definition and definition['synonyms']:
                            analysis['has_synonyms'] = True
                            analysis['total_synonyms'] += len(definition['synonyms'])
                        
                        if 'antonyms' in definition and definition['antonyms']:
                            analysis['has_antonyms'] = True
                            analysis['total_antonyms'] += len(definition['antonyms'])
                
                if 'verb_forms' in meaning and meaning['verb_forms']:
                    # Check if verb_forms has actual content
                    verb_forms = meaning['verb_forms']
                    if isinstance(verb_forms, dict) and any(verb_forms.values()):
                        analysis['has_verb_forms'] = True
        
        return analysis
    
    def analyze_dictionary(self) -> Dict[str, Any]:
        """
        Analyze the entire dictionary and collect statistics.
        
        Returns:
            Dict[str, Any]: Comprehensive analysis results
        """
        logger.info("Starting dictionary analysis")
        
        total_words = 0
        completeness_stats = defaultdict(int)
        field_stats = defaultdict(int)
        complexity_distribution = Counter()
        part_of_speech_distribution = Counter()
        word_length_stats = Counter()
        letter_distribution = Counter()
        
        # Track words with missing fields
        incomplete_words = defaultdict(list)
        
        for letter, letter_data in self.data.items():
            if isinstance(letter_data, dict) and 'words' in letter_data:
                letter_distribution[letter] = len(letter_data['words'])
                
                for word, word_data in letter_data['words'].items():
                    total_words += 1
                    word_length_stats[len(word)] += 1
                    
                    # Analyze word completeness
                    analysis = self.analyze_word_completeness(word_data)
                    
                    # Count completeness levels
                    # Check if any meaning is a verb for verb_forms calculation
                    is_verb = False
                    if 'meanings' in word_data and word_data['meanings']:
                        for meaning in word_data['meanings']:
                            if meaning.get('part_of_speech') == 'Verb':
                                is_verb = True
                                break
                    
                    complete_fields = sum([
                        int(analysis['has_complexity']),
                        int(analysis['has_definition']),
                        int(analysis['has_example']),
                        int(analysis['has_pronunciation']),
                        int(analysis['has_phonetic_respelling']),
                        int(analysis['has_ssml_phoneme']),
                        int(analysis['has_meanings']),
                        int(analysis['has_part_of_speech']),
                        int(analysis['has_synonyms']),
                        int(analysis['has_antonyms']),
                        int(analysis['has_word_origin']),
                        int(analysis['has_word_roots']),
                        int(analysis['has_verb_forms']) if is_verb else 1  # Count as complete if not a verb
                    ])
                    
                    completeness_stats[complete_fields] += 1
                    
                    # Track field presence
                    for field, has_field in analysis.items():
                        if field.startswith('has_'):
                            # Special handling for verb_forms - only count for verbs
                            if field == 'has_verb_forms':
                                # Check if any meaning is a verb
                                is_verb = False
                                if 'meanings' in word_data and word_data['meanings']:
                                    for meaning in word_data['meanings']:
                                        if meaning.get('part_of_speech') == 'Verb':
                                            is_verb = True
                                            break
                                # Only count verb_forms if it's a verb
                                if is_verb:
                                    field_stats[field] += int(bool(has_field))
                            else:
                                field_stats[field] += int(bool(has_field))
                    
                    # Track complexity
                    if analysis['has_complexity']:
                        complexity_distribution[word_data['complexity']] += 1
                    
                    # Track part of speech
                    if analysis['has_part_of_speech']:
                        for meaning in word_data.get('meanings', []):
                            if 'part_of_speech' in meaning:
                                part_of_speech_distribution[meaning['part_of_speech']] += 1
                    
                    # Track incomplete words
                    missing_fields = []
                    for field, has_field in analysis.items():
                        if field.startswith('has_') and not bool(has_field):
                            # Special handling for verb_forms - only count as missing for verbs
                            if field == 'has_verb_forms':
                                # Check if any meaning is a verb
                                is_verb = False
                                if 'meanings' in word_data and word_data['meanings']:
                                    for meaning in word_data['meanings']:
                                        if meaning.get('part_of_speech') == 'Verb':
                                            is_verb = True
                                            break
                                # Only count verb_forms as missing if it's actually a verb
                                if is_verb:
                                    missing_fields.append(field.replace('has_', ''))
                            else:
                                missing_fields.append(field.replace('has_', ''))
                    
                    if missing_fields:
                        incomplete_words[letter].append({
                            'word': word,
                            'missing_fields': missing_fields
                        })
        
        # Calculate percentages
        field_percentages = {}
        for field, count in field_stats.items():
            field_percentages[field] = (count / total_words * 100) if total_words > 0 else 0
        
        self.stats = {
            'total_words': total_words,
            'completeness_stats': dict(completeness_stats),
            'field_stats': dict(field_stats),
            'field_percentages': field_percentages,
            'complexity_distribution': dict(complexity_distribution),
            'part_of_speech_distribution': dict(part_of_speech_distribution),
            'word_length_stats': dict(word_length_stats),
            'letter_distribution': dict(letter_distribution),
            'incomplete_words': dict(incomplete_words)
        }
        
        logger.info(f"Analysis completed. Total words: {total_words}")
        return self.stats
    
    def debug_word_analysis(self, word_name: str):
        """
        Debug analysis for a specific word.
        
        Args:
            word_name (str): The word to debug
        """
        for letter, letter_data in self.data.items():
            if isinstance(letter_data, dict) and 'words' in letter_data:
                if word_name in letter_data['words']:
                    word_data = letter_data['words'][word_name]
                    analysis = self.analyze_word_completeness(word_data)
                    print(f"\nDebug for word '{word_name}':")
                    print(f"  Has verb_forms: {analysis['has_verb_forms']}")
                    print(f"  Has meanings: {analysis['has_meanings']}")
                    if 'meanings' in word_data:
                        for i, meaning in enumerate(word_data['meanings']):
                            print(f"  Meaning {i+1}:")
                            print(f"    Part of speech: {meaning.get('part_of_speech', 'N/A')}")
                            print(f"    Has verb_forms: {'verb_forms' in meaning}")
                            if 'verb_forms' in meaning:
                                print(f"    Verb forms: {meaning['verb_forms']}")
                    return
        print(f"Word '{word_name}' not found in dictionary")

    def print_tabular_dashboard(self):
        """Print a comprehensive tabular dashboard of the analysis results."""
        if not self.stats:
            logger.error("No analysis results available. Run analyze_dictionary() first.")
            return
        
        print("\n" + "="*80)
        print("COMPREHENSIVE DICTIONARY ANALYSIS DASHBOARD")
        print("="*80)
        
        # Overall Statistics
        print(f"\n📊 OVERALL STATISTICS")
        print("-" * 40)
        print(f"Total Words: {self.stats['total_words']:,}")
        print(f"Letters Covered: {len(self.stats['letter_distribution'])}")
        
        # Completeness Overview
        print(f"\n📈 COMPLETENESS OVERVIEW")
        print("-" * 40)
        print(f"{'Fields Present':<20} {'Count':<10} {'Percentage':<12}")
        print("-" * 42)
        
        for field, count in self.stats['field_stats'].items():
            percentage = self.stats['field_percentages'][field]
            field_name = field.replace('has_', '').replace('_', ' ').title()
            print(f"{field_name:<20} {count:<10} {percentage:>8.1f}%")
        
        # Complexity Distribution
        print(f"\n🎯 COMPLEXITY DISTRIBUTION")
        print("-" * 40)
        print(f"{'Complexity':<15} {'Count':<10} {'Percentage':<12}")
        print("-" * 37)
        
        total_words = self.stats['total_words']
        for complexity, count in self.stats['complexity_distribution'].items():
            percentage = (count / total_words * 100) if total_words > 0 else 0
            print(f"{complexity:<15} {count:<10} {percentage:>8.1f}%")
        
        # Part of Speech Distribution
        print(f"\n📝 PART OF SPEECH DISTRIBUTION")
        print("-" * 40)
        print(f"{'Part of Speech':<20} {'Count':<10}")
        print("-" * 30)
        
        for pos, count in self.stats['part_of_speech_distribution'].items():
            print(f"{pos:<20} {count:<10}")
        
        # Letter Distribution
        print(f"\n🔤 LETTER DISTRIBUTION")
        print("-" * 40)
        print(f"{'Letter':<8} {'Words':<10} {'Percentage':<12}")
        print("-" * 30)
        
        for letter in sorted(self.stats['letter_distribution'].keys()):
            count = self.stats['letter_distribution'][letter]
            percentage = (count / total_words * 100) if total_words > 0 else 0
            print(f"{letter:<8} {count:<10} {percentage:>8.1f}%")
        
        # Word Length Statistics
        print(f"\n📏 WORD LENGTH STATISTICS")
        print("-" * 40)
        print(f"{'Length':<8} {'Count':<10} {'Percentage':<12}")
        print("-" * 30)
        
        for length in sorted(self.stats['word_length_stats'].keys()):
            count = self.stats['word_length_stats'][length]
            percentage = (count / total_words * 100) if total_words > 0 else 0
            print(f"{length:<8} {count:<10} {percentage:>8.1f}%")
        
        # Completeness Distribution
        print(f"\n✅ COMPLETENESS DISTRIBUTION")
        print("-" * 40)
        print(f"{'Fields Present':<15} {'Words':<10} {'Percentage':<12}")
        print("-" * 37)
        
        for fields_present, count in sorted(self.stats['completeness_stats'].items()):
            percentage = (count / total_words * 100) if total_words > 0 else 0
            print(f"{fields_present:<15} {count:<10} {percentage:>8.1f}%")
        
        # Incomplete Words Summary
        print(f"\n⚠️  INCOMPLETE WORDS SUMMARY")
        print("-" * 40)
        
        total_incomplete = sum(len(words) for words in self.stats['incomplete_words'].values())
        print(f"Total Incomplete Words: {total_incomplete}")
        
        if total_incomplete > 0:
            print(f"\nTop Missing Fields:")
            missing_field_counts = Counter()
            for letter_words in self.stats['incomplete_words'].values():
                for word_info in letter_words:
                    for field in word_info['missing_fields']:
                        missing_field_counts[field] += 1
            
            for field, count in missing_field_counts.most_common(5):
                percentage = (count / total_incomplete * 100) if total_incomplete > 0 else 0
                print(f"  {field.replace('_', ' ').title()}: {count} ({percentage:.1f}%)")
        
        print("\n" + "="*80)
        print("ANALYSIS COMPLETE")
        print("="*80)

def main():
    """
    Main function to run the dictionary analysis.
    """
    logger.info("Starting comprehensive dictionary analysis")
    
    # Initialize analyzer
    analyzer = DictionaryAnalyzer("99_02_comprehensive_english_dict.json")
    
    # Load data
    if not analyzer.load_data():
        logger.error("Failed to load dictionary data. Exiting.")
        return
    
    # Analyze dictionary
    stats = analyzer.analyze_dictionary()
    
    # Debug a few words to check verb forms detection
    print("\n🔍 DEBUGGING VERB FORMS DETECTION:")
    analyzer.debug_word_analysis("Abate")  # Should have verb forms
    analyzer.debug_word_analysis("Abdicate")  # Should have verb forms
    
    # Print dashboard
    analyzer.print_tabular_dashboard()
    
    logger.info("Dictionary analysis completed successfully")

if __name__ == "__main__":
    main() 