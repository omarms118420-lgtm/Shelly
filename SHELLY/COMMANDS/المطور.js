const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "المطور",
    Auth: 0,
    Multi: ["dev", "developer", "مطور"],
    Owner: "Hamoudi San",
    Info: "Display bot developer information",
    Class: "Information",
    How: "المطور",
    Time: 0
  },

  onPick: async function({ api, sh, event, usersData }) {
    try {
      const senderID = event.senderID;
      const userName = await usersData.getName(senderID);
      
      // رسالة البحث عن المطور
      await sh.reply(`🤖🔍 ${userName}، هل ترى المطور؟ أنا لا أراه... إذا رأيت المطور قل: "مطور" 🍭`);
      
      // انتظار 2 ثانية
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // رسالة أحسنت
      await sh.reply("✨ أحسنت 🎉✨");
      
      // انتظار ثانية واحدة
      await new Promise(resolve => setTimeout(resolve, 1000));

      // رسالة معلومات المطور
      const devMessage = `
🌈✨🧑‍💻 معلومات المطور 🧑‍💻✨🌈

👤 الاسم: 🍭💖 حمــودي ســان 💖🍭

🔗 فيسبوك:  
https://www.facebook.com/DoraYogiEXE

🌍 البلد: السودان 🇸🇩
🎭 الشخصية المفضلة: Dora
🎮 Free Fire: 2717565103 🏴‍☠️
📱 واتساب: +249900042500

💖🍭 "يـــعجــز الأطفــال والمراهقــون عــن تقليــدي" 🍭💖
♥️🥰 أحبكم يا سنافري — أفعل ما بوسعي لإسعادكم 🌸
      `.trim();

      // صور المطور
      const images = [
        "https://i.postimg.cc/2ymCpCZ0/1763208639608.jpg",
        "https://i.postimg.cc/mrzLCXRW/1763208658902.jpg"
      ];
      
      // اختيار صورة عشوائية
      const randomImage = images[Math.floor(Math.random() * images.length)];
      
      try {
        // تحميل الصورة
        const imageResponse = await axios.get(randomImage, { 
          responseType: 'stream',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const cachePath = path.join(__dirname, 'cache');
        const imagePath = path.join(cachePath, `developer_${Date.now()}.jpg`);
        
        // التأكد من وجود مجلد cache
        await fs.ensureDir(cachePath);
        
        const writer = fs.createWriteStream(imagePath);
        imageResponse.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        // إرسال الرسالة مع الصورة
        await api.sendMessage({
          body: devMessage,
          attachment: fs.createReadStream(imagePath)
        }, event.threadID, event.messageID);
        
        // حذف الصورة بعد 5 ثواني
        setTimeout(() => {
          try {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          } catch (e) {
            console.log('Could not delete temp file:', e.message);
          }
        }, 5000);
        
      } catch (imgError) {
        console.error("Error loading image:", imgError.message);
        // إذا فشل تحميل الصورة، إرسال النص فقط
        return sh.reply(devMessage);
      }

    } catch (err) {
      console.error("Developer command error:", err);
      return sh.reply("❌ حدث خطأ أثناء عرض معلومات المطور");
    }
  },

  // دالة اختيارية للتعامل مع جميع الرسائل
  All: async function({ event, sh, usersData }) {
    try {
      const body = event.body?.toLowerCase();
      
      // إذا ذكر أحد كلمة "مطور" في رسالته
      if (body && (body.includes('مطور') || body.includes('developer'))) {
        // فرصة 5% للرد التلقائي
        if (Math.random() < 0.05) {
          const reactions = ['😎', '👨‍💻', '🍭', '💖', '✨'];
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
          await sh.react(randomReaction);
        }
      }
    } catch (err) {
      // تجاهل الأخطاء في All
    }
  }
};