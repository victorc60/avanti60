"""
Configuration file for Italian Learning Bot
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Bot token from environment variable
BOT_TOKEN = os.getenv(8438587828:AAEl6hE_JKw891uA_6k8R16e9FGcOox7Qes)

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN environment variable is required. Please set it in your .env file or environment.")
