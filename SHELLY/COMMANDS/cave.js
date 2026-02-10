module.exports.config = {
  name: "كهف",
  Auth: 0,
  Owner: "Gry KJ",
  Info: "استكشف الكهوف السودانية واكسب فلوس",
  Class: "الاموال",
  hello: {
    cooldownTime: 7200000  // ساعتين = 2 × 60 × 60 × 1000
  }
};

module.exports.lang = {
  "ar": {
    "cooldown": "لقد دخلت الكهف",
    "rewarded": "لقد حصلت على: %2$",
    "cave": "كهف",
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

    return api.sendMessage(`⏳ لقد دخلت الكهف مؤخرًا، عد بعد: ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية.`, event.threadID, event.messageID);
  }
  else {
    // قائمة الكهوف السودانية
    const caves = [
      {
        name: "🪨 كهف الذهب البلدي",
        description: "كهف قديم في الجبال، الناس تحفر يدوي",
        minReward: 500,
        maxReward: 5000,
        probability: 0.15,
        messages: [
          "⛏️ حفرت بالفأس وطلعت قطعة ذهب!",
          "✨ لقيت عرق ذهب صغير!",
          "🏆 يوم حظك! ذهب بركة!",
          "💎 الحفر كان متعب لكن يستاهل!"
        ]
      },
      {
        name: "👻 كهف الجن (المخيف)",
        description: "كهف مخيف بس المكافأة كبيرة",
        minReward: 1000,
        maxReward: 4500,
        probability: 0.10,
        messages: [
          "😱 سمعت أصوات غريبة لكن طلعت بفايدة!",
          "🌙 دخلت بالليل ولقيت كنز!",
          "👹 الجن ما ضايقوك اليوم!",
          "🕯️ الشجاعة دفعت!"
        ]
      },
      {
        name: "🧱 كهف الطين الأحمر",
        description: "كهف آمن وبسيط - مكافأة صغيرة مضمونة",
        minReward: 200,
        maxReward: 800,
        probability: 0.40,
        messages: [
          "🟤 قروش قليلة لكن مضمونة!",
          "✋ جمعت طين أحمر وبعتو!",
          "📦 شغل بسيط وربح حلو!",
          "😊 الحمد لله على القليل!"
        ]
      },
      {
        name: "☄️ كهف النيزك",
        description: "حجر غريب من السماء - نادر ومكافأة خيالية!",
        minReward: 3000,
        maxReward: 5000,
        probability: 0.05,
        messages: [
          "🌠 لقيت حجر نيزك حقيقي!",
          "💫 ثروة من السماء!",
          "⭐ الحظ معاك النهاردة!",
          "🚀 حجر فضائي غالي!"
        ]
      },
      {
        name: "📜 كهف الجدود",
        description: "كهف تراثي فيهو نقوش قديمة",
        minReward: 300,
        maxReward: 1200,
        probability: 0.20,
        messages: [
          "🗿 لقيت نقوش قديمة وبعتها!",
          "📿 تحف أثرية من زمان!",
          "🏺 بركة الأجداد معاك!",
          "⚱️ قطع تراثية نادرة!"
        ]
      },
      {
        name: "🌧️ كهف الأمطار",
        description: "يفتح بس في موسم الخريف",
        minReward: 800,
        maxReward: 3000,
        probability: 0.12,
        messages: [
          "☔ المطر جاب بركة!",
          "🌈 بعد المطر تلقى الكنز!",
          "💧 موسم الخير والرزق!",
          "⛈️ الأمطار كشفت الكنوز!"
        ]
      },
      {
        name: "🍵 كهف الشاي والقعدة",
        description: "كهف اجتماعي - تقعد مع الناس",
        minReward: 100,
        maxReward: 500,
        probability: 0.30,
        messages: [
          "☕ قعدة حلوة وقروش بسيطة!",
          "🫖 الناس كانوا كرماء!",
          "😄 ضحك وربح خفيف!",
          "🤝 الصداقة كنز!"
        ]
      }
    ];

    // رسائل الفشل (احتمال 15%)
    const failMessages = [
      { message: "😔 الكهف كان فاضي النهاردة", amount: 0 },
      { message: "🦇 خفافيش طردتك قبل ما تدخل!", amount: 0 },
      { message: "🕷️ عناكب في كل مكان، ما لقيت شي", amount: 0 },
      { message: "🌑 ضلمة ما شفت شي جوه", amount: 0 },
      { message: "⚠️ الكهف مسدود اليوم", amount: 0 }
    ];

    // رسائل الخسارة (احتمال 8%)
    const lossMessages = [
      { message: "💸 انزلقت وضاع منك المال!", loss: -200 },
      { message: "🦂 عقرب لدغك واضطريت تدفع علاج!", loss: -300 },
      { message: "⛏️ انكسر الفأس واشتريت واحد جديد!", loss: -250 },
      { message: "🪨 صخرة وقعت وكسرت أدواتك!", loss: -400 },
      { message: "🔦 بطارية المصباح خلصت واشتريت جديدة!", loss: -150 }
    ];

    const outcomeRoll = Math.random();

    let amount;
    let message;
    let selectedCave;

    if (outcomeRoll < 0.08) {
      // 8% خسارة
      const loss = lossMessages[Math.floor(Math.random() * lossMessages.length)];
      amount = loss.loss;
      message = `🚫 ${loss.message}\n💸 الخسارة: ${Math.abs(amount).toLocaleString()} جنيه سوداني`;
      
    } else if (outcomeRoll < 0.23) {
      // 15% فشل (لا ربح ولا خسارة)
      const fail = failMessages[Math.floor(Math.random() * failMessages.length)];
      amount = fail.amount;
      message = `${fail.message}\n💰 لم تحصل على شيء اليوم`;
      
    } else {
      // 77% نجاح - اختيار كهف حسب الاحتمالات
      const caveRoll = Math.random();
      let cumulativeProbability = 0;
      
      for (const cave of caves) {
        cumulativeProbability += cave.probability;
        if (caveRoll <= cumulativeProbability) {
          selectedCave = cave;
          break;
        }
      }
      
      // إذا لم يتم اختيار كهف، اختر العشوائي
      if (!selectedCave) {
        selectedCave = caves[Math.floor(Math.random() * caves.length)];
      }

      amount = Math.floor(Math.random() * (selectedCave.maxReward - selectedCave.minReward + 1)) + selectedCave.minReward;
      const randomMessage = selectedCave.messages[Math.floor(Math.random() * selectedCave.messages.length)];
      
      message = `${selectedCave.name}\n📖 ${selectedCave.description}\n\n${randomMessage}\n💰 الربح: ${amount.toLocaleString()} جنيه سوداني`;
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