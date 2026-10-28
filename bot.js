const mineflayer = require('mineflayer');

// Bot sozlamalari
const CONFIG = {
  host: 'verosara.mangoohost.live', // Server IP manzili
  port: 21548,                      // Port raqami
  username: 'aurora',              // Botning o'yinchi nomi
  password: 'auroraaurora',           // Parol (Login / Register uchun)
  version: '1.16.5',                // Minecraft versiyasi
  owner: 'verot',                   // Sizning o'yinchi nomingiz (Boshqaruvchi)
  reconnectDelay: 10000             // Qayta ulanish vaqti (milli sekundda - 10 sekund)
};

function createBot() {
  console.log(`[BOT] Serverga ulanmoqda: ${CONFIG.host}:${CONFIG.port} (${CONFIG.username})`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    hideErrors: false
  });

  // Serverga muvaffaqiyatli kirganda
  bot.on('spawn', () => {
    console.log('[BOT] Serverga muvaffaqiyatli ulandi va spawn bo\'ldi!');

    // Avto Register va Login (2 sekund kechikish bilan)
    setTimeout(() => {
      bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
      bot.chat(`/login ${CONFIG.password}`);
      console.log('[BOT] Autentifikatsiya buyruqlari yuborildi.');
    }, 2000);

    // 1. Har 1 minutda (60000 ms) o'tirib turish (Anti-AFK / Harakat)
    if (bot.crouchInterval) clearInterval(bot.crouchInterval);
    bot.crouchInterval = setInterval(() => {
      if (bot.entity) {
        bot.setControlState('sneak', true); // O'tirish
        setTimeout(() => {
          bot.setControlState('sneak', false); // Turish
          console.log('[Anti-AFK] Bot o\'tirib turdi.');
        }, 1000); // 1 sekund o'tirib turadi
      }
    }, 60000);

    // 2. Har 30 minutda (1800000 ms) chatga xabar yuborish
    if (bot.chatInterval) clearInterval(bot.chatInterval);
    bot.chatInterval = setInterval(() => {
      bot.chat(' assalomu alaykum serverdagilar .');
      console.log('[Chat] Reklama xabari yuborildi.');
    }, 1800000);
  });

  // Chat xabarlarini o'qish va buyruqlarga javob berish
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    console.log(`[CHAT] <${username}> ${message}`);

    // Agar buyruqni egasi (owner) yozsa
    if (username.toLowerCase() === CONFIG.owner.toLowerCase()) {
      if (message === '!ping') {
        bot.chat(`Pong! Bot ishlab turibdi.`);
      } else if (message === '!pos') {
        const pos = bot.entity.position;
        bot.chat(`Koordinatalar: X: ${pos.x.toFixed(1)}, Y: ${pos.y.toFixed(1)}, Z: ${pos.z.toFixed(1)}`);
      } else if (message === '!stop') {
        bot.chat(`O'chirilmoqda...`);
        process.exit(0);
      }
    }
  });

  // Xatoliklarni ushlash
  bot.on('error', (err) => {
    console.error('[XATOLIK]:', err.message);
  });

  // Ulanish uzilganda intervalni tozalab, qayta ulanish
  bot.on('end', (reason) => {
    console.warn(`[DIQQAT] Serverdan uzildi. Sabab: ${reason}`);
    if (bot.crouchInterval) clearInterval(bot.crouchInterval);
    if (bot.chatInterval) clearInterval(bot.chatInterval);
    
    console.log(`[BOT] ${CONFIG.reconnectDelay / 1000} soniyadan keyin qayta ulanadi...`);
    setTimeout(createBot, CONFIG.reconnectDelay);
  });

  // Kick qilinganda
  bot.on('kicked', (reason) => {
    console.warn(`[KICK] Bot serverdan haydaldi:`, reason);
  });
}

// Botni ishga tushirish
createBot();