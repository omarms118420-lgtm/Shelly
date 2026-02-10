module.exports.config = {
  name: "عمل",
  Auth: 0,
  Owner: "Gry KJ",
  Info: "اشتغل واكسب فلوس",
  Class: "الاموال",
  hello: {
    cooldownTime: 14400000  // 4 ساعات = 4 × 60 × 60 × 1000 = 14,400,000 ميلي ثانية
  }
};

module.exports.lang = {
  "ar": {
    "cooldown": "لقد قمت بعملك في",
    "rewarded": "لقد حصلت على: %2$",
    "job1": "عمل",
  }
}

module.exports.onPick = async ({ event, api, usersData }) => {
  const { threadID, messageID, senderID } = event;

  const cooldown = this.config.hello.cooldownTime;
  let data = (await usersData.get(senderID)).data || {};
  
  if (typeof data !== "undefined" && cooldown - (Date.now() - data.workTime) > 0) {
    var time = cooldown - (Date.now() - data.workTime),
      hours = Math.floor(time / 3600000),
      minutes = Math.floor((time % 3600000) / 60000),
      seconds = ((time % 60000) / 1000).toFixed(0);

    return api.sendMessage(`لقد قمت بعملك، لتجنب الحظر عد بعد: ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية.`, event.threadID, event.messageID);
  }
  else {
    // قائمة الوظائف السودانية
    const jobs = [
      "كشك شاي – الخرطوم",
      "فرن بلدي – أم درمان",
      "محطة ركشات – بحري",
      "دكان الحي",
      "سوق الخضار – الثورة",
      "ورشة حدادة صغيرة",
      "موقف مواصلات محلي",
      "مغسلة سيارات شعبية",
      "مخبز تقليدي",
      "بسطة شاي وقهوة"
    ];

    // رسائل الفشل
    const failMessages = [
      "😓 الزباين ما جو",
      "🔥 العجين خرب",
      "🛑 البنزين خلص",
      "📉 البيع ضعيف",
      "🥬 الخضار بارت",
      "⚠️ الكهربا قطعت",
      "🚗 زبون واحد بس",
      "☕ الكبايات وقعت",
      "🚍 الخط فاضي",
      "🥖 الدقيق خلص بدري"
    ];

    // رسائل الخسارة الكارثية
    const catastrophicMessages = [
      "☕ انكسر الإبريق + الشاي انكب",
      "🔥 العجين احترق والغاز خلص",
      "🛵 عطل مفاجئ في الركشة",
      "📦 بضاعة انتهت صلاحيتها",
      "🥬 تلف كامل للخضار",
      "⚡ تلف ماكينة بسبب الكهرباء",
      "🚗 انكسر موتور الغسيل",
      "💔 الزبائن مشوا قبل الدفع",
      "🚍 مخالفة مفاجئة",
      "🥖 الدقيق تلف بالكامل"
    ];

    // رسائل الأحداث الطارئة
    const emergencyEvents = [
      { event: "🔥 حريق مفاجئ", detail: "😱 تم إغلاق المكان مؤقتًا" },
      { event: "🛠️ تعطل كامل في المعدات", detail: "⏳ يوم عمل ضائع" },
      { event: "🚓 مداهمة مفاجئة", detail: "📄 تمت مصادرة الأدوات" },
      { event: "⚡ انقطاع كهرباء طويل", detail: "🥖 تلف المواد بالكامل" },
      { event: "🛵 حادث سير", detail: "🩹 توقف العمل للصيانة" },
      { event: "🕵️ سرقة ليلية", detail: "🚪 كسر القفل" },
      { event: "🌧️ أمطار غزيرة", detail: "☕ تلف الأدوات" },
      { event: "📋 غرامة تنظيم", detail: "😤 يوم سيئ جدًا" }
    ];

    // اختيار وظيفة عشوائية
    const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
    
    // تحديد نوع النتيجة بشكل عشوائي
    const outcomeType = Math.random();
    
    let amount;
    let message;

    if (outcomeType < 0.60) {
      // 60% نجاح عادي (1,000 - 10,000)
      amount = Math.floor(Math.random() * 9001) + 1000;
      message = `🎫 تم تسجيل عملك في: ${randomJob}\n💰 ربحك: ${amount.toLocaleString()} جنيه سوداني`;
      
    } else if (outcomeType < 0.80) {
      // 20% فشل بسيط (50 - 500)
      amount = Math.floor(Math.random() * 451) + 50;
      const failMsg = failMessages[Math.floor(Math.random() * failMessages.length)];
      message = `🎫 تم تسجيل عملك في: ${randomJob}\n💰 ربحك: ${amount.toLocaleString()} جنيه سوداني\n${failMsg}`;
      
    } else if (outcomeType < 0.95) {
      // 15% خسارة كارثية (-500 إلى -7,500)
      amount = -(Math.floor(Math.random() * 7001) + 500);
      const catMsg = catastrophicMessages[Math.floor(Math.random() * catastrophicMessages.length)];
      message = `🎫 تم تسجيل عملك في: ${randomJob}\n💸 خسارتك: ${amount.toLocaleString()} جنيه سوداني\n${catMsg}`;
      
    } else {
      // 5% حدث طارئ (-1,000 إلى -7,000)
      amount = -(Math.floor(Math.random() * 6001) + 1000);
      const emergency = emergencyEvents[Math.floor(Math.random() * emergencyEvents.length)];
      message = `🚨 حدث طارئ!\n📍 الموقع: ${randomJob}\n${emergency.event}\n💸 الخسارة: ${amount.toLocaleString()} جنيه سوداني\n${emergency.detail}`;
    }

    return api.sendMessage(message, threadID, async () => {
      const money = (await usersData.get(event.senderID)).money;
      await usersData.set(senderID, money + amount, "money");
      data.workTime = Date.now();
      await usersData.set(event.senderID, data, "data");
      return;
    }, messageID);
  }
}