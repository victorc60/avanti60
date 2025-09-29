# 🇮🇹 Italian Learning Telegram Bot

A simple Telegram bot to help users learn Italian language with vocabulary, numbers, colors, and interactive quizzes.

## Features

- 📚 **Vocabulary Learning**: Learn basic Italian words organized by categories
- 🔢 **Numbers**: Practice Italian numbers from 1-5
- 🎨 **Colors**: Learn Italian color names
- 🎯 **Interactive Quizzes**: Test your knowledge with simple quizzes
- 👋 **Greetings**: Learn common Italian greetings and polite expressions

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token you receive

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

1. Copy `env_example.txt` to `.env`:
   ```bash
   cp env_example.txt .env
   ```

2. Edit `.env` file and add your bot token:
   ```
   BOT_TOKEN=your_actual_bot_token_here
   ```

### 4. Run the Bot

```bash
python bot.py
```

## Bot Commands

- `/start` - Start the bot and see welcome message
- `/help` - Show help information
- `/vocabulary` - Learn Italian vocabulary by category
- `/numbers` - Practice Italian numbers
- `/colors` - Learn Italian colors
- `/quiz` - Take vocabulary quizzes

## Project Structure

```
ItalTutor/
├── bot.py              # Main bot file
├── config.py           # Configuration and token handling
├── requirements.txt     # Python dependencies
├── env_example.txt      # Environment variables template
└── README.md           # This file
```

## How to Use

1. Start a conversation with your bot on Telegram
2. Send `/start` to begin
3. Use the menu buttons to navigate through different learning sections
4. Practice with quizzes to test your knowledge

## Extending the Bot

You can easily extend the bot by:

- Adding more vocabulary categories in the `vocabulary` dictionary
- Implementing more complex quiz logic
- Adding pronunciation features
- Including grammar lessons
- Adding progress tracking

## Requirements

- Python 3.7+
- python-telegram-bot library
- A Telegram bot token from BotFather

## License

This project is open source and available under the MIT License.
