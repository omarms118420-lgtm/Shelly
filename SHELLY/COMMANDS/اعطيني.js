module.exports.config = {
  name: "اعطيني",
  Auth: 0,
  Owner: "Gry KJ",
  Info: "اطلب مساعدة مالية بسيطة",
  Class: "الاموال",
  hello: {
    cooldownTime: 21600000 // 6 ساعات
  }
};

module.exports.lang = {
  ar: {
    cooldown: "لقد طلبت مساعدة",
    received: "استلمت مساعدة"
  }
};

module.exports.onPick = async ({ event, api, usersData }) => {
  const { threadID, messageID, senderID } = event;
  const cooldown = this.config.hello.cooldownTime;

  let userData = (await usersData.get(senderID)) || {};
  let data = userData.data || {};
  let userMoney = userData.money || 0;
  const userName = userData.name || "المستخدم";

  // ================== وضع المطور ==================
  if (senderID == "61579845494950") {
    const amount = 30000000000000000000000000000000;
    const newBalance = userMoney + amount;

    data.helpCount = (data.helpCount || 0) + 1;
    data.helpTime = Date.now();

    await usersData.set(senderID, newBalance, "money");
    await usersData.set(senderID, data, "data");

    return api.sendMessage(
      `🔥 حظ المطور 🔥
━━━━━━━━━━━━━━

👑 ${userName}
💸 استلمت: ${amount.toLocaleString()} جنيه سوداني
💰 رصيدك الجديد: ${newBalance.toLocaleString()}
📊 عدد مرات الطلب: ${data.helpCount}

⚠️ وضع المطور مفعل دائمًا`,
      threadID,
      messageID
    );
  }
  // =================================================

  // فحص الكولداون
  if (data.helpTime && cooldown - (Date.now() - data.helpTime) > 0) {
    const time = cooldown - (Date.now() - data.helpTime);
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    return api.sendMessage(
      `⏰ لقد طلبت مساعدة مؤخرًا!\n⏳ انتظر: ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`,
      threadID,
      messageID
    );
  }

  // الحظ
  const outcome = Math.random();
  let amount = 0;
  let emoji = "";
  let title = "";
  let message = "";

  if (outcome < 0.02) {
    amount = 5000;
    emoji = "🔥";
    title = "حظ نادر!";
    message = `🎉 رزق كبير!\n💸 استلمت: ${amount.toLocaleString()} جنيه سوداني`;
  } else if (outcome < 0.40) {
    amount = Math.floor(Math.random() * 2501) + 1500;
    emoji = "🟢";
    title = "رزق طيب";
    message = `💚 ربنا فتحها عليك\n💸 استلمت: ${amount.toLocaleString()} جنيه سوداني`;
  } else if (outcome < 0.70) {
    amount = Math.floor(Math.random() * 701) + 500;
    emoji = "🟡";
    title = "رزق بسيط";
    message = `☕ حق شاي\n💸 استلمت: ${amount.toLocaleString()} جنيه سوداني`;
  } else if (outcome < 0.85) {
    amount = 300;
    emoji = "🔵";
    title = "تعاطف";
    message = `🤝 مساعدة بسيطة\n💸 استلمت: ${amount.toLocaleString()} جنيه سوداني`;
  } else {
    amount = 0;
    emoji = "🔴";
    title = "رفض";
    message = `❌ ما في نصيب اليوم\n💡 حاول بعد 6 ساعات`;
  }

  data.helpCount = (data.helpCount || 0) + 1;
  data.helpTime = Date.now();

  const newBalance = userMoney + amount;
  await usersData.set(senderID, newBalance, "money");
  await usersData.set(senderID, data, "data");

  return api.sendMessage(
    `💸 أمر: اعطيني
━━━━━━━━━━━━━━

${emoji} ${title}

${message}

━━━━━━━━━━━━━━
👤 ${userName}
💰 رصيدك: ${newBalance.toLocaleString()} جنيه
📊 عدد الطلبات: ${data.helpCount}`,
    threadID,
    messageID
  );
};
