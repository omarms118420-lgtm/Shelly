module.exports.config = {
  name: "جواري",
  Auth: 0,
  Owner: "شيخ القبيلة",
  Info: "نظام الجواري الجاهلي الكامل",
  Class: "القبيلة",
  Multi: ["سبي", "خيمة", "ترويض", "تكريم", "مزاد", "مجلس_غناء", "حريم"],
  Time: 0,
  How: "جواري [الأمر]"
};

module.exports.onPick = async function({ sh, event, args, usersData }) {
  const { senderID } = event;
  const command = args[0]?.toLowerCase();

  // الحصول على بيانات المستخدم
  let userData = await usersData.get(senderID);
  let userMoney = userData.money || 0;
  let haremData = userData.data?.harem || {
    slaves: [],
    totalSlaves: 0,
    lastOpen: 0,
    reputation: 50,
    fame: 0,
    totalEarnings: 0
  };

  // ===== أمر سبي/شراء جواري =====
  if (command === "سبي" || command === "شراء") {
    const amount = parseInt(args[1]);
    const type = args[2]?.toLowerCase() || "عادية";

    if (!amount || isNaN(amount) || amount <= 0) {
      return sh.reply(`◈ ──『 ❀ نظام الجواري ❀ 』── ◈

❁┊⚔️ سبي أو شراء جواري

❁┊📌 الاستخدام:
❁┊جواري سبي [عدد] [نوع]

❁┊👸 الأنواع:
❁┊• عادية → 60,000 ج.س
❁┊• فاخرة → 90,000 ج.س
❁┊• مغنية → 120,000 ج.س

❁┊💡 مثال: جواري سبي 7 فاخرة

◈ ──────────── ◈`);
    }

    if (amount > 20) {
      return sh.reply(`◈ ──『 ❀ شيخ القبيلة ❀ 』── ◈
❁┊⚠️ لا يمكن سبي أكثر من 20 جارية دفعة واحدة!
❁┊🏜️ الحريم محدود يا سيدي
◈ ──────────── ◈`);
    }

    let pricePerSlave, typeName, baseProfit, level;
    
    if (type === "عادية") {
      pricePerSlave = 60000;
      typeName = "حسناء عادية";
      baseProfit = 15000;
      level = 1;
    } else if (type === "فاخرة") {
      pricePerSlave = 90000;
      typeName = "فاخرة راقصة";
      baseProfit = 25000;
      level = 1;
    } else if (type === "مغنية") {
      pricePerSlave = 120000;
      typeName = "مغنية شاعرة";
      baseProfit = 35000;
      level = 1;
    } else {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊❌ نوع غير صحيح!
❁┊الأنواع: عادية، فاخرة، مغنية
◈ ──────────── ◈`);
    }

    const totalCost = amount * pricePerSlave;

    if (userMoney < totalCost) {
      return sh.reply(`◈ ──『 ❀ شيخ القبيلة ❀ 』── ◈
❁┊💸 خزينتك ما تسعف لهالسبي الكبير!
❁┊تحتاج: ${totalCost.toLocaleString()} ج.س
❁┊رصيدك: ${userMoney.toLocaleString()} ج.س فقط
◈ ──────────── ◈`);
    }

    // إضافة الجواري
    for (let i = 0; i < amount; i++) {
      haremData.slaves.push({
        id: Date.now() + i,
        type: typeName,
        level: level,
        loyalty: 30,
        profit: baseProfit,
        acquired: Date.now()
      });
    }

    haremData.totalSlaves = haremData.slaves.length;
    const dailyProfit = haremData.slaves.reduce((sum, s) => sum + s.profit, 0);

    await usersData.set(senderID, userMoney - totalCost, "money");
    await usersData.set(senderID, { harem: haremData }, "data");

    return sh.reply(`◈ ──『 ❀ فارس الرمال ❀ 』── ◈

❁┊⚔️ غنمت ${amount} ${typeName} من قافلة تجار الشام! 👸
❁┊🏜️ حسناوات ومغنيات يزينن حريمك

❁┊💰 تكلفة الغنيمة: ${totalCost.toLocaleString()} ج.س
❁┊📊 (${pricePerSlave.toLocaleString()} لكل واحدة)

❁┊⭐ مستواهن: ${level} (جديدات وخجولات)
❁┊⏳ يتأقلمن بعد 9 ساعات

❁┊💵 ربح متوقع يومي: ${dailyProfit.toLocaleString()} ج.س
❁┊👸 عدد الجواري الآن: ${haremData.totalSlaves}

❁┊🔥 افتح خيمة المتعة لجمع الأرباح!

◈ ──────────── ◈`);
  }

  // ===== أمر خيمة المتعة =====
  else if (command === "خيمة" || command === "متعة") {
    
    if (haremData.slaves.length === 0) {
      return sh.reply(`◈ ──『 ❀ سيد القبيلة ❀ 』── ◈
❁┊❌ ما عندك جواري في الحريم!
❁┊💡 اسبي جواري أولاً: جواري سبي 5 فاخرة
◈ ──────────── ◈`);
    }

    // كولداون 12 ساعة
    const cooldown = 43200000; // 12 hours
    if (Date.now() - haremData.lastOpen < cooldown) {
      const timeLeft = cooldown - (Date.now() - haremData.lastOpen);
      const hours = Math.floor(timeLeft / 3600000);
      const minutes = Math.floor((timeLeft % 3600000) / 60000);
      
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊⏳ الخيمة تحتاج راحة يا سيدي!
❁┊عد بعد: ${hours} ساعة و ${minutes} دقيقة
◈ ──────────── ◈`);
    }

    // حساب الأرباح
    const baseVisitors = Math.floor(Math.random() * 50) + 40; // 40-90
    let totalProfit = 0;
    let bonusMultiplier = 1;
    let bonusText = [];

    // حساب الربح من كل جارية
    for (const slave of haremData.slaves) {
      let slaveProfit = slave.profit;
      
      // مكافأة المستوى
      if (slave.level === 2) {
        slaveProfit *= 1.5;
      } else if (slave.level === 3) {
        slaveProfit *= 2;
      }
      
      totalProfit += slaveProfit;
    }

    // مكافأة الشهرة
    if (haremData.fame > 50) {
      bonusMultiplier += 0.35;
      bonusText.push("تكريم سابق: +35%");
    }

    // مكافأة المغنيات
    const singers = haremData.slaves.filter(s => s.type.includes("مغنية")).length;
    if (singers > 0) {
      bonusMultiplier += (singers * 0.1);
      bonusText.push(`مغنيات: +${singers * 10}%`);
    }

    // مكافأة الجواري الفاخرات
    const luxury = haremData.slaves.filter(s => s.level === 3).length;
    if (luxury > 0) {
      bonusMultiplier += 0.5;
      bonusText.push("ملكات حريم: +50%");
    }

    const rawEarnings = totalProfit * baseVisitors;
    const finalProfit = Math.floor(rawEarnings * bonusMultiplier);
    const netProfit = Math.floor(finalProfit * 0.85); // بعد المصاريف

    // احتمال الهروب للجواري الجديدات
    const escapeChance = haremData.slaves.filter(s => s.level === 1 && s.loyalty < 40).length * 0.05;
    const hasEscape = Math.random() < escapeChance;

    if (hasEscape) {
      // هروب جاريتين
      const escaped = haremData.slaves.splice(0, 2);
      haremData.totalSlaves = haremData.slaves.length;
      const loss = escaped.reduce((sum, s) => sum + 120000, 0);
      
      await usersData.set(senderID, userMoney + netProfit - loss, "money");
      await usersData.set(senderID, { harem: haremData }, "data");

      return sh.reply(`◈ ──『 ❀ سيد القبيلة ❀ 』── ◈

❁┊⚠️ فتحت خيمة المتعة لكن...

❁┊💔 هربت جاريتين مستوى 1 مع تاجر عابر! 🏃‍♀️
❁┊👸 الجواري الجديدات ما تروضن بعد

❁┊📊 الزوار: ${baseVisitors} رجل
❁┊💰 ربح خام: ${finalProfit.toLocaleString()} ج.س
❁┊💸 خسارة الهروب: ${loss.toLocaleString()} ج.س
❁┊✅ صافي الربح: +${netProfit.toLocaleString()} ج.س

❁┊⚠️ روّض الباقيات بسرعة!
❁┊👸 الجواري المتبقيات: ${haremData.totalSlaves}

◈ ──────────── ◈`);
    }

    // نجاح عادي
    haremData.lastOpen = Date.now();
    haremData.totalEarnings += netProfit;
    haremData.reputation = Math.min(100, haremData.reputation + 5);

    await usersData.set(senderID, userMoney + netProfit, "money");
    await usersData.set(senderID, { harem: haremData }, "data");

    const warning = haremData.reputation > 80 ? "\n❁┊⚠️ شهرة الخيمة عالية جدًا (10% احتمال غزو حسد)" : "";

    return sh.reply(`◈ ──『 ❀ سيد القبيلة ❀ 』── ◈

❁┊🔥 فتحت خيمة المتعة والغناء للفرسان! 👸💋🎶
❁┊🏜️ الشعراء والأثرياء يتوافدون

❁┊📊 الإحصائيات:
❁┊👥 الزوار: ${baseVisitors} رجل من القبائل
❁┊👸 الجواري العاملات: ${haremData.totalSlaves}

❁┊💰 الأرباح:
❁┊📈 غنيمة خام: ${rawEarnings.toLocaleString()} ج.س
❁┊✨ بعد المكافآت: ${finalProfit.toLocaleString()} ج.س
${bonusText.length > 0 ? bonusText.map(b => `❁┊🌟 ${b}`).join('\n') : ''}
❁┊💸 بعد المصاريف: +${netProfit.toLocaleString()} ج.س

❁┊💵 رصيدك الآن: ${(userMoney + netProfit).toLocaleString()} ج.س
❁┊📊 السمعة: ${haremData.reputation}%${warning}

◈ ──────────── ◈`);
  }

  // ===== أمر ترويض =====
  else if (command === "ترويض") {
    const amount = args[1] === "الكل" ? haremData.slaves.filter(s => s.level === 1).length : parseInt(args[1]);

    if (!amount || amount <= 0) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊📌 الاستخدام: جواري ترويض [عدد أو الكل]
❁┊💡 مثال: جواري ترويض 5
◈ ──────────── ◈`);
    }

    const toTame = haremData.slaves.filter(s => s.level === 1).slice(0, amount);

    if (toTame.length === 0) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊✅ كل جواريك مروضات بالفعل!
◈ ──────────── ◈`);
    }

    const cost = toTame.length * 30000;

    if (userMoney < cost) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊💸 لا تملك المال الكافي للترويض!
❁┊تحتاج: ${cost.toLocaleString()} ج.س
❁┊لديك: ${userMoney.toLocaleString()} ج.س
◈ ──────────── ◈`);
    }

    // ترقية المستوى
    for (const slave of toTame) {
      slave.level = 2;
      slave.loyalty = 70;
      slave.profit = Math.floor(slave.profit * 1.5);
    }

    await usersData.set(senderID, userMoney - cost, "money");
    await usersData.set(senderID, { harem: haremData }, "data");

    return sh.reply(`◈ ──『 ❀ حاكم الحريم ❀ 』── ◈

❁┊👑 تم ترويض ${toTame.length} جارية بالحلي الذهبي!
❁┊💃 التدريب على الرقص والغناء 🎶💎

❁┊💰 تكلفة الهدايا: ${cost.toLocaleString()} ج.س
❁┊⭐ مستواهن ارتفع إلى 2!

❁┊📈 ربح الخيمة القادمة: +70%
❁┊🔒 خطر الهروب انخفض إلى 3%
❁┊😊 ولاؤهن: 70%

◈ ──────────── ◈`);
  }

  // ===== أمر تكريم =====
  else if (command === "تكريم") {
    const amount = parseInt(args[1]);

    if (!amount || amount < 50000) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊📌 الاستخدام: جواري تكريم [مبلغ]
❁┊💎 الحد الأدنى: 50,000 ج.س
❁┊💡 مثال: جواري تكريم 200000
◈ ──────────── ◈`);
    }

    if (userMoney < amount) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊💸 لا تملك هذا المبلغ!
❁┊رصيدك: ${userMoney.toLocaleString()} ج.س
◈ ──────────── ◈`);
    }

    const toUpgrade = Math.floor(amount / 50000);
    const level2Slaves = haremData.slaves.filter(s => s.level === 2);
    const upgraded = level2Slaves.slice(0, Math.min(toUpgrade, level2Slaves.length));

    if (upgraded.length === 0) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊⚠️ ما عندك جواري مستوى 2 للترقية!
❁┊روّض الجواري الجديدات أولاً
◈ ──────────── ◈`);
    }

    for (const slave of upgraded) {
      slave.level = 3;
      slave.loyalty = 100;
      slave.profit = Math.floor(slave.profit * 2);
    }

    haremData.fame = Math.min(100, haremData.fame + 20);

    await usersData.set(senderID, userMoney - amount, "money");
    await usersData.set(senderID, { harem: haremData }, "data");

    return sh.reply(`◈ ──『 ❀ كريم الجاهلية ❀ 』── ◈

❁┊👑 أغدقت على الجواري حرير وجواهر!
❁┊🪞💎🪷 بـ${amount.toLocaleString()} ج.س

❁┊✨ سعادتهن وولاؤهن وصل السماء!
❁┊👸 ${upgraded.length} جارية أصبحن مستوى 3
❁┊⭐ ملكات حريم – ربح ×2 دائم

❁┊🎭 يجذبن ضيوف أثرياء
❁┊📜 الشعراء يمدحون كرمك الآن
❁┊🌟 شهرة القبيلة: ${haremData.fame}%

◈ ──────────── ◈`);
  }

  // ===== أمر مزاد =====
  else if (command === "مزاد") {
    if (haremData.slaves.length === 0) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊❌ ما عندك جواري للبيع!
◈ ──────────── ◈`);
    }

    const toSell = haremData.slaves[0];
    const basePrice = toSell.level === 1 ? 80000 : toSell.level === 2 ? 150000 : 250000;
    const sellPrice = basePrice + Math.floor(Math.random() * 100000);
    const profit = sellPrice - (toSell.level === 1 ? 60000 : 90000);

    haremData.slaves.shift();
    haremData.totalSlaves = haremData.slaves.length;

    await usersData.set(senderID, userMoney + sellPrice, "money");
    await usersData.set(senderID, { harem: haremData }, "data");

    return sh.reply(`◈ ──『 ❀ تاجر النخاسة ❀ 』── ◈

❁┊🏛️ عرضت ${toSell.type} مستوى ${toSell.level}
❁┊في سوق السبي

❁┊💰 بيعت بـ${sellPrice.toLocaleString()} ج.س
❁┊✅ ربح نظيف: ${profit.toLocaleString()} ج.س

❁┊💵 رصيدك زاد فوراً
❁┊👸 الحريم قل واحدة (${haremData.totalSlaves} متبقي)

◈ ──────────── ◈`);
  }

  // ===== أمر مجلس الغناء =====
  else if (command === "مجلس" || command === "غناء" || command === "مجلس_غناء") {
    const singers = haremData.slaves.filter(s => s.type.includes("مغنية") || s.level >= 2);

    if (singers.length === 0) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊❌ ما عندك مغنيات أو جواري مدربات!
❁┊💡 اشتري مغنيات أو روض الجواري
◈ ──────────── ◈`);
    }

    const bonus = singers.length * 30000 + Math.floor(Math.random() * 100000);
    haremData.fame = Math.min(100, haremData.fame + 10);

    await usersData.set(senderID, userMoney + bonus, "money");
    await usersData.set(senderID, { harem: haremData }, "data");

    return sh.reply(`◈ ──『 ❀ شيخ الشعر ❀ 』── ◈

❁┊🎶 الجواري غنين في مجلسك الكبير!
❁┊👥 أمام الضيوف والشعراء

❁┊🎤 عدد المغنيات: ${singers.length}
❁┊💎 هدايا الإعجاب: +${bonus.toLocaleString()} ج.س

❁┊⭐ شهرة القبيلة زادت: ${haremData.fame}%
❁┊📜 الشعراء ينشدون في مدحك

◈ ──────────── ◈`);
  }

  // ===== عرض الحالة =====
  else {
    const totalProfit = haremData.slaves.reduce((sum, s) => sum + s.profit, 0);
    const level1 = haremData.slaves.filter(s => s.level === 1).length;
    const level2 = haremData.slaves.filter(s => s.level === 2).length;
    const level3 = haremData.slaves.filter(s => s.level === 3).length;

    return sh.reply(`◈ ──『 ❀ شيخ القبيلة العظيم ❀ 』── ◈

❁┊📊 حالة الحريم:

❁┊👸 عدد الجواري: ${haremData.totalSlaves}
❁┊⭐ مستوى 1: ${level1} (جديدات)
❁┊⭐⭐ مستوى 2: ${level2} (مروضات)
❁┊⭐⭐⭐ مستوى 3: ${level3} (ملكات)

❁┊💰 ربح يومي متوقع: ${totalProfit.toLocaleString()} ج.س
❁┊📊 السمعة: ${haremData.reputation}%
❁┊🌟 الشهرة: ${haremData.fame}%
❁┊💵 إجمالي الأرباح: ${haremData.totalEarnings.toLocaleString()} ج.س

❁┊🎮 الأوامر:
❁┊• جواري سبي [عدد] [نوع]
❁┊• جواري خيمة
❁┊• جواري ترويض [عدد]
❁┊• جواري تكريم [مبلغ]
❁┊• جواري مزاد
❁┊• جواري مجلس

◈ ──────────── ◈`);
  }
};