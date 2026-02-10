const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "قبيلة",
  aliases: ["خمر", "مجلس", "خيمة", "تخمير", "دعوة"],
  Auth: 0,
  by: "شيخ القبيلة العظيم 👑",
  desc: "نظام التجارة الجاهلية - الخمر والدعارة",
  guide: 
    "🏜️ أوامر التجارة الجاهلية:\n\n" +
    "• خمر [عدد] [نوع] - صنع خمر\n" +
    "• مجلس - فتح مجلس الخمر\n" +
    "• خيمة - فتح خيمة المتعة\n" +
    "• تخمير [عدد] - تحسين الخمر\n" +
    "• دعوة - جذب ضيوف\n" +
    "• قبيلتي - عرض إحصائياتك"
};

const dataPath = path.join(__dirname, "tribal_business.json");

// أنواع الخمر ومواصفاتها
const WINE_TYPES = {
  'عادي': { 
    price: 10000, 
    profit: 1.3, 
    time: 4, 
    emoji: '🏺',
    bonus: 0
  },
  'قديم': { 
    price: 15000, 
    profit: 1.6, 
    time: 6, 
    emoji: '🍷',
    bonus: 0.3
  },
  'فاخر': { 
    price: 20000, 
    profit: 2.0, 
    time: 8, 
    emoji: '🏺✨',
    bonus: 0.6
  }
};

// مستويات الجواري
const SLAVE_LEVELS = {
  1: { price: 50000, profit: 1.2, emoji: '👸' },
  2: { price: 100000, profit: 1.5, emoji: '👸✨' },
  3: { price: 200000, profit: 2.0, emoji: '👸💎' }
};

/**
 * تحميل البيانات
 */
function loadData() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, "{}");
  }
  return JSON.parse(fs.readFileSync(dataPath));
}

/**
 * حفظ البيانات
 */
function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

/**
 * تهيئة بيانات المستخدم
 */
function initUser(userId, data) {
  if (!data[userId]) {
    data[userId] = {
      gold: 500000, // رصيد البداية
      wine: {
        stock: {},
        fermenting: []
      },
      brothel: {
        slaves: [],
        level: 1
      },
      stats: {
        totalEarnings: 0,
        totalCustomers: 0,
        fights: 0,
        raids: 0
      },
      lastAction: 0
    };
    saveData(data);
  }
  return data[userId];
}

/**
 * حساب عشوائي
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * تنسيق الأرقام
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * صنع الخمر
 */
async function makeWine(userId, amount, type, data, sh) {
  const user = initUser(userId, data);
  
  if (!WINE_TYPES[type]) {
    return sh.reply(
      `⚠️ نوع خمر غير معروف!\n\n` +
      `الأنواع المتاحة:\n` +
      `🏺 عادي - ${formatNumber(WINE_TYPES['عادي'].price)} ج.س\n` +
      `🍷 قديم - ${formatNumber(WINE_TYPES['قديم'].price)} ج.س\n` +
      `🏺✨ فاخر - ${formatNumber(WINE_TYPES['فاخر'].price)} ج.س`
    );
  }
  
  const wineData = WINE_TYPES[type];
  const totalCost = wineData.price * amount;
  
  if (user.gold < totalCost) {
    return sh.reply(
      `💰 ما يكفي ذهب يا شيخ!\n\n` +
      `محتاج: ${formatNumber(totalCost)} ج.س\n` +
      `عندك: ${formatNumber(user.gold)} ج.س\n` +
      `ينقصك: ${formatNumber(totalCost - user.gold)} ج.س`
    );
  }
  
  user.gold -= totalCost;
  
  const readyTime = Date.now() + (wineData.time * 3600000);
  
  user.wine.fermenting.push({
    type: type,
    amount: amount,
    readyTime: readyTime,
    emoji: wineData.emoji
  });
  
  saveData(data);
  
  return sh.reply(
    `👑🍷 يا سيد المجلس!\n\n` +
    `${wineData.emoji} صنعت ${amount} جرة نبيذ تمر ${type}\n` +
    `💰 تكلفة: ${formatNumber(totalCost)} ج.س\n` +
    `⏳ جاهز للبيع بعد ${wineData.time} ساعات تخمير\n\n` +
    `📊 رصيدك: ${formatNumber(user.gold)} ج.س\n` +
    `🏺 تحت التخمير: ${user.wine.fermenting.length} دفعة`
  );
}

/**
 * فتح مجلس الخمر
 */
async function openTavern(userId, data, sh) {
  const user = initUser(userId, data);
  const now = Date.now();
  
  // نقل الخمر الجاهز من التخمير للمخزون
  const ready = user.wine.fermenting.filter(w => w.readyTime <= now);
  const notReady = user.wine.fermenting.filter(w => w.readyTime > now);
  
  ready.forEach(w => {
    if (!user.wine.stock[w.type]) user.wine.stock[w.type] = 0;
    user.wine.stock[w.type] += w.amount;
  });
  
  user.wine.fermenting = notReady;
  
  // حساب إجمالي المخزون
  const totalStock = Object.values(user.wine.stock).reduce((a, b) => a + b, 0);
  
  if (totalStock === 0) {
    saveData(data);
    return sh.reply(
      `❌ يا سيدي المجلس فاضي!\n\n` +
      `🏺 ما عندك خمر جاهز للبيع\n` +
      `⏳ تحت التخمير: ${notReady.length} دفعة\n\n` +
      `💡 استخدم: خمر [عدد] [نوع]`
    );
  }
  
  // حساب الأرباح
  let totalProfit = 0;
  let customers = 0;
  let bonusPercent = 0;
  let usedWine = {};
  
  for (const [type, amount] of Object.entries(user.wine.stock)) {
    if (amount > 0) {
      const wineData = WINE_TYPES[type];
      const sell = Math.min(amount, random(10, 30));
      const profit = sell * wineData.price * wineData.profit;
      
      totalProfit += profit;
      customers += sell * random(2, 4);
      bonusPercent += wineData.bonus;
      
      usedWine[type] = sell;
      user.wine.stock[type] -= sell;
    }
  }
  
  // مكافأة الخمر الفاخر
  totalProfit *= (1 + bonusPercent);
  
  const netProfit = Math.floor(totalProfit * 0.85);
  user.gold += netProfit;
  user.stats.totalEarnings += netProfit;
  user.stats.totalCustomers += customers;
  
  // احتمال مشاجرة
  const fightChance = random(1, 100);
  let fightMsg = '';
  
  if (fightChance <= 12) {
    const damage = Math.floor(netProfit * 0.15);
    user.gold -= damage;
    user.stats.fights++;
    fightMsg = `\n⚔️ تحذير: وقعت مشاجرة! خسارة ${formatNumber(damage)} ج.س`;
  }
  
  saveData(data);
  
  const wineUsed = Object.entries(usedWine)
    .map(([t, a]) => `${WINE_TYPES[t].emoji} ${a} ${t}`)
    .join(' + ');
  
  return sh.reply(
    `👑🍷 يا كريم الجاهلية!\n\n` +
    `🏛️ فتحت مجلسك الكبير والخمر يتدفق!\n` +
    `🍷 بيع: ${wineUsed}\n` +
    `👥 ضيوف: ${customers} رجل\n` +
    `💰 إيرادات: ${formatNumber(Math.floor(totalProfit))} ج.س\n` +
    `✅ ربح صافي: +${formatNumber(netProfit)} ج.س\n` +
    `${bonusPercent > 0 ? `🌟 مكافأة خمر فاخر: +${Math.floor(bonusPercent * 100)}٪\n` : ''}` +
    `${fightMsg}\n\n` +
    `📊 رصيدك: ${formatNumber(user.gold)} ج.س\n` +
    `🎁 الضيوف السكارى توجهوا لخيمة المتعة!`
  );
}

/**
 * فتح خيمة المتعة
 */
async function openBrothel(userId, data, sh) {
  const user = initUser(userId, data);
  
  if (user.brothel.slaves.length === 0) {
    return sh.reply(
      `❌ يا صاحب الليالي!\n\n` +
      `👸 ما عندك جواري في الخيمة!\n\n` +
      `💡 اشتري جواري أولاً:\n` +
      `• جارية مستوى 1 - ${formatNumber(SLAVE_LEVELS[1].price)} ج.س\n` +
      `• جارية مستوى 2 - ${formatNumber(SLAVE_LEVELS[2].price)} ج.س\n` +
      `• جارية مستوى 3 - ${formatNumber(SLAVE_LEVELS[3].price)} ج.س`
    );
  }
  
  // حساب الأرباح
  let totalProfit = 0;
  let customers = 0;
  
  user.brothel.slaves.forEach(slave => {
    const slaveData = SLAVE_LEVELS[slave.level];
    const customerCount = random(8, 15);
    const profit = customerCount * slaveData.price * slaveData.profit;
    
    totalProfit += profit;
    customers += customerCount;
  });
  
  // مكافأة من الخمر
  const wineBonus = 0.4;
  totalProfit *= (1 + wineBonus);
  
  const netProfit = Math.floor(totalProfit * 0.85);
  user.gold += netProfit;
  user.stats.totalEarnings += netProfit;
  user.stats.totalCustomers += customers;
  
  // احتمال مشاجرة أو غزو
  const riskChance = random(1, 100);
  let riskMsg = '';
  
  if (riskChance <= 12) {
    const damage = Math.floor(netProfit * 0.2);
    user.gold -= damage;
    
    if (riskChance <= 6) {
      user.stats.raids++;
      riskMsg = `\n⚔️🔥 غزو حسد! قبيلة معادية هاجمت! خسارة ${formatNumber(damage)} ج.س`;
    } else {
      user.stats.fights++;
      riskMsg = `\n⚔️ مشاجرة كبيرة! خسارة ${formatNumber(damage)} ج.س`;
    }
  }
  
  saveData(data);
  
  return sh.reply(
    `👑🔥👸 يا صاحب الليالي الحمراء!\n\n` +
    `🏕️ خيمة المتعة فتحت والخمر يصب!\n` +
    `👸 جواري عاملات: ${user.brothel.slaves.length}\n` +
    `🍷 زبائن سكارى: ${customers}\n` +
    `💰 إيرادات: ${formatNumber(Math.floor(totalProfit))} ج.س\n` +
    `✅ ربح صافي: +${formatNumber(netProfit)} ج.س\n` +
    `🌟 مكافأة خمر: +${Math.floor(wineBonus * 100)}٪\n` +
    `${riskMsg}\n\n` +
    `📊 رصيدك: ${formatNumber(user.gold)} ج.س\n` +
    `⚠️ خطر: ${riskChance <= 12 ? 'عالي' : 'منخفض'}`
  );
}

/**
 * تحسين الخمر
 */
async function fermentWine(userId, amount, data, sh) {
  const user = initUser(userId, data);
  
  const available = user.wine.stock['عادي'] || 0;
  
  if (available < amount) {
    return sh.reply(
      `❌ ما عندك خمر كافي!\n\n` +
      `🏺 مخزون الخمر العادي: ${available}\n` +
      `📝 طلبت: ${amount}`
    );
  }
  
  const cost = 5000 * amount;
  
  if (user.gold < cost) {
    return sh.reply(
      `💰 ما يكفي ذهب للتخمير!\n\n` +
      `محتاج: ${formatNumber(cost)} ج.س\n` +
      `عندك: ${formatNumber(user.gold)} ج.س`
    );
  }
  
  user.gold -= cost;
  user.wine.stock['عادي'] -= amount;
  
  if (!user.wine.stock['قديم']) user.wine.stock['قديم'] = 0;
  user.wine.stock['قديم'] += amount;
  
  saveData(data);
  
  return sh.reply(
    `👑🏺 يا صانع النبيذ!\n\n` +
    `🍷 حسّنت ${amount} جرة من عادي → قديم\n` +
    `💰 تكلفة: ${formatNumber(cost)} ج.س\n` +
    `🌟 الربح القادم سيزيد +30٪\n\n` +
    `📊 رصيدك: ${formatNumber(user.gold)} ج.س`
  );
}

/**
 * دعوة ضيوف
 */
async function inviteGuests(userId, data, sh) {
  const user = initUser(userId, data);
  const now = Date.now();
  
  // كل 4 ساعات
  if (user.lastAction && (now - user.lastAction) < 14400000) {
    const remaining = 14400000 - (now - user.lastAction);
    const hours = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    
    return sh.reply(
      `⏳ يا شيخ القبيلة!\n\n` +
      `انتظر ${hours}س ${mins}د قبل الدعوة القادمة`
    );
  }
  
  const cost = 50000;
  
  if (user.gold < cost) {
    return sh.reply(
      `💰 ما يكفي ذهب للدعوة!\n\n` +
      `محتاج: ${formatNumber(cost)} ج.س (خمر مجاني)\n` +
      `عندك: ${formatNumber(user.gold)} ج.س`
    );
  }
  
  user.gold -= cost;
  user.lastAction = now;
  
  const guests = random(30, 60);
  const profit = guests * random(5000, 8000);
  
  user.gold += profit;
  user.stats.totalEarnings += profit;
  user.stats.totalCustomers += guests;
  
  // احتمال فضيحة
  const scandalChance = random(1, 100);
  let scandalMsg = '';
  
  if (scandalChance <= 18) {
    scandalMsg = `\n⚠️ خطر الفضيحة زاد إلى 18٪!`;
  }
  
  saveData(data);
  
  return sh.reply(
    `👑🎉 يا جواد القبيلة!\n\n` +
    `🍷 وزعت خمر مجاني على التجار والفرسان\n` +
    `👥 جاء ${guests} ضيف إضافي!\n` +
    `💰 ربح اليوم: +${formatNumber(profit)} ج.س\n` +
    `${scandalMsg}\n\n` +
    `📊 رصيدك: ${formatNumber(user.gold)} ج.س`
  );
}

/**
 * عرض الإحصائيات
 */
async function showStats(userId, data, sh) {
  const user = initUser(userId, data);
  
  const totalWine = Object.values(user.wine.stock).reduce((a, b) => a + b, 0);
  const fermenting = user.wine.fermenting.length;
  
  return sh.reply(
    `👑🏜️ قبيلة الشيخ\n\n` +
    `💰 الذهب: ${formatNumber(user.gold)} ج.س\n\n` +
    `🍷 الخمر:\n` +
    `├─ المخزون: ${totalWine} جرة\n` +
    `├─ تحت التخمير: ${fermenting} دفعة\n` +
    `└─ ${Object.entries(user.wine.stock).map(([t, a]) => `${WINE_TYPES[t]?.emoji || '🏺'} ${t}: ${a}`).join(', ') || 'فاضي'}\n\n` +
    `🏕️ خيمة المتعة:\n` +
    `├─ الجواري: ${user.brothel.slaves.length}\n` +
    `└─ المستوى: ${user.brothel.level}\n\n` +
    `📊 الإحصائيات:\n` +
    `├─ إجمالي الأرباح: ${formatNumber(user.stats.totalEarnings)} ج.س\n` +
    `├─ إجمالي الزبائن: ${formatNumber(user.stats.totalCustomers)}\n` +
    `├─ المشاجرات: ${user.stats.fights}\n` +
    `└─ الغزوات: ${user.stats.raids}`
  );
}

/**
 * الأمر الرئيسي
 */
module.exports.onPick = async function({ sh, event, args, command }) {
  const userId = event.senderID;
  const data = loadData();
  
  try {
    switch(command) {
      case 'خمر':
        if (args.length < 2) {
          return sh.reply(
            `⚠️ استخدام خاطئ!\n\n` +
            `الطريقة الصحيحة:\n` +
            `خمر [عدد] [نوع]\n\n` +
            `مثال: خمر 20 فاخر`
          );
        }
        const amount = parseInt(args[0]);
        const type = args[1];
        
        if (isNaN(amount) || amount <= 0) {
          return sh.reply('⚠️ العدد يجب أن يكون رقم موجب!');
        }
        
        return await makeWine(userId, amount, type, data, sh);
        
      case 'مجلس':
        return await openTavern(userId, data, sh);
        
      case 'خيمة':
        return await openBrothel(userId, data, sh);
        
      case 'تخمير':
        if (args.length < 1) {
          return sh.reply(
            `⚠️ استخدام خاطئ!\n\n` +
            `الطريقة: تخمير [عدد]\n` +
            `مثال: تخمير 15`
          );
        }
        const fermentAmount = parseInt(args[0]);
        
        if (isNaN(fermentAmount) || fermentAmount <= 0) {
          return sh.reply('⚠️ العدد يجب أن يكون رقم موجب!');
        }
        
        return await fermentWine(userId, fermentAmount, data, sh);
        
      case 'دعوة':
        return await inviteGuests(userId, data, sh);
        
      case 'قبيلة':
      case 'قبيلتي':
        return await showStats(userId, data, sh);
        
      default:
        return sh.reply(
          `🏜️ أوامر القبيلة:\n\n` +
          `• خمر [عدد] [نوع] - صنع خمر\n` +
          `• مجلس - فتح مجلس الخمر\n` +
          `• خيمة - فتح خيمة المتعة\n` +
          `• تخمير [عدد] - تحسين الخمر\n` +
          `• دعوة - جذب ضيوف\n` +
          `• قبيلتي - إحصائياتك`
        );
    }
    
  } catch (error) {
    console.error('[Tribal Error]', error);
    return sh.reply('❌ حدث خطأ في النظام!');
  }
};

// تنظيف البيانات القديمة
setInterval(() => {
  const data = loadData();
  const now = Date.now();
  const oneMonth = 30 * 24 * 3600000;
  
  for (const [userId, user] of Object.entries(data)) {
    if (user.lastAction && (now - user.lastAction) > oneMonth) {
      delete data[userId];
    }
  }
  
  saveData(data);
}, 86400000); // كل يوم