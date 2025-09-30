#!/usr/bin/env node
/**
 * Italian Language Learning Telegram Bot
 * A Node.js bot to help users learn Italian language with ChatGPT integration
 */

const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
const axios = require('axios');
const config = require('./config');

// Initialize bot with better error handling
console.log('🔧 Initializing bot...');
console.log('📡 Bot Token:', config.BOT_TOKEN ? `${config.BOT_TOKEN.substring(0, 10)}...` : 'NOT SET');
console.log('🤖 OpenAI API Key:', config.OPENAI_API_KEY ? `${config.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET');

const bot = new TelegramBot(config.BOT_TOKEN, { 
  polling: {
    interval: 1000,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Initialize OpenAI client
let openaiClient = null;
if (config.OPENAI_API_KEY) {
  try {
    openaiClient = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
    console.log('✅ OpenAI client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI client:', error.message);
  }
} else {
  console.warn('⚠️ OpenAI API key not provided. ChatGPT features will be disabled.');
}

// User data storage (in production, use a database)
const userData = {
  tutorMode: new Map(),
  conversationHistory: new Map(),
  userProgress: new Map(),
  dailyWords: new Map(),
  horoscopeSent: new Map()
};

// A2 Level vocabulary (more advanced than basic)
const a2Vocabulary = {
  family: {
    'famiglia': 'family',
    'madre': 'mother',
    'padre': 'father',
    'sorella': 'sister',
    'fratello': 'brother',
    'nonna': 'grandmother',
    'nonno': 'grandfather',
    'zia': 'aunt',
    'zio': 'uncle',
    'cugino': 'cousin'
  },
  food: {
    'colazione': 'breakfast',
    'pranzo': 'lunch',
    'cena': 'dinner',
    'ristorante': 'restaurant',
    'cameriere': 'waiter',
    'menu': 'menu',
    'conto': 'bill',
    'tavolo': 'table',
    'cucina': 'kitchen',
    'ingredienti': 'ingredients'
  },
  travel: {
    'aeroporto': 'airport',
    'stazione': 'station',
    'biglietto': 'ticket',
    'valigia': 'suitcase',
    'passaporto': 'passport',
    'hotel': 'hotel',
    'camera': 'room',
    'reception': 'reception',
    'mappa': 'map',
    'direzioni': 'directions'
  },
  emotions: {
    'felice': 'happy',
    'triste': 'sad',
    'arrabbiato': 'angry',
    'nervoso': 'nervous',
    'rilassato': 'relaxed',
    'eccitato': 'excited',
    'stanco': 'tired',
    'sorpreso': 'surprised',
    'preoccupato': 'worried',
    'orgoglioso': 'proud'
  },
  daily_activities: {
    'svegliarsi': 'to wake up',
    'lavarsi': 'to wash',
    'vestirsi': 'to get dressed',
    'fare colazione': 'to have breakfast',
    'andare al lavoro': 'to go to work',
    'tornare a casa': 'to come home',
    'cucinare': 'to cook',
    'guardare la TV': 'to watch TV',
    'leggere': 'to read',
    'dormire': 'to sleep'
  }
};

// Basic vocabulary
const vocabulary = {
  greetings: {
    'Ciao': 'Hello/Hi',
    'Buongiorno': 'Good morning',
    'Buonasera': 'Good evening',
    'Arrivederci': 'Goodbye',
    'Grazie': 'Thank you',
    'Prego': 'You\'re welcome'
  },
  numbers: {
    'Uno': 'One',
    'Due': 'Two',
    'Tre': 'Three',
    'Quattro': 'Four',
    'Cinque': 'Five'
  },
  colors: {
    'Rosso': 'Red',
    'Blu': 'Blue',
    'Verde': 'Green',
    'Giallo': 'Yellow',
    'Nero': 'Black'
  }
};

// Utility functions
function getRandomWords(count = 5) {
  const allWords = {};
  Object.values(a2Vocabulary).forEach(category => {
    Object.assign(allWords, category);
  });
  
  const words = Object.entries(allWords);
  const shuffled = words.sort(() => 0.5 - Math.random());
  return Object.fromEntries(shuffled.slice(0, count));
}

function getToday() {
  return new Date().toDateString();
}

// Bot command handlers
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  const welcomeMessage = `🇮🇹 Ciao ${firstName}! Benvenuto al tuo tutor italiano!

I'm here to help you learn Italian! Here's what I can do:

📚 /vocabulary - Learn Italian vocabulary
🔢 /numbers - Practice Italian numbers
🎨 /colors - Learn Italian colors
🎯 /quiz - Take a vocabulary quiz
🤖 /ask - Ask ChatGPT about Italian (requires OpenAI API key)
👨‍🏫 /tutor - Enable AI tutor mode (chat with Italian teacher)
📚 /daily_words - Get today's 5 new Italian words
🔮 /horoscope - Get your daily horoscope in Italian
📊 /progress - Check your learning progress
ℹ️ /help - Show this help message

Let's start your Italian learning journey! 🚀`;

  bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpText = `🇮🇹 Italian Learning Bot - Help

Available commands:
/start - Start the bot and see welcome message
/vocabulary - Learn basic Italian vocabulary
/numbers - Practice Italian numbers
/colors - Learn Italian colors
/quiz - Take a vocabulary quiz
/ask <question> - Ask ChatGPT about Italian
/tutor - Enable AI tutor mode (chat with Italian teacher)
/daily_words - Get today's 5 new Italian words
/horoscope - Get your daily horoscope in Italian
/progress - Check your learning progress
/help - Show this help message

Choose a topic and start learning! 📖`;

  bot.sendMessage(chatId, helpText);
});

bot.onText(/\/vocabulary/, (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '👋 Greetings', callback_data: 'vocab_greetings' },
        { text: '🔢 Numbers', callback_data: 'vocab_numbers' }
      ],
      [
        { text: '🎨 Colors', callback_data: 'vocab_colors' }
      ]
    ]
  };
  
  bot.sendMessage(chatId, '📚 Choose a vocabulary category:', {
    reply_markup: keyboard
  });
});

bot.onText(/\/numbers/, (msg) => {
  const chatId = msg.chat.id;
  
  let numbersText = '🔢 Italian Numbers:\n\n';
  Object.entries(vocabulary.numbers).forEach(([italian, english]) => {
    numbersText += `• ${italian} = ${english}\n`;
  });
  
  bot.sendMessage(chatId, numbersText);
});

bot.onText(/\/colors/, (msg) => {
  const chatId = msg.chat.id;
  
  let colorsText = '🎨 Italian Colors:\n\n';
  Object.entries(vocabulary.colors).forEach(([italian, english]) => {
    colorsText += `• ${italian} = ${english}\n`;
  });
  
  bot.sendMessage(chatId, colorsText);
});

bot.onText(/\/quiz/, (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '👋 Greetings Quiz', callback_data: 'quiz_greetings' },
        { text: '🔢 Numbers Quiz', callback_data: 'quiz_numbers' }
      ],
      [
        { text: '🎨 Colors Quiz', callback_data: 'quiz_colors' }
      ]
    ]
  };
  
  bot.sendMessage(chatId, '🎯 Choose a quiz category:', {
    reply_markup: keyboard
  });
});

bot.onText(/\/ask (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const question = match[1];
  
  if (!openaiClient) {
    bot.sendMessage(chatId, '❌ ChatGPT features are not available. Please set OPENAI_API_KEY in your environment.');
    return;
  }
  
  try {
    bot.sendMessage(chatId, '🤖 Thinking...');
    
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Italian language tutor. Answer questions about Italian language, grammar, vocabulary, and culture. Be encouraging and provide clear explanations with examples when possible.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    const answer = response.choices[0].message.content;
    bot.sendMessage(chatId, `🤖 ${answer}`);
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    bot.sendMessage(chatId, '❌ Sorry, I couldn\'t process your question. Please try again later.');
  }
});

bot.onText(/\/tutor/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!openaiClient) {
    bot.sendMessage(chatId, '❌ Tutor mode is not available. Please set OPENAI_API_KEY in your environment.');
    return;
  }
  
  if (userData.tutorMode.get(userId)) {
    userData.tutorMode.set(userId, false);
    bot.sendMessage(chatId, '👨‍🏫 Tutor mode disabled. Use /tutor to enable again.');
  } else {
    userData.tutorMode.set(userId, true);
    bot.sendMessage(chatId, '👨‍🏫 Tutor mode enabled! Now you can chat with your AI Italian teacher. Just send me any message and I\'ll respond as your Italian tutor. Use /tutor again to disable this mode.');
  }
});

bot.onText(/\/daily_words/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const today = getToday();
  
  // Check if user already got words today
  if (userData.dailyWords.get(userId)?.date === today) {
    const words = userData.dailyWords.get(userId).words;
    bot.sendMessage(chatId, '📚 You already got today\'s words! Here they are again:');
    
    let wordsText = '📚 Today\'s 5 New Italian Words (A2 Level):\n\n';
    Object.entries(words).forEach(([italian, english]) => {
      wordsText += `• ${italian} = ${english}\n`;
    });
    wordsText += '\n💡 Now try to create a sentence using these words! Use /tutor to practice with me.';
    
    bot.sendMessage(chatId, wordsText);
  } else {
    // Select 5 random words from A2 vocabulary
    const selectedWords = getRandomWords(5);
    
    // Store for today
    userData.dailyWords.set(userId, {
      date: today,
      words: selectedWords
    });
    
    let wordsText = '📚 Today\'s 5 New Italian Words (A2 Level):\n\n';
    Object.entries(selectedWords).forEach(([italian, english]) => {
      wordsText += `• ${italian} = ${english}\n`;
    });
    wordsText += '\n💡 Now try to create a sentence using these words! Use /tutor to practice with me.';
    
    bot.sendMessage(chatId, wordsText);
  }
});

bot.onText(/\/horoscope/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!openaiClient) {
    bot.sendMessage(chatId, '❌ Horoscope feature requires OpenAI API key.');
    return;
  }
  
  try {
    bot.sendMessage(chatId, '🔮 Reading the stars...');
    
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly astrologer who gives daily horoscopes in Italian. Make it encouraging, fun, and include some Italian vocabulary. Keep it A2 level with simple sentences. Include emojis and make it personal.'
        },
        {
          role: 'user',
          content: `Give me a daily horoscope for today (${new Date().toLocaleDateString()}) in Italian. Make it encouraging and include some Italian vocabulary.`
        }
      ],
      max_tokens: 300,
      temperature: 0.8
    });
    
    const horoscope = response.choices[0].message.content;
    bot.sendMessage(chatId, `🔮 ${horoscope}`);
    
  } catch (error) {
    console.error('OpenAI API error for horoscope:', error);
    bot.sendMessage(chatId, '❌ Sorry, I couldn\'t read the stars today. Try again later!');
  }
});

bot.onText(/\/progress/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!userData.userProgress.has(userId)) {
    userData.userProgress.set(userId, {
      wordsLearned: 0,
      conversations: 0,
      level: 'A2',
      streak: 0
    });
  }
  
  const progress = userData.userProgress.get(userId);
  
  const progressText = `📊 Your Italian Learning Progress

🎯 Level: ${progress.level}
📚 Words Learned: ${progress.wordsLearned}
💬 Conversations: ${progress.conversations}
🔥 Streak: ${progress.streak} days

Keep up the great work! 🇮🇹`;
  
  bot.sendMessage(chatId, progressText);
});

// Handle callback queries (inline keyboard buttons)
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  bot.answerCallbackQuery(callbackQuery.id);
  
  if (data.startsWith('vocab_')) {
    const category = data.split('_')[1];
    let text = `📚 ${category.charAt(0).toUpperCase() + category.slice(1)} Vocabulary:\n\n`;
    
    Object.entries(vocabulary[category]).forEach(([italian, english]) => {
      text += `• ${italian} = ${english}\n`;
    });
    
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: callbackQuery.message.message_id
    });
  } else if (data.startsWith('quiz_')) {
    const category = data.split('_')[1];
    const words = Object.entries(vocabulary[category]);
    if (words.length > 0) {
      const [italianWord, englishTranslation] = words[0];
      const quizText = `🎯 Quiz: What does '${italianWord}' mean in English?`;
      
      bot.editMessageText(quizText, {
        chat_id: chatId,
        message_id: callbackQuery.message.message_id
      });
    }
  }
});

// Handle tutor mode messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  // Skip if it's a command or user is not in tutor mode
  if (text.startsWith('/') || !userData.tutorMode.get(userId)) {
    return;
  }
  
  if (!openaiClient) {
    bot.sendMessage(chatId, '❌ Tutor mode is not available.');
    return;
  }
  
  try {
    bot.sendMessage(chatId, '👨‍🏫 Thinking...');
    
    // Get conversation history
    if (!userData.conversationHistory.has(userId)) {
      userData.conversationHistory.set(userId, []);
    }
    
    const history = userData.conversationHistory.get(userId);
    history.push({ role: 'user', content: text });
    
    // Keep only last 10 messages to avoid token limit
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: 'You are an enthusiastic Italian language teacher for A2 level students. You should:\n' +
        '- Always respond in a friendly, encouraging way\n' +
        '- Correct mistakes gently and explain grammar clearly\n' +
        '- Provide Italian examples with English translations\n' +
        '- Ask interesting follow-up questions to keep conversation going\n' +
        '- Use emojis to make learning fun\n' +
        '- Focus on practical Italian for daily use\n' +
        '- Remember what we talked about before and reference it\n' +
        '- Challenge the student with new vocabulary\n' +
        '- Make the conversation natural and engaging'
      },
      ...history
    ];
    
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 400,
      temperature: 0.8
    });
    
    const answer = response.choices[0].message.content;
    
    // Add AI response to history
    history.push({ role: 'assistant', content: answer });
    
    // Update progress
    if (!userData.userProgress.has(userId)) {
      userData.userProgress.set(userId, { wordsLearned: 0, conversations: 0, level: 'A2', streak: 0 });
    }
    
    const progress = userData.userProgress.get(userId);
    progress.conversations++;
    userData.userProgress.set(userId, progress);
    
    bot.sendMessage(chatId, `👨‍🏫 ${answer}`);
    
  } catch (error) {
    console.error('OpenAI API error in tutor mode:', error);
    bot.sendMessage(chatId, '❌ Sorry, I couldn\'t process your message. Please try again.');
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down bot...');
  bot.stopPolling();
  process.exit(0);
});

// Test API connections
async function testConnections() {
  try {
    // Test Telegram API
    console.log('🔍 Testing Telegram API connection...');
    const me = await bot.getMe();
    console.log('✅ Telegram API connected successfully');
    console.log(`🤖 Bot username: @${me.username}`);
    console.log(`📛 Bot name: ${me.first_name}`);
    
    // Test OpenAI API if available
    if (openaiClient) {
      console.log('🔍 Testing OpenAI API connection...');
      try {
        const response = await openaiClient.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        });
        console.log('✅ OpenAI API connected successfully');
      } catch (error) {
        console.error('❌ OpenAI API test failed:', error.message);
      }
    }
    
    // Send startup notification to admin (optional)
    // You can add your Telegram user ID here to get notified when bot starts
    // const adminId = 'YOUR_TELEGRAM_USER_ID';
    // bot.sendMessage(adminId, '🇮🇹 Italian Learning Bot is now online!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.code === 'ETELEGRAM' && error.response?.body?.error_code === 409) {
      console.error('🚨 CONFLICT DETECTED: Another bot instance is running!');
      console.error('💡 Solutions:');
      console.error('   1. Stop all other bot instances');
      console.error('   2. Wait 30 seconds and restart');
      console.error('   3. Check if bot is deployed elsewhere');
      process.exit(1);
    }
  }
}

// Start the bot
console.log('🇮🇹 Italian Learning Bot is starting...');
console.log('⏳ Testing API connections...');

testConnections().then(() => {
  console.log('✅ Bot is running! Press Ctrl+C to stop.');
}).catch((error) => {
  console.error('❌ Failed to start bot:', error.message);
  process.exit(1);
});
