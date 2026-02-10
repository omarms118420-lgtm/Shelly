module.exports.config = {
  name: "سرقة",
  Auth: 0,
  Owner: "Gry KJ",
  Info: "حاول تسرق عضو آخر",
  Class: "الاموال",
  hello: {
    cooldownTime: 7200000  // ساعتين = 2 × 60 × 60 × 1000 = 7,200,000 ميلي ثانية
  }
};

module.exports.lang = {
  "ar": {
    "cooldown": "لقد حاولت السرقة",
    "success": "نجحت في السرقة",
  }
}

module.exports.onPick = async ({ event, api, usersData, args }) => {
  const { threadID, messageID, senderID, mentions } = event;

  const cooldown = this.config.hello.cooldownTime;
  let thiefData = (await usersData.get(senderID)).data || {};
  
  // فحص وقت الانتظار
  if (typeof thiefData !== "undefined" && thiefData.stealTime && cooldown - (Date.now() - thiefData.stealTime) > 0) {
    var time = cooldown - (Date.now() - thiefData.stealTime),
      hours = Math.floor(time / 3600000),
      minutes = Math.floor((time % 3600000) / 60000),
      seconds = ((time % 60000) / 1000).toFixed(0);

    return api.sendMessage(
      `⏰ لقد حاولت السرقة مؤخرًا!\n⏳ انتظر: ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`,
      threadID,
      messageID
    );
  }

  // التحقق من وجود منشن (تاغ لشخص)
  const mentionedUsers = Object.keys(mentions);
  
  if (mentionedUsers.length === 0) {
    return api.sendMessage(
      `❌ يجب عليك منشن الشخص الذي تريد سرقته!\n\n📝 مثال: سرقة @الشخص`,
      threadID,
      messageID
    );
  }

  const targetID = mentionedUsers[0];

  // التحقق من عدم سرقة النفس
  if (targetID === senderID) {
    return api.sendMessage(
      `😂 ما تقدر تسرق نفسك يا ذكي!`,
      threadID,
      messageID
    );
  }

  // الحصول على بيانات السارق والضحية
  const thiefName = (await usersData.get(senderID)).name || "السارق";
  const targetName = (await usersData.get(targetID)).name || "الضحية";
  const thiefMoney = (await usersData.get(senderID)).money || 0;
  const targetMoney = (await usersData.get(targetID)).money || 0;

  // التحقق من أن الضحية لديه مال كافي
  if (targetMoney < 1000) {
    return api.sendMessage(
      `😔 ${targetName} ما عندو فلوس كافية للسرقة!\n💰 رصيده: ${targetMoney.toLocaleString()} جنيه سوداني\n\n🎯 اختر ضحية أغنى!`,
      threadID,
      messageID
    );
  }

  // تحديد نوع النتيجة بشكل عشوائي
  const outcome = Math.random();
  const maxSteal = 5000;
  
  let message = "";
  let thiefChange = 0;
  let targetChange = 0;

  if (outcome < 0.30) {
    // 30% نجاح كامل
    const stolenAmount = Math.min(maxSteal, targetMoney);
    thiefChange = stolenAmount;
    targetChange = -stolenAmount;
    
    const successMessages = [
      "🎭 دخلت بهدوء وسرقت الفلوس وخرجت",
      "🥷 عملية احترافية، ما حد شافك",
      "💼 فتحت الخزنة ببراعة وأخذت الفلوس",
      "🌙 استغليت الظلام ونجحت السرقة",
      "🎯 عملية نظيفة بدون أخطاء"
    ];
    
    message = `✅ نجاح كامل! 🎉\n\n`;
    message += `🥷 السارق: ${thiefName}\n`;
    message += `😱 الضحية: ${targetName}\n\n`;
    message += `${successMessages[Math.floor(Math.random() * successMessages.length)]}\n\n`;
    message += `💰 المبلغ المسروق: ${stolenAmount.toLocaleString()} جنيه سوداني\n`;
    message += `📈 رصيد ${thiefName}: ${(thiefMoney + thiefChange).toLocaleString()} جنيه\n`;
    message += `📉 رصيد ${targetName}: ${(targetMoney + targetChange).toLocaleString()} جنيه`;
    
  } else if (outcome < 0.60) {
    // 30% نجاح جزئي
    const stolenAmount = Math.min(
      Math.floor(Math.random() * 1501) + 1500,  // 1,500 - 3,000
      targetMoney
    );
    thiefChange = stolenAmount;
    targetChange = -stolenAmount;
    
    const partialMessages = [
      "⚠️ سمعت صوت، أخذت اللي قدرت عليه وهربت",
      "🏃 الوضع صار خطر، أخذت شوية فلوس وجريت",
      "😰 كان في حركة بالمكان، سرقت بسرعة",
      "🚪 الباب كان مفتوح شوية، دخلت وطلعت بسرعة",
      "⏰ الوقت كان قصير، أخذت اللي لقيته"
    ];
    
    message = `⚠️ نجاح جزئي!\n\n`;
    message += `🥷 السارق: ${thiefName}\n`;
    message += `😕 الضحية: ${targetName}\n\n`;
    message += `${partialMessages[Math.floor(Math.random() * partialMessages.length)]}\n\n`;
    message += `💰 المبلغ المسروق: ${stolenAmount.toLocaleString()} جنيه سوداني\n`;
    message += `📈 رصيد ${thiefName}: ${(thiefMoney + thiefChange).toLocaleString()} جنيه\n`;
    message += `📉 رصيد ${targetName}: ${(targetMoney + targetChange).toLocaleString()} جنيه`;
    
  } else if (outcome < 0.85) {
    // 25% فشل (الضحية يأخذ تعويض)
    const compensation = Math.floor(Math.random() * 1001) + 1000;  // 1,000 - 2,000
    const penalty = Math.min(compensation, thiefMoney);
    
    thiefChange = -penalty;
    targetChange = penalty;
    
    const failMessages = [
      "🚨 الضحية قفش السارق متلبس!",
      "👮 جيران الضحية شافوك وطاردوك",
      "🔔 الإنذار رن والكل جا",
      "📹 الكاميرات صورتك وانكشفت",
      "🐕 الكلب نبح عليك وهربت",
      "💡 الأنوار اشتغلت فجأة وانكشفت"
    ];
    
    message = `❌ فشلت السرقة! 🛡️\n\n`;
    message += `😅 السارق الفاشل: ${thiefName}\n`;
    message += `😎 الضحية اليقظة: ${targetName}\n\n`;
    message += `${failMessages[Math.floor(Math.random() * failMessages.length)]}\n\n`;
    message += `⚖️ تعويض للضحية: ${penalty.toLocaleString()} جنيه سوداني\n`;
    message += `📉 رصيد ${thiefName}: ${(thiefMoney + thiefChange).toLocaleString()} جنيه\n`;
    message += `📈 رصيد ${targetName}: ${(targetMoney + targetChange).toLocaleString()} جنيه`;
    
  } else {
    // 15% حادث غير متوقع (كلاهما يخسران)
    const thiefLoss = Math.min(
      Math.floor(Math.random() * 501) + 500,  // 500 - 1,000
      thiefMoney
    );
    const targetLoss = Math.min(
      Math.floor(Math.random() * 501) + 500,  // 500 - 1,000
      targetMoney
    );
    
    thiefChange = -thiefLoss;
    targetChange = -targetLoss;
    
    const chaosMessages = [
      "💥 انفجرت قنبلة دخان والفوضى عمت المكان!",
      "🔥 حريق مفاجئ! الكل خسر",
      "🚓 الشرطة داهمت المكان فجأة",
      "⚡ انقطعت الكهرباء وصار هرج ومرج",
      "💣 شنطة متفجرة! الكل هرب",
      "🌪️ عاصفة رملية مفاجئة"
    ];
    
    message = `💥 حادث غير متوقع! 😱\n\n`;
    message += `😰 السارق: ${thiefName}\n`;
    message += `😰 الضحية: ${targetName}\n\n`;
    message += `${chaosMessages[Math.floor(Math.random() * chaosMessages.length)]}\n\n`;
    message += `⚠️ الفوضى خلّت الكل يخسر!\n`;
    message += `📉 خسارة ${thiefName}: ${thiefLoss.toLocaleString()} جنيه سوداني\n`;
    message += `📉 خسارة ${targetName}: ${targetLoss.toLocaleString()} جنيه سوداني\n\n`;
    message += `💰 رصيد ${thiefName}: ${(thiefMoney + thiefChange).toLocaleString()} جنيه\n`;
    message += `💰 رصيد ${targetName}: ${(targetMoney + targetChange).toLocaleString()} جنيه`;
  }

  // تحديث الأرصدة
  await usersData.set(senderID, thiefMoney + thiefChange, "money");
  await usersData.set(targetID, targetMoney + targetChange, "money");
  
  // تحديث وقت آخر سرقة
  thiefData.stealTime = Date.now();
  await usersData.set(senderID, thiefData, "data");

  return api.sendMessage(message, threadID, messageID);
};