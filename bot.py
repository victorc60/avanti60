#!/usr/bin/env python3
"""
Italian Language Learning Telegram Bot
A simple bot to help users learn Italian language
"""

import logging
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from config import BOT_TOKEN

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class ItalianLearningBot:
    def __init__(self):
        self.vocabulary = {
            'greetings': {
                'Ciao': 'Hello/Hi',
                'Buongiorno': 'Good morning',
                'Buonasera': 'Good evening',
                'Arrivederci': 'Goodbye',
                'Grazie': 'Thank you',
                'Prego': 'You\'re welcome'
            },
            'numbers': {
                'Uno': 'One',
                'Due': 'Two',
                'Tre': 'Three',
                'Quattro': 'Four',
                'Cinque': 'Five'
            },
            'colors': {
                'Rosso': 'Red',
                'Blu': 'Blue',
                'Verde': 'Green',
                'Giallo': 'Yellow',
                'Nero': 'Black'
            }
        }

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Send a message when the command /start is issued."""
        user = update.effective_user
        welcome_message = f"""
🇮🇹 Ciao {user.first_name}! Benvenuto al tuo tutor italiano!

I'm here to help you learn Italian! Here's what I can do:

📚 /vocabulary - Learn Italian vocabulary
🔢 /numbers - Practice Italian numbers
🎨 /colors - Learn Italian colors
🎯 /quiz - Take a vocabulary quiz
ℹ️ /help - Show this help message

Let's start your Italian learning journey! 🚀
        """
        await update.message.reply_text(welcome_message)

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Send a message when the command /help is issued."""
        help_text = """
🇮🇹 Italian Learning Bot - Help

Available commands:
/start - Start the bot and see welcome message
/vocabulary - Learn basic Italian vocabulary
/numbers - Practice Italian numbers
/colors - Learn Italian colors
/quiz - Take a vocabulary quiz
/help - Show this help message

Choose a topic and start learning! 📖
        """
        await update.message.reply_text(help_text)

    async def vocabulary(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Show vocabulary categories."""
        keyboard = [
            [InlineKeyboardButton("👋 Greetings", callback_data="vocab_greetings")],
            [InlineKeyboardButton("🔢 Numbers", callback_data="vocab_numbers")],
            [InlineKeyboardButton("🎨 Colors", callback_data="vocab_colors")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "📚 Choose a vocabulary category:",
            reply_markup=reply_markup
        )

    async def numbers(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Show Italian numbers."""
        numbers_text = "🔢 Italian Numbers:\n\n"
        for italian, english in self.vocabulary['numbers'].items():
            numbers_text += f"• {italian} = {english}\n"
        
        await update.message.reply_text(numbers_text)

    async def colors(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Show Italian colors."""
        colors_text = "🎨 Italian Colors:\n\n"
        for italian, english in self.vocabulary['colors'].items():
            colors_text += f"• {italian} = {english}\n"
        
        await update.message.reply_text(colors_text)

    async def quiz(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Start a vocabulary quiz."""
        keyboard = [
            [InlineKeyboardButton("👋 Greetings Quiz", callback_data="quiz_greetings")],
            [InlineKeyboardButton("🔢 Numbers Quiz", callback_data="quiz_numbers")],
            [InlineKeyboardButton("🎨 Colors Quiz", callback_data="quiz_colors")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "🎯 Choose a quiz category:",
            reply_markup=reply_markup
        )

    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle button callbacks."""
        query = update.callback_query
        await query.answer()

        if query.data.startswith("vocab_"):
            category = query.data.split("_")[1]
            text = f"📚 {category.title()} Vocabulary:\n\n"
            for italian, english in self.vocabulary[category].items():
                text += f"• {italian} = {english}\n"
            await query.edit_message_text(text=text)

        elif query.data.startswith("quiz_"):
            category = query.data.split("_")[1]
            # Simple quiz - show first word and ask for translation
            words = list(self.vocabulary[category].items())
            if words:
                italian_word, english_translation = words[0]
                quiz_text = f"🎯 Quiz: What does '{italian_word}' mean in English?"
                await query.edit_message_text(text=quiz_text)

def main():
    """Start the bot."""
    # Create bot instance
    bot = ItalianLearningBot()
    
    # Create application
    application = Application.builder().token(BOT_TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", bot.start))
    application.add_handler(CommandHandler("help", bot.help_command))
    application.add_handler(CommandHandler("vocabulary", bot.vocabulary))
    application.add_handler(CommandHandler("numbers", bot.numbers))
    application.add_handler(CommandHandler("colors", bot.colors))
    application.add_handler(CommandHandler("quiz", bot.quiz))
    application.add_handler(CallbackQueryHandler(bot.button_callback))

    # Start the bot
    print("🇮🇹 Italian Learning Bot is starting...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
