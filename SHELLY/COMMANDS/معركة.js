module.exports.config = {
  name: "معركة",
  Auth: 0,
  Class: "ألعاب",
  Owner: "محمد",
  Hide: false,
  How: "معركة [بدء/حديقة/رتبة]",
  Multi: ["battle", "fight"],
  Time: 5,
  Info: "معركة دورا - قاتل الوحوش واربح النقاط"
};

const battles = new Map();
const playerStats = new Map();

const monsters = {
  "تمساح النيل": { 
    emoji: "🐊", 
    hp: 100, 
    attack: 20, 
    reward: 50, 
    xp: 15,
    hasShield: true,
    name: "تمساح النيل"
  },
  "عنكبوت صحراوي": { 
    emoji: "🕷️", 
    hp: 60, 
    attack: 15, 
    reward: 30, 
    xp: 10,
    hasPoison: true,
    name: "عنكبوت صحراوي"
  },
  "شيطان الجبال": { 
    emoji: "🐐", 
    hp: 80, 
    attack: 18, 
    reward: 40, 
    xp: 12,
    canJump: true,
    name: "شيطان الجبال"
  },
  "أفعى البلّوط": { 
    emoji: "🐍", 
    hp: 50, 
    attack: 12, 
    reward: 25, 
    xp: 8,
    hasPoison: true,
    name: "أفعى البلّوط"
  }
};

const moves = {
  "لكمة": { damage: 15, selfDamage: 0, special: null },
  "ركله": { damage: 10, selfDamage: 2, special: "احتمال ضرب نفسك" },
  "صفعة": { damage: 5, selfDamage: 0, special: null },
  "رمي حجر": { damage: 12, selfDamage: 0, special: "يخترق الدرع" },
  "صرخة": { damage: 0, selfDamage: 0, special: "يربك الخصم" },
  "استخدام تفاح": { damage: 0, selfDamage: -20, special: "يشفي" },
  "استسلام": { damage: -999, selfDamage: 0, special: "خسارة" }
};

const battleMessages = [
  "الوحش يزمجر غاضبًا!",
  "لقد وجّهت ضربة قوية!",
  "🍀 نبات الحديقة يشجعك ويزيد قوتك!",
  "💨 رياح قوية تبطئ الوحش!",
  "✨ لقد اكتشفت ضعف الوحش!"
];

function getRandomMonster() {
  const monsterNames = Object.keys(monsters);
  return monsters[monsterNames[Math.floor(Math.random() * monsterNames.length)]];
}

function getPlayerStats(userId) {
  if (!playerStats.has(userId)) {
    playerStats.set(userId, {
      level: 1,
      xp: 0,
      wins: 0,
      losses: 0,
      totalPoints: 0,
      inventory: {
        تفاح: 3,
        سمسم: 2,
        درع: 0,
        عصا: 0,
        سكين: 0
      }
    });
  }
  return playerStats.get(userId);
}

function savePlayerStats(userId, stats) {
  playerStats.set(userId, stats);
}

module.exports.onPick = async function({ args, event, sh, usersData }) {
  const userId = event.senderID;
  const command = args[0]?.toLowerCase();

  if (command === "رتبة" || command === "احصائيات") {
    const stats = getPlayerStats(userId);
    const userData = await usersData.get(userId);
    const userName = userData.name || "لاعب";
    
    return sh.reply(`◈ ──『 ❀ إحصائيات ${userName} ❀ 』── ◈
❁┊🎖️ المستوى: ${stats.level}
❁┊⭐ الخبرة: ${stats.xp} XP
❁┊🏆 الانتصارات: ${stats.wins}
❁┊💔 الخسائر: ${stats.losses}
❁┊💰 مجموع النقاط: ${stats.totalPoints}
❁┊🍎 تفاح: ${stats.inventory.تفاح}
❁┊🌾 سمسم: ${stats.inventory.سمسم}
◈ ──────────── ◈`);
  }

  if (command === "حديقة") {
    const stats = getPlayerStats(userId);
    return sh.reply(`◈ ──『 ❀ حديقتك المدهشة ❀ 』── ◈
❁┊🎒 المخزون:
❁┊🍎 تفاح: ${stats.inventory.تفاح} (صحة +20)
❁┊🌾 سمسم: ${stats.inventory.سمسم} (صحة +15)
❁┊🛡️ درع: ${stats.inventory.درع} (تقليل ضرر)
❁┊🪓 عصا: ${stats.inventory.عصا} (زيادة ضرر +10)
❁┊🗡️ سكين: ${stats.inventory.سكين} (زيادة ضرر +15)

❁┊💡 نصيحة: اربح المعارك لتحصل على موارد!
◈ ──────────── ◈`);
  }

  if (command === "قواعد") {
    return sh.reply(`◈ ──『 ❀ قواعد المعركة ❀ 』── ◈

❁┊⚔️ الحركات المتاحة:
❁┊• لكمة (ضرر: 15)
❁┊• ركله (ضرر: 10، احذر!)
❁┊• صفعة (ضرر: 5)
❁┊• رمي حجر (ضرر: 12)
❁┊• صرخة (يربك الخصم)
❁┊• استخدام تفاح (شفاء +20)
❁┊• استسلام (خسارة)

❁┊🎮 كيف تلعب:
❁┊1️⃣ اكتب "معركة بدء" لبدء معركة
❁┊2️⃣ اختر حركتك في كل دور
❁┊3️⃣ اهزم الوحش لتربح النقاط!

◈ ──────────── ◈`);
  }

  if (!command || command === "بدء" || command === "start") {
    if (battles.has(userId)) {
      return sh.reply("◈ ──『 ❀ ❀ 』── ◈\n❁┊⚠️ لديك معركة قائمة بالفعل!\n◈ ──────────── ◈");
    }

    const monster = getRandomMonster();
    const userData = await usersData.get(userId);
    const userName = userData.name || "المحارب";
    
    const battle = {
      userId: userId,
      userName: userName,
      playerHp: 100,
      monsterHp: monster.hp,
      monster: monster,
      round: 1,
      stunned: false,
      shieldActive: false
    };

    battles.set(userId, battle);

    const shieldText = monster.hasShield ? "\n❁┊🛡 هذا الوحش لديه درع طبيعي!" : "";

    const sent = await sh.reply(`◈ ──『 ❀ بدء المعركة - حديقتك المدهشة ❀ 』── ◈
❁┊🔥 التحدي بين: ${userName} 🆚 ${monster.name} ${monster.emoji}${shieldText}

❁┊⚔ دورك الآن: ${userName}
❁┊🩸 دمك: ${battle.playerHp} ❣ | دم الخصم: ${battle.monsterHp}
❁┊🕹 اختر حركتك:
❁┊لكمة • ركله • صفعة • رمي حجر
❁┊صرخة • استخدام تفاح • استسلام

◈ ──────────── ◈`);

    if (sent && sent.messageID) {
      global.shelly.Reply.push({
        name: "معركة",
        ID: sent.messageID,
        author: userId,
        type: "battle"
      });
    }
  }
};

module.exports.Reply = async function({ event, sh, Reply, usersData }) {
  if (Reply.type !== "battle" || Reply.author !== event.senderID) return;

  const userId = event.senderID;
  const move = event.body.trim();

  if (!battles.has(userId)) {
    return sh.reply("◈ ──『 ❀ ❀ 』── ◈\n❁┊❌ لا توجد معركة نشطة\n◈ ──────────── ◈");
  }

  const battle = battles.get(userId);
  const moveData = moves[move];

  if (!moveData) {
    return sh.reply("◈ ──『 ❀ ❀ 』── ◈\n❁┊⚠️ حركة غير صحيحة! اختر من القائمة\n◈ ──────────── ◈");
  }

  // Handle surrender
  if (move === "استسلام") {
    battles.delete(userId);
    const stats = getPlayerStats(userId);
    stats.losses++;
    savePlayerStats(userId, stats);
    return sh.reply(`◈ ──『 ❀ نهاية المعركة ❀ 』── ◈
❁┊💀 لقد استسلمت!
❁┊📊 الخسائر: ${stats.losses}
◈ ──────────── ◈`);
  }

  // Handle healing
  if (move === "استخدام تفاح") {
    const stats = getPlayerStats(userId);
    if (stats.inventory.تفاح <= 0) {
      return sh.reply("◈ ──『 ❀ ❀ 』── ◈\n❁┊❌ ليس لديك تفاح!\n◈ ──────────── ◈");
    }
    stats.inventory.تفاح--;
    battle.playerHp = Math.min(100, battle.playerHp + 20);
    savePlayerStats(userId, stats);
  }

  let playerDamage = moveData.damage;
  let selfDamage = moveData.selfDamage;

  // Random chance for kick to hurt self
  if (move === "ركله" && Math.random() < 0.3) {
    battle.playerHp -= 2;
  }

  // Handle stun from scream
  if (move === "صرخة") {
    battle.stunned = true;
    playerDamage = 0;
  }

  // Pierce shield with stone
  const pierceShield = move === "رمي حجر" && Math.random() < 0.4;

  // Apply shield reduction
  if (battle.monster.hasShield && !pierceShield && playerDamage > 0) {
    playerDamage = Math.floor(playerDamage * 0.7);
  }

  // Deal damage to monster
  battle.monsterHp -= playerDamage;

  // Random battle message
  const randomMsg = battleMessages[Math.floor(Math.random() * battleMessages.length)];

  let resultText = `◈ ──『 ❀ الجولة ${battle.round} ❀ 』── ◈\n`;
  resultText += `❁┊🌿 حركتك: ${move}\n`;
  
  if (playerDamage > 0) {
    resultText += `❁┊💥 ضرر: ${playerDamage}\n`;
    if (pierceShield) resultText += `❁┊🪨 اخترقت الدرع!\n`;
  }
  
  if (move === "استخدام تفاح") {
    resultText += `❁┊💚 شفاء +20\n`;
  }

  if (move === "صرخة") {
    resultText += `❁┊😱 الوحش مربوك! سيفقد دوره\n`;
  }

  resultText += `❁┊✨ ${randomMsg}\n`;

  // Check if monster is defeated
  if (battle.monsterHp <= 0) {
    battles.delete(userId);
    const stats = getPlayerStats(userId);
    stats.wins++;
    stats.xp += battle.monster.xp;
    stats.totalPoints += battle.monster.reward;
    
    // Add points to user balance
    await usersData.set(userId, (await usersData.get(userId)).money + battle.monster.reward, "money");
    
    // Random rewards
    if (Math.random() < 0.5) stats.inventory.تفاح += 1;
    if (Math.random() < 0.3) stats.inventory.سمسم += 1;
    
    // Level up check
    const newLevel = Math.floor(stats.xp / 50) + 1;
    const leveledUp = newLevel > stats.level;
    stats.level = newLevel;
    
    savePlayerStats(userId, stats);

    resultText += `\n◈ ──『 ❀ 🎉 انتصرت! ❀ 』── ◈\n`;
    resultText += `❁┊💰 مكافأة: ${battle.monster.reward} نقطة\n`;
    resultText += `❁┊🌟 خبرة: +${battle.monster.xp} XP\n`;
    resultText += `❁┊🏆 انتصارات: ${stats.wins}\n`;
    if (leveledUp) resultText += `❁┊⬆️ مستوى جديد: ${stats.level}!\n`;
    resultText += `◈ ──────────── ◈`;

    return sh.reply(resultText);
  }

  // Monster's turn (if not stunned)
  let monsterDamage = 0;
  if (!battle.stunned) {
    monsterDamage = battle.monster.attack;
    
    // Random monster attacks
    const attacks = [
      { name: "عضة", emoji: "🦷" },
      { name: "موجة ذيل", emoji: "🌊" },
      { name: "مخالب", emoji: "🔪" },
      { name: "هجوم سريع", emoji: "⚡" }
    ];
    const attack = attacks[Math.floor(Math.random() * attacks.length)];
    
    battle.playerHp -= monsterDamage;
    
    resultText += `\n❁┊👾 صحة ${battle.monster.name}: ${battle.monsterHp}\n`;
    resultText += `❁┊${attack.emoji} رد الوحش: ${attack.name}! ضرر: ${monsterDamage}\n`;
  } else {
    battle.stunned = false;
    resultText += `\n❁┊👾 صحة ${battle.monster.name}: ${battle.monsterHp}\n`;
    resultText += `❁┊😵 الوحش لا يزال مربوكاً!\n`;
  }

  resultText += `❁┊❤️ دمك: ${battle.playerHp}\n`;

  // Check if player is defeated
  if (battle.playerHp <= 0) {
    battles.delete(userId);
    const stats = getPlayerStats(userId);
    stats.losses++;
    savePlayerStats(userId, stats);

    resultText += `\n◈ ──『 ❀ 💀 خسرت المعركة! ❀ 』── ◈\n`;
    resultText += `❁┊⏳ تعافى وحاول مرة أخرى\n`;
    resultText += `❁┊📊 الخسائر: ${stats.losses}\n`;
    resultText += `◈ ──────────── ◈`;

    return sh.reply(resultText);
  }

  // Continue battle
  battle.round++;
  battles.set(userId, battle);

  resultText += `\n❁┊🕹 اختر حركتك التالية:\n`;
  resultText += `❁┊لكمة • ركله • صفعة • رمي حجر\n`;
  resultText += `❁┊صرخة • استخدام تفاح • استسلام\n`;
  resultText += `◈ ──────────── ◈`;

  const sent = await sh.reply(resultText);

  if (sent && sent.messageID) {
    global.shelly.Reply.push({
      name: "معركة",
      ID: sent.messageID,
      author: userId,
      type: "battle"
    });
  }
};