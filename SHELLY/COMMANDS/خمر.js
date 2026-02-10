module.exports.config = {
  name: "خمر",
  Auth: 0,
  Owner: "Gry KJ",
  Info: "نظام الخمر والدعارة في القبيلة الجاهلية",
  Class: "القبيلة",
  Multi: ["مجلس", "خيمة", "تخمير", "دعوة"]
};

module.exports.onPick = async ({ event, api, usersData, args, sh }) => {
  const { threadID, messageID, senderID } = event;
  const command = args[0]?.toLowerCase();

  // الحصول على بيانات المستخدم
  let userData = await usersData.get(senderID);
  let userMoney = userData.money || 0;
  let tribeData = userData.data?.tribe || {
    wine: {
      jars: 0,
      quality: "عادي", // عادي، قديم، فاخر، فاخر جدا
      fermenting: 0,
      fermentStart: 0,
      lastBrew: 0
    },
    brothel: {
      slaves: 0,
      level: 1,
      lastOpen: 0,
      reputation: 50
    },
    council: {
      lastOpen: 0,
      drunkGuests: 0
    },
    risks: {
      scandal: 0,
      raid: 0,
      fight: 0
    }
  };

  // ===== أمر صنع/شراء الخمر =====
  if (!command || command === "شراء" || !isNaN(parseInt(command))) {
    const amount = parseInt(command || args[0]);
    const quality = args[1]?.toLowerCase();

    if (!amount || isNaN(amount) || amount <= 0) {
      return sh.reply(`◈ ──『 ❀ نظام الخمر ❀ 』── ◈

❁┊📌 استخدام الأمر:
❁┊خمر [عدد] [نوع]

❁┊🍷 أنواع الخمر:
❁┊🏺 عادي → 10,000 ج.س/جرة
❁┊🍇 قديم → 15,000 ج.س/جرة  
❁┊💎 فاخر → 20,000 ج.س/جرة

❁┊💡 مثال: خمر 20 فاخر

◈ ──────────── ◈`);
    }

    if (amount > 100) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈\n❁┊❌ يا شيخ، لا تستطيع صنع أكثر من 100 جرة دفعة واحدة!\n◈ ──────────── ◈`);
    }

    let pricePerJar, qualityName, fermentTime;
    
    if (!quality || quality === "عادي") {
      pricePerJar = 10000;
      qualityName = "عادي";
      fermentTime = 4;
    } else if (quality === "قديم") {
      pricePerJar = 15000;
      qualityName = "قديم";
      fermentTime = 5;
    } else if (quality === "فاخر") {
      pricePerJar = 20000;
      qualityName = "فاخر";
      fermentTime = 6;
    } else {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈\n❁┊❌ نوع خمر غير صحيح!\n❁┊الأنواع: عادي، قديم، فاخر\n◈ ──────────── ◈`);
    }

    const totalCost = amount * pricePerJar;

    // التحقق من المال
    if (userMoney < totalCost) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊💸 يا سيد المجلس، لا تملك المال الكافي!
❁┊تحتاج: ${totalCost.toLocaleString()} ج.س
❁┊لديك: ${userMoney.toLocaleString()} ج.س
◈ ──────────── ◈`);
    }

    // إضافة الجرار
    tribeData.wine.fermenting = amount;
    tribeData.wine.quality = qualityName;
    tribeData.wine.fermentStart = Date.now();
    tribeData.wine.lastBrew = Date.now();

    // خصم المال
    await usersData.set(senderID, userMoney - totalCost, "money");
    await usersData.set(senderID, { tribe: tribeData }, "data");

    const message = `◈ ──『 ❀ يا سيد المجلس ❀ 』── ◈

❁┊🎉 صنعت ${amount} جرة نبيذ تمر ${qualityName}! 🏺

❁┊💰 التكلفة: ${totalCost.toLocaleString()} ج.س
❁┊🍷 مستوى الخمر: ${qualityName}
❁┊⏳ جاهز بعد ${fermentTime} ساعات تخمير

❁┊📊 مخزون الخمر:
❁┊• قيد التخمير: ${amount} جرة
❁┊• جاهز: ${tribeData.wine.jars} جرة

❁┊🌟 الخمر يجذب الأثرياء والشعراء!

◈ ──────────── ◈`;

    return sh.reply(message);
  }

  // ===== أمر مجلس الخمر =====
  else if (command === "مجلس") {
    
    // التحقق من التخمير
    const fermentDuration = {
      "عادي": 14400000, // 4 ساعات
      "قديم": 18000000,  // 5 ساعات
      "فاخر": 21600000   // 6 ساعات
    };

    const fermentTime = fermentDuration[tribeData.wine.quality] || 14400000;
    
    if (tribeData.wine.fermenting > 0 && Date.now() - tribeData.wine.fermentStart >= fermentTime) {
      // نقل الخمر من التخمير إلى الجاهز
      tribeData.wine.jars += tribeData.wine.fermenting;
      tribeData.wine.fermenting = 0;
    }

    // التحقق من الكولداون (8 ساعات)
    const councilCooldown = 28800000;
    if (Date.now() - tribeData.council.lastOpen < councilCooldown) {
      const timeLeft = councilCooldown - (Date.now() - tribeData.council.lastOpen);
      const hours = Math.floor(timeLeft / 3600000);
      const minutes = Math.floor((timeLeft % 3600000) / 60000);
      
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊⏳ يا كريم الجاهلية، المجلس يحتاج راحة!
❁┊عد بعد: ${hours} ساعة و ${minutes} دقيقة
◈ ──────────── ◈`);
    }

    // التحقق من وجود خمر
    if (tribeData.wine.jars <= 0) {
      return sh.reply(`◈ ──『 ❀ يا سيدي ❀ 』── ◈

❁┊❌ الخمر خلص والضيوف غاضبين! 😤
❁┊ما في جرار كافية اليوم

❁┊💡 اصنع خمر أولاً: خمر 20 فاخر

◈ ──────────── ◈`);
    }

    // حساب الأرباح
    const jarsUsed = Math.min(tribeData.wine.jars, 30);
    const baseGuests = Math.floor(Math.random() * 50) + 50; // 50-100
    
    let qualityBonus = 1;
    let qualityText = "";
    
    if (tribeData.wine.quality === "قديم") {
      qualityBonus = 1.3;
      qualityText = "+30%";
    } else if (tribeData.wine.quality === "فاخر") {
      qualityBonus = 1.6;
      qualityText = "+60%";
    } else if (tribeData.wine.quality === "فاخر جدا") {
      qualityBonus = 1.8;
      qualityText = "+80%";
    }

    const baseRevenue = jarsUsed * 22000;
    const totalRevenue = Math.floor(baseRevenue * qualityBonus);
    const cost = jarsUsed * 7000;
    const netProfit = totalRevenue - cost;

    // تحديث البيانات
    tribeData.wine.jars -= jarsUsed;
    tribeData.council.lastOpen = Date.now();
    tribeData.council.drunkGuests = Math.floor(baseGuests * 0.6); // 60% يسكرون
    
    // زيادة خطر بسيط
    tribeData.risks.fight = Math.min(20, tribeData.risks.fight + 3);

    await usersData.set(senderID, userMoney + netProfit, "money");
    await usersData.set(senderID, { tribe: tribeData }, "data");

    const message = `◈ ──『 ❀ يا كريم الجاهلية ❀ 』── ◈

❁┊🎉 فتحت مجلسك الكبير! 🍷🏜️
❁┊الخمر يتدفق على الشعراء والفرسان!

❁┊📊 الإحصائيات:
❁┊🏺 جرار مستخدمة: ${jarsUsed}
❁┊👥 عدد الضيوف: ${baseGuests} رجل
❁┊🍷 نوع الخمر: ${tribeData.wine.quality}

❁┊💰 الأرباح:
❁┊📈 إيرادات خام: ${totalRevenue.toLocaleString()} ج.س
❁┊💸 التكلفة: ${cost.toLocaleString()} ج.س
❁┊✅ ربح صافي: +${netProfit.toLocaleString()} ج.س
${qualityText ? `❁┊🌟 مكافأة (${qualityText})` : ''}

❁┊💵 رصيدك الآن: ${(userMoney + netProfit).toLocaleString()} ج.س

❁┊🎭 ${tribeData.council.drunkGuests} ضيف سكران
❁┊توجهوا لخيمة المتعة (+30% للدعارة!)

◈ ──────────── ◈`;

    return sh.reply(message);
  }

  // ===== أمر خيمة الدعارة =====
  else if (command === "خيمة") {
    
    // التحقق من الكولداون (6 ساعات)
    const brothelCooldown = 21600000;
    if (Date.now() - tribeData.brothel.lastOpen < brothelCooldown) {
      const timeLeft = brothelCooldown - (Date.now() - tribeData.brothel.lastOpen);
      const hours = Math.floor(timeLeft / 3600000);
      const minutes = Math.floor((timeLeft % 3600000) / 60000);
      
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊⏳ يا صاحب الليالي، الخيمة تحتاج راحة!
❁┊عد بعد: ${hours} ساعة و ${minutes} دقيقة
◈ ──────────── ◈`);
    }

    // التحقق من وجود جواري (من نظام الأسرة)
    const familyData = userData.data?.family || {};
    const slaves = familyData.wives?.filter(w => w.type === "جارية") || [];
    
    if (slaves.length === 0) {
      return sh.reply(`◈ ──『 ❀ يا شيخ القبيلة ❀ 』── ◈

❁┊❌ لا توجد جواري في خيمة المتعة! 😔

❁┊💡 تزوج جارية أولاً: زواج جارية

◈ ──────────── ◈`);
    }

    // حساب الأرباح
    const baseCustomers = Math.floor(Math.random() * 60) + 40; // 40-100
    
    // مكافأة الضيوف السكارى من المجلس
    const drunkBonus = tribeData.council.drunkGuests > 0 ? 1.4 : 1;
    const drunkText = tribeData.council.drunkGuests > 0 ? "+40%" : "";
    
    // مكافأة حسب عدد الجواري
    const slaveBonus = 1 + (slaves.length * 0.15);
    
    const totalCustomers = Math.floor(baseCustomers * drunkBonus);
    const baseRevenue = totalCustomers * 12000;
    const totalRevenue = Math.floor(baseRevenue * slaveBonus);
    const cost = slaves.length * 15000;
    const netProfit = totalRevenue - cost;

    // احتمال المشاكل
    const fightChance = tribeData.risks.fight / 100;
    const hasFight = Math.random() < fightChance;

    let message;
    
    if (hasFight) {
      // حدثت مشاجرة
      const damage = Math.floor(netProfit * 0.3);
      const finalProfit = netProfit - damage;
      
      tribeData.risks.fight = 0; // إعادة تعيين الخطر
      tribeData.brothel.reputation = Math.max(0, tribeData.brothel.reputation - 10);
      
      await usersData.set(senderID, userMoney + finalProfit, "money");
      await usersData.set(senderID, { tribe: tribeData }, "data");

      message = `◈ ──『 ❀ يا شيخ القبيلة ❀ 』── ◈

❁┊⚔️ ثمل الضيوف ووقعت مشاجرة كبيرة! 😤🍷

❁┊📊 خسائر:
❁┊💔 أضرار: ${damage.toLocaleString()} ج.س
❁┊👸 جارية جرحت (غير عاملة يومين)
❁┊📉 سمعة الخيمة: -10%

❁┊💰 الربح بعد الخسائر: +${finalProfit.toLocaleString()} ج.س

❁┊⚠️ خفف من الخمر في المرة القادمة!

◈ ──────────── ◈`;

    } else {
      // نجاح عادي
      tribeData.brothel.lastOpen = Date.now();
      tribeData.brothel.reputation = Math.min(100, tribeData.brothel.reputation + 5);
      tribeData.council.drunkGuests = 0; // تصفير المكافأة
      
      await usersData.set(senderID, userMoney + netProfit, "money");
      await usersData.set(senderID, { tribe: tribeData }, "data");

      message = `◈ ──『 ❀ صاحب الليالي الحمراء ❀ 』── ◈

❁┊🎉 خيمة المتعة فتحت! 🔥👸🍷
${drunkBonus > 1 ? '❁┊الخمر يصب والجواري يرقصن!' : '❁┊الجواري يرقصن!'}

❁┊📊 الإحصائيات:
❁┊👸 عدد الجواري: ${slaves.length}
❁┊👥 عدد الزبائن: ${totalCustomers}
${drunkText ? `❁┊🍷 زبائن سكارى: ${tribeData.council.drunkGuests}` : ''}

❁┊💰 الأرباح:
❁┊📈 إيرادات خام: ${totalRevenue.toLocaleString()} ج.س
❁┊💸 التكلفة: ${cost.toLocaleString()} ج.س
❁┊✅ ربح صافي: +${netProfit.toLocaleString()} ج.س
${drunkText ? `❁┊🌟 مكافأة خمر (${drunkText})` : ''}
${slaves.length > 3 ? `❁┊✨ مكافأة جواري (+${Math.floor((slaveBonus - 1) * 100)}%)` : ''}

❁┊💵 رصيدك الآن: ${(userMoney + netProfit).toLocaleString()} ج.س
❁┊📊 سمعة الخيمة: ${tribeData.brothel.reputation}%

${tribeData.risks.fight > 10 ? `❁┊⚠️ تحذير: احتمال مشاجرة ${tribeData.risks.fight}%` : ''}

◈ ──────────── ◈`;
    }

    return sh.reply(message);
  }

  // ===== أمر تخمير الخمر =====
  else if (command === "تخمير") {
    const amount = parseInt(args[1]);

    if (!amount || isNaN(amount) || amount <= 0) {
      return sh.reply(`◈ ──『 ❀ تخمير الخمر ❀ 』── ◈

❁┊📌 استخدام الأمر:
❁┊خمر تخمير [عدد]

❁┊💡 مثال: خمر تخمير 15

❁┊💰 التكلفة: 5,000 ج.س/جرة
❁┊✨ النتيجة: ترقية الخمر لمستوى أعلى
❁┊⏳ الوقت: 4 ساعات إضافية

◈ ──────────── ◈`);
    }

    if (tribeData.wine.jars < amount) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊❌ ليس لديك ${amount} جرة جاهزة!
❁┊المخزون الجاهز: ${tribeData.wine.jars} جرة
◈ ──────────── ◈`);
    }

    const cost = amount * 5000;

    if (userMoney < cost) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊💸 لا تملك المال الكافي!
❁┊تحتاج: ${cost.toLocaleString()} ج.س
❁┊لديك: ${userMoney.toLocaleString()} ج.س
◈ ──────────── ◈`);
    }

    // ترقية الجودة
    let newQuality;
    if (tribeData.wine.quality === "عادي") {
      newQuality = "قديم";
    } else if (tribeData.wine.quality === "قديم") {
      newQuality = "فاخر";
    } else if (tribeData.wine.quality === "فاخر") {
      newQuality = "فاخر جدا";
    } else {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈\n❁┊❌ الخمر وصل لأعلى مستوى بالفعل!\n◈ ──────────── ◈`);
    }

    tribeData.wine.fermenting = amount;
    tribeData.wine.jars -= amount;
    tribeData.wine.quality = newQuality;
    tribeData.wine.fermentStart = Date.now();

    await usersData.set(senderID, userMoney - cost, "money");
    await usersData.set(senderID, { tribe: tribeData }, "data");

    const message = `◈ ──『 ❀ يا صانع النبيذ ❀ 』── ◈

❁┊🏺 تركت ${amount} جرة تتخمر أكثر! ✨
❁┊في الجرار الطينية القديمة

❁┊💰 التكلفة: ${cost.toLocaleString()} ج.س
❁┊⏳ الوقت: 4 ساعات إضافية
❁┊🍷 الجودة الجديدة: ${newQuality}

❁┊📈 ربح البيع القادم: +80%

❁┊🌟 الصبر يثمر أفخر خمر!

◈ ──────────── ◈`;

    return sh.reply(message);
  }

  // ===== أمر دعوة ضيوف =====
  else if (command === "دعوة") {
    
    if (tribeData.wine.jars < 10) {
      return sh.reply(`◈ ──『 ❀ ❀ 』── ◈
❁┊❌ تحتاج 10 جرار على الأقل لدعوة الضيوف!
❁┊المخزون: ${tribeData.wine.jars} جرة
◈ ──────────── ◈`);
    }

    // استخدام 10 جرار
    const jarsUsed = 10;
    const bonusGuests = Math.floor(Math.random() * 30) + 40; // 40-70
    const bonusRevenue = bonusGuests * 8000;

    // زيادة المخاطر
    tribeData.risks.fight = Math.min(30, tribeData.risks.fight + 8);
    tribeData.risks.scandal = Math.min(25, tribeData.risks.scandal + 5);

    tribeData.wine.jars -= jarsUsed;

    await usersData.set(senderID, userMoney + bonusRevenue, "money");
    await usersData.set(senderID, { tribe: tribeData }, "data");

    const message = `◈ ──『 ❀ يا جواد القبيلة ❀ 』── ◈

❁┊🎉 وزعت خمر مجاني على الجميع! 🍷
❁┊التجار والفرسان يتوافدون!

❁┊📊 النتائج:
❁┊🏺 جرار مستخدمة: ${jarsUsed}
❁┊👥 ضيوف إضافيون: ${bonusGuests}
❁┊💰 ربح اليوم: +${bonusRevenue.toLocaleString()} ج.س

❁┊⚠️ المخاطر:
❁┊⚔️ احتمال مشاجرة: ${tribeData.risks.fight}%
❁┊😱 احتمال فضيحة: ${tribeData.risks.scandal}%

❁┊💫 الكرم له ثمن!

◈ ──────────── ◈`;

    return sh.reply(message);
  }

  // ===== عرض الحالة =====
  else {
    // التحقق من التخمير
    const fermentDuration = {
      "عادي": 14400000,
      "قديم": 18000000,
      "فاخر": 21600000
    };

    const fermentTime = fermentDuration[tribeData.wine.quality] || 14400000;
    
    if (tribeData.wine.fermenting > 0 && Date.now() - tribeData.wine.fermentStart >= fermentTime) {
      tribeData.wine.jars += tribeData.wine.fermenting;
      tribeData.wine.fermenting = 0;
      await usersData.set(senderID, { tribe: tribeData }, "data");
    }

    const familyData = userData.data?.family || {};
    const slaves = familyData.wives?.filter(w => w.type === "جارية") || [];

    const message = `◈ ──『 ❀ شيخ القبيلة العظيم ❀ 』── ◈

❁┊📊 حالة القبيلة:

❁┊🍷 الخمر:
❁┊🏺 جرار جاهزة: ${tribeData.wine.jars}
❁┊⏳ قيد التخمير: ${tribeData.wine.fermenting}
❁┊🌟 الجودة: ${tribeData.wine.quality}

❁┊👸 خيمة المتعة:
❁┊👥 عدد الجواري: ${slaves.length}
❁┊📊 السمعة: ${tribeData.brothel.reputation}%

❁┊⚠️ المخاطر:
❁┊⚔️ مشاجرة: ${tribeData.risks.fight}%
❁┊😱 فضيحة: ${tribeData.risks.scandal}%

❁┊🎮 الأوامر المتاحة:
❁┊📌 خمر [عدد] [نوع]
❁┊📌 خمر مجلس
❁┊📌 خمر خيمة
❁┊📌 خمر تخمير [عدد]
❁┊📌 خمر دعوة

◈ ──────────── ◈`;

    return sh.reply(message);
  }
};