const Black = {
  name: "افتار",
  Multi: ["افاتار", "بروفايل", "بروفايلي", "بروفايله"],
  Owner: "Gry KJ",
  Auth: 0,
  Time: 0,
  Info: "صورتك او اخذ صوره غيرك",
  Class: "وسائط",
}

const cheerio = require('cheerio');
const axios = require("axios");

function getAvatarUrl(uid) {
  return `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
}

module.exports = {
  config: Black,
  onPick: async ({ api, event, args, sh: black, usersData }) => {
    const { messageReply, senderID, mentions } = event;
    
    // التحقق من المدخلات
    if (!messageReply && !args[0]) {
      api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
      return black.reply(`◈ ──『 ❀ أفاتار - دورا ❀ 』── ◈

❁┊ ⚠️ كيفية الاستخدام:
❁┊
❁┊ 📸 افتار - صورتك الشخصية
❁┊ 👤 افتار @منشن - صورة شخص
❁┊ 🔗 افتار [رابط] - من رابط فيسبوك
❁┊ 💬 افتار (بالرد) - صورة المُرسل
❁┊
❁┊ 💡 مثال:
❁┊ افتار @أحمد
❁┊ افتار https://facebook.com/...
❁┊
◈ ──────────────── ◈`);
    }

    const CGB = config.AD[0];
    const tvm = args.join(" ");

    // أمر تغيير صورة البوت (للمطور فقط)
    if (tvm === "حط" && senderID === CGB) {
      if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
        api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ تحذير - دورا ❀ 』── ◈

❁┊ ⚠️ يجب الرد على صورة!
❁┊
❁┊ 📸 رد على صورة بأمر: افتار حط
❁┊
◈ ──────────────── ◈`);
      }

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      api.changeAvatar(
        await global.funcs.str(messageReply.attachments[0].url),
        (err, data) => {
          if (err) {
            api.setMessageReaction("❌", event.messageID, (err) => {}, true);
            return black.reply(`◈ ──『 ❀ خطأ - دورا ❀ 』── ◈

❁┊ ❌ حدث خطأ في تغيير الصورة
❁┊
❁┊ 💡 حاول مرة أخرى
❁┊
◈ ──────────────── ◈`);
          }

          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
          return black.reply(`◈ ──『 ❀ نجح - دورا ❀ 』── ◈

❁┊ ✅ تم تغيير صورة البوت!
❁┊
❁┊ 🎉 الصورة الجديدة رائعة
❁┊
◈ ──────────────── ◈`);
        }
      );
      return;
    }

    // الحصول على صورة المستخدم الحالي
    if (!messageReply && !args[0]) {
      api.setMessageReaction("📸", event.messageID, (err) => {}, true);
      const avUrl = getAvatarUrl(senderID);
      const userName = await usersData.getName(senderID);

      return black.reply({
        body: `◈ ──『 ❀ أفاتار - دورا ❀ 』── ◈

❁┊ 👤 ${userName}
❁┊
❁┊ 📸 صورتك الشخصية
❁┊
❁┊ 🎨 دقة عالية: 512×512
❁┊
◈ ──────────────── ◈`,
        attachment: await global.funcs.str(avUrl)
      });
    }

    // الحصول على صورة بالرد
    if (messageReply) {
      if (messageReply.senderID === CGB) {
        api.setMessageReaction("🚫", event.messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ ممنوع - دورا ❀ 』── ◈

❁┊ 🚫 لا يمكن أخذ صورة المطور!
❁┊
❁┊ 👑 هذا الشخص محمي
❁┊
◈ ──────────────── ◈`);
      }

      api.setMessageReaction("📸", event.messageID, (err) => {}, true);
      const avUrl = getAvatarUrl(messageReply.senderID);
      const userName = await usersData.getName(messageReply.senderID);

      return black.reply({
        body: `◈ ──『 ❀ أفاتار - دورا ❀ 』── ◈

❁┊ 👤 ${userName}
❁┊
❁┊ 📸 صورته الشخصية
❁┊
❁┊ 🎨 دقة عالية: 512×512
❁┊
◈ ──────────────── ◈`,
        attachment: await global.funcs.str(avUrl)
      });
    }

    // الحصول على صورة بالمنشن
    if (Object.keys(mentions)[0] !== undefined) {
      const mentionedID = Object.keys(mentions)[0];

      if (mentionedID === CGB) {
        api.setMessageReaction("🚫", event.messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ ممنوع - دورا ❀ 』── ◈

❁┊ 🚫 لا يمكن أخذ صورة المطور!
❁┊
❁┊ 👑 هذا الشخص محمي
❁┊
◈ ──────────────── ◈`);
      }

      api.setMessageReaction("📸", event.messageID, (err) => {}, true);
      const avUrl = getAvatarUrl(mentionedID);
      const userName = await usersData.getName(mentionedID);

      return black.reply({
        body: `◈ ──『 ❀ أفاتار - دورا ❀ 』── ◈

❁┊ 👤 ${userName}
❁┊
❁┊ 📸 صورته الشخصية
❁┊
❁┊ 🎨 دقة عالية: 512×512
❁┊
◈ ──────────────── ◈`,
        attachment: await global.funcs.str(avUrl)
      });
    }

    // الحصول على صورة من رابط فيسبوك
    if (tvm.startsWith("https://facebook") || tvm.startsWith("https://www.facebook") || tvm.startsWith("https://m.facebook")) {
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      try {
        const res = await axios.get(tvm);
        const html = res.data;
        const $ = cheerio.load(html);

        const metaTags = {};
        $('meta').each((index, element) => {
          const name = $(element).attr('name');
          const content = $(element).attr('content');
          if (name && content) {
            metaTags[name] = content;
          }
        });

        const UIDD = metaTags['apple-itunes-app'];
        const UID = UIDD?.split('//profile/')[1] || "";

        if (!UID) {
          api.setMessageReaction("❌", event.messageID, (err) => {}, true);
          return black.reply(`◈ ──『 ❀ خطأ - دورا ❀ 』── ◈

❁┊ ❌ لم أتمكن من العثور على الحساب
❁┊
❁┊ 🔗 تأكد من الرابط:
❁┊ • يجب أن يكون رابط بروفايل
❁┊ • يبدأ بـ https://facebook.com
❁┊ • الحساب غير محذوف
❁┊
❁┊ 💡 مثال صحيح:
❁┊ افتار https://facebook.com/profile.php?id=...
❁┊
◈ ──────────────── ◈`);
        }

        api.setMessageReaction("📸", event.messageID, (err) => {}, true);
        const avUrl = getAvatarUrl(UID);

        // محاولة الحصول على الاسم
        let userName = "المستخدم";
        try {
          const userInfo = await api.getUserInfo(UID);
          userName = userInfo[UID]?.name || "المستخدم";
        } catch (err) {
          userName = "المستخدم";
        }

        return black.reply({
          body: `◈ ──『 ❀ أفاتار - دورا ❀ 』── ◈

❁┊ 👤 ${userName}
❁┊
❁┊ 📸 صورته من الرابط
❁┊
❁┊ 🆔 الـID: ${UID}
❁┊ 🎨 دقة عالية: 512×512
❁┊
◈ ──────────────── ◈`,
          attachment: await global.funcs.str(avUrl)
        });
      } catch (error) {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        return black.reply(`◈ ──『 ❀ خطأ - دورا ❀ 』── ◈

❁┊ ❌ حدث خطأ في جلب الصورة
❁┊
❁┊ 🔍 الأسباب المحتملة:
❁┊ • الرابط غير صحيح
❁┊ • الحساب محذوف أو محظور
❁┊ • مشكلة في الاتصال
❁┊
❁┊ 💡 حاول مرة أخرى
❁┊
◈ ──────────────── ◈`);
      }
    }
  }
};