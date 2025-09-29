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
    
    # Create application with proper timeouts
    application = Application.builder().token(BOT_TOKEN).get_updates_read_timeout(30).get_updates_write_timeout(30).get_updates_connect_timeout(30).get_updates_pool_timeout(30).build()
    
    # Force delete webhook and clear any conflicts
    try:
        import requests
        import time
        
        # Delete webhook
        response = requests.post(f'https://api.telegram.org/bot{BOT_TOKEN}/deleteWebhook')
        print(f"🗑️ Webhook deletion: {response.status_code}")
        
        # Set empty webhook
        response = requests.post(f'https://api.telegram.org/bot{BOT_TOKEN}/setWebhook', data={'url': ''})
        print(f"🧹 Webhook clearing: {response.status_code}")
        
        # Get current webhook info
        response = requests.post(f'https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo')
        webhook_info = response.json()
        print(f"📊 Current webhook: {webhook_info.get('result', {}).get('url', 'None')}")
        
        # Force stop any polling
        print("🛑 Forcing webhook mode to stop polling conflicts...")
        response = requests.post(f'https://api.telegram.org/bot{BOT_TOKEN}/setWebhook', 
                                data={'url': 'https://example.com/webhook'})
        time.sleep(2)
        response = requests.post(f'https://api.telegram.org/bot{BOT_TOKEN}/deleteWebhook')
        
        print("✅ Webhook conflicts resolved")
        
    except Exception as e:
        print(f"⚠️ Webhook cleanup error: {e}")

    # Add handlers
    application.add_handler(CommandHandler("start", bot.start))
    application.add_handler(CommandHandler("help", bot.help_command))
    application.add_handler(CommandHandler("vocabulary", bot.vocabulary))
    application.add_handler(CommandHandler("numbers", bot.numbers))
    application.add_handler(CommandHandler("colors", bot.colors))
    application.add_handler(CommandHandler("quiz", bot.quiz))
    application.add_handler(CallbackQueryHandler(bot.button_callback))

    # Start the bot with conflict handling
    print("🇮🇹 Italian Learning Bot is starting...")
    print("⏳ Waiting 5 seconds for webhook cleanup...")
    import time
    time.sleep(5)
    
    # Try multiple times with delays
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"🚀 Starting bot with polling... (Attempt {attempt + 1}/{max_retries})")
            application.run_polling(
                drop_pending_updates=True,
                allowed_updates=Update.ALL_TYPES
            )
            break  # If successful, exit the loop
        except Exception as e:
            print(f"❌ Attempt {attempt + 1} failed: {e}")
            if "Conflict" in str(e) or "409" in str(e):
                print("🔄 Conflict detected. Waiting 10 seconds before retry...")
                time.sleep(10)
                if attempt < max_retries - 1:
                    print("🔄 Retrying...")
                    continue
                else:
                    print("❌ All attempts failed due to conflicts.")
                    print("💡 Solutions:")
                    print("   1. Stop all other bot instances")
                    print("   2. Wait 30 seconds and try again")
                    print("   3. Check if bot is running elsewhere (Heroku, Railway, etc.)")
                    print("💡 Manual webhook deletion:")
                    print(f"   https://api.telegram.org/bot{BOT_TOKEN}/deleteWebhook")
                    break
            else:
                print(f"❌ Unexpected error: {e}")
                break

if __name__ == '__main__':
    main()
