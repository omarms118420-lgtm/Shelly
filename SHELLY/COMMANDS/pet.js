const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "حيوان",
  Auth: 0,
  Owner: "Gry KJ",
  Info: "تأثيرات حيوانات أليفة على الصور",
  Class: "صور",
  hello: {
    cooldownTime: 10000
  }
};

module.exports.onPick = async ({ event, api, args }) => {
  const { threadID, messageID, senderID, mentions, messageReply, type } = event;

  try {
    // تحديد نوع التأثير
    const effectType = args[0] || "pet";
    const validEffects = ["pet", "triggered", "jail", "gay", "wanted"];

    if (!validEffects.includes(effectType)) {
      return api.sendMessage(
        `❌ تأثير غير صالح!\n\n✅ التأثيرات المتاحة:\n• pet - مخلب حيوان 🐾\n• triggered - غاضب 😡\n• jail - سجن 🔒\n• gay - قوس قزح 🌈\n• wanted - مطلوب 🔍\n\n📝 مثال: حيوان pet @شخص`,
        threadID,
        messageID
      );
    }

    // تحديد المستخدم
    let uid;
    let targetName = "صورتك";

    if (Object.keys(mentions).length > 0) {
      uid = Object.keys(mentions)[0];
      targetName = mentions[uid].replace("@", "");
    } else if (type === "message_reply" && messageReply) {
      uid = messageReply.senderID;
      targetName = "صورة الشخص";
    } else {
      uid = senderID;
    }

    // رسائل التأثيرات
    const effectMessages = {
      pet: "🐾 تأثير المخلب الأليف",
      triggered: "😡 تأثير الغضب",
      jail: "🔒 تأثير السجن",
      gay: "🌈 تأثير قوس القزح",
      wanted: "🔍 تأثير المطلوب"
    };

    api.sendMessage(`⏳ جاري تطبيق ${effectMessages[effectType]}...`, threadID, messageID);

    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

    // استدعاء API حسب نوع التأثير
    const apiEndpoints = {
      pet: `https://api.popcat.xyz/v2/pet?image=${encodeURIComponent(avatarURL)}`,
      triggered: `https://api.popcat.xyz/triggered?image=${encodeURIComponent(avatarURL)}`,
      jail: `https://api.popcat.xyz/jail?image=${encodeURIComponent(avatarURL)}`,
      gay: `https://api.popcat.xyz/gay?image=${encodeURIComponent(avatarURL)}`,
      wanted: `https://api.popcat.xyz/wanted?image=${encodeURIComponent(avatarURL)}`
    };

    const response = await axios.get(apiEndpoints[effectType], {
      responseType: "arraybuffer",
      timeout: 30000
    });

    if (!response.data) {
      throw new Error("لم يتم استلام بيانات الصورة");
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const extension = effectType === "pet" || effectType === "triggered" ? "gif" : "png";
    const filePath = path.join(cacheDir, `${effectType}_${uid}_${Date.now()}.${extension}`);
    fs.writeFileSync(filePath, Buffer.from(response.data));

    const message = {
      body: `${effectMessages[effectType]} على ${targetName}!\n\n✨ تم تطبيق التأثير بنجاح\n💕 استمتع بالصورة`,
      attachment: fs.createReadStream(filePath)
    };

    api.sendMessage(message, threadID, () => {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("خطأ في حذف الملف:", err);
      }
    }, messageID);

  } catch (error) {
    console.error("خطأ في التأثير:", error);
    api.sendMessage(
      `❌ حدث خطأ في تطبيق التأثير!\n💬 ${error.message}\n\n💡 حاول مرة أخرى`,
      threadID,
      messageID
    );
  }
};