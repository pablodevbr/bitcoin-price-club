// Telegram Bot API Broadcast Utilities

export interface TelegramBroadcastResult {
  ok: boolean;
  skipped?: boolean;
  messageId?: number;
  description?: string;
}

/**
 * Checks if Telegram credentials are valid and not placeholders.
 */
function isValidTelegramConfig(token?: string, chatId?: string): boolean {
  if (!token || !chatId) return false;
  if (token.includes('token_do_botfather') || token.includes('...') || token.length < 10) return false;
  if (chatId.includes('seu_canal') || chatId.includes('...')) return false;
  return true;
}

/**
 * Sends a daily snapshot broadcast to the Telegram channel with dynamic card and formatted caption.
 * Skips gracefully if credentials are not configured.
 * @param photoUrl - Public URL of the generated OG / card image
 * @param caption - Formatted message text (HTML supported)
 */
export async function sendTelegramBroadcast(
  photoUrl: string,
  caption: string
): Promise<TelegramBroadcastResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;

  // If credentials are not configured yet, skip gracefully without throwing error
  if (!isValidTelegramConfig(token, chatId)) {
    console.info('Telegram broadcast skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not configured.');
    return {
      ok: false,
      skipped: true,
      description: 'Telegram broadcast skipped: credentials not configured.',
    };
  }

  const baseTelegramUrl = `https://api.telegram.org/bot${token}`;

  // 1. Try sending photo with caption if photoUrl is available
  if (photoUrl && photoUrl.trim().length > 0) {
    try {
      const photoResponse = await fetch(`${baseTelegramUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: caption,
          parse_mode: 'HTML',
        }),
      });

      const photoData = await photoResponse.json();

      if (photoData.ok) {
        return {
          ok: true,
          messageId: photoData.result?.message_id,
        };
      }

      console.warn('sendPhoto failed, falling back to text sendMessage:', photoData.description);
    } catch (photoError) {
      console.warn('Network error while dispatching photo to Telegram:', photoError);
    }
  }

  // 2. Fallback to sending text message
  try {
    const textResponse = await fetch(`${baseTelegramUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: caption,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const textData = await textResponse.json();

    return {
      ok: Boolean(textData.ok),
      messageId: textData.result?.message_id,
      description: textData.description,
    };
  } catch (error) {
    console.error('Telegram broadcast error:', error);
    return {
      ok: false,
      description: error instanceof Error ? error.message : 'Unknown Telegram error',
    };
  }
}
