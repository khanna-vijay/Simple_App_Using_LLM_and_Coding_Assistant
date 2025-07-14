import json
import string
from collections import defaultdict

def analyze_word_structure():
    """
    Comprehensive analysis of the 99_01_English_Words.json file structure
    """
    try:
        with open("99_01_English_Words.json", "r", encoding="utf-8") as file:
            data = json.load(file)
        
        print("=" * 80)
        print("COMPREHENSIVE WORD ANALYSIS - 99_01_English_Words.json")
        print("=" * 80)
        
        # Initialize analysis variables
        total_words = 0
        letter_stats = {}
        word_length_distribution = defaultdict(int)
        complexity_distribution = defaultdict(int)
        
        # Analyze each letter
        for letter in string.ascii_uppercase:
            if letter in data:
                letter_data = data[letter]
                word_count = 0
                
                # Check if it has a "words" subdirectory
                if "words" in letter_data:
                    words_dict = letter_data["words"]
                    word_count = len(words_dict)
                    
                    # Analyze word lengths and complexity
                    for word in words_dict:
                        word_length = len(word)
                        word_length_distribution[word_length] += 1
                        
                        # Check if complexity is available
                        if "complexity" in words_dict[word]:
                            complexity = words_dict[word]["complexity"]
                            complexity_distribution[complexity] += 1
                
                # Also check direct word entries (like in the current structure)
                else:
                    # Count direct word entries
                    word_count = len(letter_data)
                    
                    # Analyze word lengths
                    for word in letter_data:
                        if isinstance(letter_data[word], dict):  # Skip non-word entries
                            word_length = len(word)
                            word_length_distribution[word_length] += 1
                
                letter_stats[letter] = word_count
                total_words += word_count
        
        # Generate comprehensive report
        print("\n📊 LETTER-BY-LETTER ANALYSIS")
        print("-" * 80)
        print(f"{'Letter':<6} {'Word Count':<12} {'Status':<15} {'Percentage':<12}")
        print("-" * 80)
        
        letters_with_90_plus = []
        letters_below_90 = []
        
        for letter in string.ascii_uppercase:
            count = letter_stats.get(letter, 0)
            status = "✅ 90+ words" if count >= 90 else "❌ <90 words"
            percentage = (count / max(total_words, 1)) * 100
            
            print(f"{letter:<6} {count:<12} {status:<15} {percentage:>8.1f}%")
            
            if count >= 90:
                letters_with_90_plus.append(letter)
            else:
                letters_below_90.append(letter)
        
        print("\n" + "=" * 80)
        print("📈 SUMMARY STATISTICS")
        print("=" * 80)
        print(f"Total words across all letters: {total_words:,}")
        print(f"Letters with 90+ words: {len(letters_with_90_plus)}")
        print(f"Letters with <90 words: {len(letters_below_90)}")
        print(f"Average words per letter: {total_words / 26:.1f}")
        
        if letters_with_90_plus:
            print(f"\n✅ Letters with 90+ words: {', '.join(letters_with_90_plus)}")
        
        if letters_below_90:
            print(f"\n❌ Letters with <90 words: {', '.join(letters_below_90)}")
        
        # Detailed breakdown for letters with <90 words
        if letters_below_90:
            print(f"\n📋 DETAILED BREAKDOWN FOR LETTERS WITH <90 WORDS:")
            print("-" * 60)
            for letter in letters_below_90:
                count = letter_stats.get(letter, 0)
                print(f"  {letter}: {count} words")
        
        # Word length analysis
        print(f"\n📏 WORD LENGTH DISTRIBUTION:")
        print("-" * 40)
        for length in sorted(word_length_distribution.keys()):
            count = word_length_distribution[length]
            percentage = (count / total_words) * 100
            print(f"  {length}-letter words: {count} ({percentage:.1f}%)")
        
        # Complexity analysis (if available)
        if complexity_distribution:
            print(f"\n🎯 COMPLEXITY DISTRIBUTION:")
            print("-" * 40)
            for complexity in sorted(complexity_distribution.keys()):
                count = complexity_distribution[complexity]
                percentage = (count / total_words) * 100
                print(f"  {complexity}: {count} words ({percentage:.1f}%)")
        
        # Top 5 letters by word count
        sorted_letters = sorted(letter_stats.items(), key=lambda x: x[1], reverse=True)
        print(f"\n🏆 TOP 5 LETTERS BY WORD COUNT:")
        print("-" * 40)
        for i, (letter, count) in enumerate(sorted_letters[:5], 1):
            print(f"  {i}. Letter {letter}: {count} words")
        
        # Bottom 5 letters by word count
        print(f"\n📉 BOTTOM 5 LETTERS BY WORD COUNT:")
        print("-" * 40)
        for i, (letter, count) in enumerate(sorted_letters[-5:], 1):
            print(f"  {i}. Letter {letter}: {count} words")
        
        return data, letter_stats
        
    except FileNotFoundError:
        print("❌ Error: 99_01_English_Words.json file not found!")
        return None, None
    except json.JSONDecodeError as e:
        print(f"❌ Error reading JSON file: {e}")
        return None, None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None, None

def create_tabular_report(letter_stats):
    """
    Create a tabular report in markdown format
    """
    if not letter_stats:
        return
    
    print("\n" + "=" * 80)
    print("📋 TABULAR REPORT (Markdown Format)")
    print("=" * 80)
    
    print("| Letter | Word Count | Status | Percentage |")
    print("|--------|------------|--------|------------|")
    
    total_words = sum(letter_stats.values())
    
    for letter in string.ascii_uppercase:
        count = letter_stats.get(letter, 0)
        status = "✅ 90+ words" if count >= 90 else "❌ <90 words"
        percentage = (count / max(total_words, 1)) * 100
        
        print(f"| {letter} | {count} | {status} | {percentage:.1f}% |")
    
    print(f"\n**Total Words:** {total_words:,}")
    print(f"**Letters with 90+ words:** {len([l for l in letter_stats.values() if l >= 90])}")
    print(f"**Letters with <90 words:** {len([l for l in letter_stats.values() if l < 90])}")

if __name__ == "__main__":
    data, letter_stats = analyze_word_structure()
    if letter_stats:
        create_tabular_report(letter_stats) 