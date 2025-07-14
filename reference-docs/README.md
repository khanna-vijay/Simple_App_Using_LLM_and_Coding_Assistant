# English Leap - Reference Documentation & Development Resources

This folder contains the original development documentation, Python scripts, and data files used during the creation of English Leap. These resources are provided for reference, learning, and potential extension of the project.

## 📚 Documentation Files

### Project Planning Documents
- **[00_01_Requirements_Document.md](00_01_Requirements_Document.md)** - Original project requirements and specifications
- **[00_02_Software_Architecture.md](00_02_Software_Architecture.md)** - Initial software architecture design
- **[00_03_Implementation_Plan.md](00_03_Implementation_Plan.md)** - Development implementation strategy

## 🐍 Python Development Scripts

### Data Generation & Processing
- **[01_01_generate_word_list.py](01_01_generate_word_list.py)** - Script to generate vocabulary word lists using AI
- **[01_02_comprehensive_word_analysis.py](01_02_comprehensive_word_analysis.py)** - Analyzes and processes word data
- **[01_03_Detailed_Dictionary.py](01_03_Detailed_Dictionary.py)** - Creates detailed dictionary entries

### AI Integration Examples
- **[01_00_Sample_Gemini_Pro_LLM_Code.py](01_00_Sample_Gemini_Pro_LLM_Code.py)** - Example code for Google Gemini AI integration
- **[01_07_Download_Voice_Samples.py](01_07_Download_Voice_Samples.py)** - Script for generating pronunciation audio files

## 📊 Data Files

### Vocabulary Data
- **[99_01_English_Words.json](99_01_English_Words.json)** - Basic English word list
- **[99_02_comprehensive_english_dict.json](99_02_comprehensive_english_dict.json)** - Complete dictionary with definitions, examples, and metadata

### Utility Scripts
- **[backup_english_leap.bat](backup_english_leap.bat)** - Windows batch file for project backup

## 🎯 Purpose & Usage

### For Developers
These scripts demonstrate how to:
- Generate vocabulary data using AI (Google Gemini)
- Process and structure dictionary data
- Create audio pronunciation files
- Implement data validation and quality checks

### For Researchers
The documentation provides insights into:
- Educational application design principles
- Vocabulary learning methodology
- Data structure design for language learning
- AI integration in educational tools

### For Contributors
Use these resources to:
- Understand the project's development history
- Extend the vocabulary database
- Add new language support
- Improve data processing workflows

## 🛠️ Technical Requirements

### Python Scripts Dependencies
```bash
# Install required packages
pip install google-generativeai
pip install google-cloud-texttospeech
pip install requests
pip install json
pip install logging
```

### Authentication Setup
For AI and TTS scripts, you'll need:
- Google Cloud Project with enabled APIs
- Service account credentials or API keys
- Proper authentication configuration

**Note**: The scripts use placeholder project IDs and require your own credentials.

## 📋 Script Descriptions

### Data Generation Pipeline
1. **generate_word_list.py** - Creates initial word lists using AI
2. **comprehensive_word_analysis.py** - Enhances words with detailed information
3. **Detailed_Dictionary.py** - Formats data for application use
4. **Download_Voice_Samples.py** - Generates pronunciation audio

### Key Features
- **AI-Powered Content**: Uses Google Gemini for intelligent word selection
- **Quality Validation**: Implements data validation and error checking
- **Batch Processing**: Handles large datasets efficiently
- **Audio Generation**: Creates pronunciation files using Google TTS

## 🔒 Security & Privacy

### Safe for Public Use
All files have been reviewed and contain:
- ✅ No API keys or credentials
- ✅ No personal information
- ✅ No sensitive configuration data
- ✅ Only educational content and code examples

### Authentication Notes
- Scripts use standard Google Cloud authentication flows
- No hardcoded credentials or API keys
- Requires users to set up their own authentication
- Follows security best practices

## 📖 Learning Resources

### Educational Value
These scripts demonstrate:
- **AI Integration**: How to use LLMs for content generation
- **Data Processing**: Techniques for handling large datasets
- **Quality Assurance**: Validation and error handling patterns
- **Audio Processing**: Text-to-speech integration

### Code Quality
- Well-documented Python code
- Error handling and logging
- Modular design patterns
- Configuration management

## 🚀 Getting Started

### To Use the Scripts
1. Set up Google Cloud authentication
2. Install required Python packages
3. Configure project IDs and settings
4. Run scripts in the suggested order

### To Extend the Data
1. Modify the word generation prompts
2. Add new language processing features
3. Enhance the dictionary structure
4. Implement additional validation rules

## 📞 Support

### For Script Issues
- Check the main project [Issues](../../../issues)
- Review the [Contributing Guide](../CONTRIBUTING.md)
- Reference the [Setup Guide](../SETUP.md)

### For AI Integration Help
- Google Cloud documentation
- Gemini AI API documentation
- Text-to-Speech API guides

## 📄 License

These reference materials are provided under the same MIT License as the main project. See [LICENSE](../LICENSE) for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - For intelligent content generation
- **Google Cloud TTS** - For pronunciation audio generation
- **Open Source Community** - For tools and libraries used

---

**Note**: These are reference materials from the development process. The main application in the `src/` folder contains the production-ready code.

**Last Updated**: January 2025
