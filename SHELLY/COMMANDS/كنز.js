const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "كنز",
    Auth: 0,
    Multi: ["كنز", "treasure", "صندوق"],
    Owner: "حمودي سان",
    Info: "احصل على كنز عشوائي! 💎",
    Class: "ترفيه",
    How: "كنز",
    Time: 10
  },

  onPick: async function({ api, event, sh, usersData }) {
    try {
      sh.react("🎁");

      // مصفوفة روابط الكنوز
      const treasures = [
        "https://i.ibb.co/chYfcV75/Picsart-25-12-20-15-06-05-856.jpg",
        "https://i.ibb.co/Q3cxzPbF/Picsart-25-12-20-15-04-51-165.jpg",
        "https://i.ibb.co/5WKZ15Bh/Picsart-25-12-20-15-03-15-035.jpg",
        "https://i.ibb.co/fdMNjGyf/Picsart-25-12-20-15-02-28-159.jpg",
        "https://i.ibb.co/nqQJSNZ1/Picsart-25-12-20-14-58-21-786.jpg",
        "https://i.ibb.co/39sNg1g8/Picsart-25-12-20-14-57-15-481.jpg",
        "https://i.ibb.co/yBR8cntg/Picsart-25-12-20-14-56-20-303.jpg",
        "https://i.ibb.co/Gvmgwscw/Picsart-25-12-20-14-55-02-072.jpg",
        "https://i.ibb.co/jPyxDX0W/Picsart-25-12-20-14-54-16-074.jpg",
        "https://i.ibb.co/bRHqLbhm/Picsart-25-12-20-14-52-29-418.jpg",
        "https://i.ibb.co/PzYjxYCT/Picsart-25-12-20-14-53-12-429.jpg",
        "https://i.ibb.co/99d2BTSp/Picsart-25-12-20-14-51-58-167.jpg",
        "https://i.ibb.co/gLMwPHf3/Picsart-25-12-20-14-51-12-882.jpg",
        "https://i.ibb.co/VpW0BxW3/Picsart-25-12-20-14-49-57-245.jpg",
        "https://i.ibb.co/Wp6q6sqR/Picsart-25-12-20-14-49-04-357.jpg"
      ];

      // رسائل عشوائية
      const messages = [
        "🎉 مبروك! لقد وجدت كنزاً نادراً!",
        "✨ واو! هذا كنز ثمين جداً!",
        "💎 يا للروعة! كنز أسطوري!",
        "🏆 رائع! هذا كنز نفيس!",
        "🌟 ما شاء الله! كنز مميز!",
        "💰 عظيم! لقد حصلت على كنز!",
        "🎁 تهانينا! كنز رائع!",
        "⭐ يا سلام! كنز مذهل!",
        "🔮 مدهش! كنز سحري!",
        "👑 فخم! كنز ملكي!"
      ];

      // اختيار كنز عشوائي
      const randomTreasure = treasures[Math.floor(Math.random() * treasures.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      // رسالة الانتظار
      await sh.reply("🔍 جاري البحث عن كنز...\n⏳ انتظر قليلاً...");

      // تحميل الصورة
      const cacheDir = path.join(__dirname, '..', 'cache');
      await fs.ensureDir(cacheDir);

      const imagePath = path.join(cacheDir, `treasure_${Date.now()}.jpg`);
      
      const response = await axios.get(randomTreasure, {
        responseType: 'arraybuffer',
        timeout: 15000
      });

      await fs.writeFile(imagePath, Buffer.from(response.data));

      // الحصول على اسم المستخدم
      const userData = await usersData.get(event.senderID);
      const userName = userData?.name || "المستكشف";

      // حساب قيمة الكنز (عشوائي من 100 إلى 10000)
      const treasureValue = Math.floor(Math.random() * 9901) + 100;

      // رقم الكنز
      const treasureNumber = treasures.indexOf(randomTreasure) + 1;

      // إرسال الكنز
      sh.react("💎");

      await api.sendMessage({
        body: 
          `${randomMessage}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🧭 المستكشف: ${userName}\n` +
          `📦 رقم الكنز: #${treasureNumber}\n` +
          `💰 القيمة: ${treasureValue.toLocaleString()} 💵\n` +
          `🎲 نسبة الحظ: ${Math.floor(Math.random() * 100) + 1}%\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `✨ استمتع بكنزك! 🏴‍☠️`,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID, () => {
        // حذف الصورة بعد الإرسال
        setTimeout(() => {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }, 5000);
      }, event.messageID);

    } catch (error) {
      console.error("خطأ في أمر الكنز:", error);
      sh.react("❌");
      
      return sh.reply(
        "❌ حدث خطأ أثناء البحث عن الكنز!\n" +
        "💡 حاول مرة أخرى"
      );
    }
  }
};