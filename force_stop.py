#!/usr/bin/env python3
"""
Force stop any polling instances by setting a webhook
"""

import requests
import time

BOT_TOKEN = "8438587828:AAEl6hE_JKw891uA_6k8R16e9FGcOox7Qes"

def force_stop_polling():
    """Force stop any polling instances by setting a webhook"""
    try:
        # Set a dummy webhook to stop polling
        print("🛑 Setting webhook to stop polling...")
        response = requests.post(f'https://api.telegram.org/bot{BOT_TOKEN}/setWebhook', 
                               data={'url': 'https://example.com/dummy'})
        print(f"Webhook set: {response.status_code}")
        
        # Wait for polling to stop
        print("⏳ Waiting 5 seconds for polling to stop...")
        time.sleep(5)
        
        # Delete the webhook
        print("🗑️ Deleting webhook...")
        response = requests.post(f'https://api.telegram.org/bot{BOT_TOKEN}/deleteWebhook')
        print(f"Webhook deleted: {response.status_code}")
        
        # Wait a bit more
        print("⏳ Waiting 3 seconds...")
        time.sleep(3)
        
        print("✅ Force stop completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    force_stop_polling()
