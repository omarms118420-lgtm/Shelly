const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "تحميل",
  Auth: 0,
  Owner: "R3D Edit",
  Info: "تحميل تلقائي من أي رابط ⚡",
  Class: "المطور",
  aliases: ["dl", "download"],
  cooldowns: 5
};

module.exports.onPick = async ({ event, api, sh, args }) => {
  const { threadID, messageID } = event;
  sh.react("ℹ️");
  return sh.reply(
    "◈ ──『 ❀ التحميل التلقائي ❀ 』── ◈\n\n" +
    "❁┊📝 كيفية الاستخدام:\n" +
    "❁┊• فقط أرسل أي رابط فيديو\n" +
    "❁┊• سيتم التحميل تلقائياً\n\n" +
    "❁┊🌐 الروابط المدعومة:\n" +
    "❁┊• Facebook 📘\n" +
    "❁┊• YouTube 📺\n" +
    "❁┊• TikTok 🎵\n" +
    "❁┊• Instagram 📷\n" +
    "❁┊• Twitter 🐦\n" +
    "❁┊• والمزيد...\n\n" +
    "◈ ──────────── ◈"
  );
};

module.exports.All = async ({ event, api, sh }) => {
  const { body, senderID, threadID, messageID } = event;
  try {
    if (senderID === api.getCurrentUserID()) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundURLs = body?.match(urlRegex);
    if (!foundURLs || foundURLs.length === 0) return;
    const videoUrl = foundURLs[0];

    sh.react("⏳");
    
    const apiResponse = await axios.get(`https://noobs-api.top/dipto/alldl?url=${encodeURIComponent(videoUrl)}`, {
      timeout: 60000
    });
    const videoData = apiResponse.data;

    if (!videoData || !videoData.result) {
      sh.react("❌");
      return;
    }

    const cacheDir = path.join(__dirname, "..", "..", "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const videoPath = path.join(cacheDir, `download_${Date.now()}.mp4`);
    const videoResponse = await axios.get(videoData.result, {
      responseType: "stream",
      timeout: 120000
    });
    const writer = fs.createWriteStream(videoPath);
    videoResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const fileSize = fs.statSync(videoPath).size;
    const maxSize = 87 * 1024 * 1024;
    
    if (fileSize > maxSize) {
      fs.unlinkSync(videoPath);
      sh.react("❌");
      return sh.reply(
        "◈ ──『 ❀ تنبيه ❀ 』── ◈\n\n" +
        `❁┊❌ الحجم كبير جداً!\n` +
        `❁┊📊 الحجم: ${(fileSize / 1024 / 1024).toFixed(2)} MB\n` +
        `❁┊📏 الحد الأقصى: 87 MB\n\n` +
        "◈ ──────────── ◈"
      );
    }

    let Dora = "◈ ──『 ❀ تحميل تلقائي ❀ 』── ◈\n\n";
    
    if (videoData.title) {
      const title = videoData.title.length > 80 ? videoData.title.substring(0, 80) + "..." : videoData.title;
      Dora += `❁┊📹 العنوان:\n❁┊${title}\n\n`;
    }
    
    Dora += `❁┊📊 الحجم: ${(fileSize / 1024 / 1024).toFixed(2)} MB\n`;
    Dora += `❁┊✅ تم التحميل بنجاح\n`;
    Dora += `❁┊🎬 استمتع بالمشاهدة\n\n`;
    Dora += "◈ ──────────── ◈";

    sh.react("✅");
    await sh.reply({ 
      body: Dora, 
      attachment: fs.createReadStream(videoPath) 
    });

    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    
  } catch (error) {
    console.error("Auto Download Error:", error);
    sh.react("❌");
    sh.reply(
      "◈ ──『 ❀ خطأ ❀ 』── ◈\n\n" +
      "❁┊❌ حدث خطأ أثناء التحميل\n" +
      "❁┊🔄 يرجى المحاولة مرة أخرى\n\n" +
      "◈ ──────────── ◈"
    );
  }
};