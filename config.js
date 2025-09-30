/**
 * Configuration file for Italian Learning Bot
 */

require('dotenv').config();

const config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Validate required environment variables
  validate() {
    if (!this.BOT_TOKEN) {
      throw new Error('BOT_TOKEN environment variable is required. Please set it in your .env file or environment.');
    }
    
    if (!this.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY not set. ChatGPT features will be disabled.');
    }
  }
};

// Validate configuration on load
config.validate();

module.exports = config;
