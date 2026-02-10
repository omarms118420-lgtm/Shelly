const Black = {
  name: "ارسال",
  Multi: ["ارسل", "تحويل", "حول"],
  Owner: "Gry KJ",
  Auth: 0,
  Time: 5, // 5 ثواني كولداون
  Info: "إرسال أموال لعضو آخر مع رسوم 500 ج.س",
  Class: "الاموال",
}

module.exports = {
  config: Black,
  onPick: async ({ api, event, args, sh: black, usersData, threadsData }) => {
    const { messageID, senderID, messageReply, mentions, threadID } = event;

    try {
      // التحقق من وجود مبلغ
      const amount = parseInt(args[0]);

      if (!amount || isNaN(amount)) {
        api.setMessageReaction("⚠️", messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ إرسال - دورا ❀ 』── ◈

❁┊ ⚠️ كيفية الاستخدام:
❁┊
❁┊ 💸 ارسال [المبلغ] @منشن
❁┊ 💸 ارسال [المبلغ] (بالرد)
❁┊
❁┊ 💰 رسوم الإرسال: 500 ج.س
❁┊
❁┊ 💡 أمثلة:
❁┊ ارسال 10000 @أحمد
❁┊ ارسال 5000 (بالرد على رسالته)
❁┊
❁┊ 📝 ملاحظة:
❁┊ • المبلغ من محفظتك
❁┊ • الرسوم تذهب للمطور
❁┊ • يُضاف للمستلم مباشرة
❁┊
◈ ──────────────── ◈`);
      }

      if (amount <= 0) {
        api.setMessageReaction("⚠️", messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ خطأ - دورا ❀ 』── ◈

❁┊ ❌ المبلغ يجب أن يكون أكبر من صفر!
❁┊
❁┊ 💡 حاول مرة أخرى بمبلغ صحيح
❁┊
◈ ──────────────── ◈`);
      }

      if (amount > 999999999999) {
        api.setMessageReaction("⚠️", messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ خطأ - دورا ❀ 』── ◈

❁┊ ❌ المبلغ كبير جداً!
❁┊
❁┊ 📊 الحد الأقصى: 999,999,999,999 ج.س
❁┊
◈ ──────────────── ◈`);
      }

      // رسوم الإرسال
      const fee = 500;
      const totalCost = amount + fee;

      // تحديد المستلم
      let recipientID;
      let recipientName;

      // عبر الرد
      if (messageReply) {
        recipientID = messageReply.senderID;
        recipientName = await usersData.getName(recipientID);
      }
      // عبر المنشن
      else if (Object.keys(mentions).length > 0) {
        recipientID = Object.keys(mentions)[0];
        recipientName = mentions[recipientID];
      }
      // لا يوجد مستلم
      else {
        api.setMessageReaction("⚠️", messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ تنبيه - دورا ❀ 』── ◈

❁┊ ⚠️ يجب تحديد المستلم!
❁┊
❁┊ 📝 الطرق:
❁┊ • منشن الشخص: ارسال 5000 @أحمد
❁┊ • رد على رسالته: ارسال 5000
❁┊
◈ ──────────────── ◈`);
      }

      // منع الإرسال للنفس
      if (recipientID === senderID) {
        api.setMessageReaction("😅", messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ خطأ - دورا ❀ 』── ◈

❁┊ 😅 لا يمكنك إرسال الأموال لنفسك!
❁┊
❁┊ 💡 اختر شخص آخر
❁┊
◈ ──────────────── ◈`);
      }

      // ✅ فحص التجميد للمُرسِل
      const threadData = await threadsData.get(threadID);
      if (threadData.data?.frozenUsers?.[senderID]) {
        const freezeData = threadData.data.frozenUsers[senderID];
        api.setMessageReaction("🧊", messageID, (err) => {}, true);
        
        return black.reply(`◈ ──『 ❀ رصيد مجمّد - دورا ❀ 』── ◈

❁┊ 🧊 رصيدك مجمّد! لا يمكنك الإرسال
❁┊
❁┊ 💰 الرصيد المجمد: ${freezeData.balance.toLocaleString()} ج.س
❁┊ 👮 بواسطة: ${freezeData.frozenByName}
❁┊ 📅 التاريخ: ${freezeData.frozenAt}
❁┊
❁┊ 💡 تواصل مع الأدمن لفك التجميد
❁┊
◈ ──────────────── ◈`);
      }

      // جلب بيانات المستخدمين
      const senderData = await usersData.get(senderID);
      const recipientData = await usersData.get(recipientID);
      
      const senderName = await usersData.getName(senderID);
      const senderMoney = senderData.money || 0;
      const recipientMoney = recipientData.money || 0;

      // التحقق من الرصيد
      if (senderMoney < totalCost) {
        api.setMessageReaction("💸", messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ رصيد غير كافٍ - دورا ❀ 』── ◈

❁┊ 💸 رصيدك لا يكفي للإرسال!
❁┊
❁┊ 📊 التكلفة الكاملة:
❁┊ • المبلغ: ${amount.toLocaleString()} ج.س
❁┊ • رسوم الإرسال: ${fee.toLocaleString()} ج.س
❁┊ • الإجمالي: ${totalCost.toLocaleString()} ج.س
❁┊
❁┊ 💰 رصيدك الحالي: ${senderMoney.toLocaleString()} ج.س
❁┊ ❌ ينقصك: ${(totalCost - senderMoney).toLocaleString()} ج.س
❁┊
◈ ──────────────── ◈`);
      }

      // تنفيذ الإرسال مباشرة
      api.setMessageReaction("💸", messageID, (err) => {}, true);

      // خصم من المُرسِل
      await usersData.set(senderID, senderMoney - totalCost, "money");

      // إضافة للمستلم
      await usersData.set(recipientID, recipientMoney + amount, "money");

      // إضافة الرسوم للمطور
      const developerID = global.config.AD[0]; // المطور الأول
      if (developerID) {
        const developerData = await usersData.get(developerID);
        const developerMoney = developerData.money || 0;
        await usersData.set(developerID, developerMoney + fee, "money");
      }

      api.setMessageReaction("✅", messageID, (err) => {}, true);

      // إشعار المُرسِل
      black.reply(`◈ ──『 ❀ تم الإرسال - دورا ❀ 』── ◈

❁┊ ✅ تم إرسال الأموال بنجاح!
❁┊
❁┊ 📤 من: ${senderName}
❁┊ 📥 إلى: ${recipientName}
❁┊
❁┊ 💰 التفاصيل:
❁┊ • المبلغ المُرسل: ${amount.toLocaleString()} ج.س
❁┊ • رسوم الإرسال: ${fee.toLocaleString()} ج.س
❁┊ • المجموع: ${totalCost.toLocaleString()} ج.س
❁┊
❁┊ 💵 رصيدك الجديد: ${(senderMoney - totalCost).toLocaleString()} ج.س
❁┊
❁┊ 📅 التاريخ: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
❁┊
❁┊ 🎉 عملية ناجحة!
❁┊
◈ ──────────────── ◈`);

      // إشعار المستلم
      api.sendMessage(
        `◈ ──『 ❀ استلام أموال - دورا ❀ 』── ◈

❁┊ 🎉 استلمت أموالاً!
❁┊
❁┊ 📤 من: ${senderName}
❁┊ 💰 المبلغ: ${amount.toLocaleString()} ج.س
❁┊
❁┊ 💵 رصيدك الجديد: ${(recipientMoney + amount).toLocaleString()} ج.س
❁┊
❁┊ 📅 التاريخ: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
❁┊
❁┊ 🙏 شكراً للثقة!
❁┊
◈ ──────────────── ◈`,
        recipientID
      );

    } catch (error) {
      console.error("Send Money Error:", error);
      api.setMessageReaction("❌", messageID, (err) => {}, true);
      return black.reply(`◈ ──『 ❀ خطأ - دورا ❀ 』── ◈

❁┊ ❌ حدث خطأ: ${error.message}
❁┊
◈ ──────────────── ◈`);
    }
  }
};