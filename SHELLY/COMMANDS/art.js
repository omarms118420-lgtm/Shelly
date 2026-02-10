const FormData = require('form-data');
const crypto = require('crypto');
const { imageSize } = require('image-size');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "art",
    Multi: ["ارت", "تحويل", "ستايل"],
    Auth: 0,
    Owner: "Gry KJ",
    Info: "تحويل صورك إلى ستايلات أنمي مذهلة 🎨",
    Class: "ذكاء"
  },

  onPick: async function({ api, event, args, sh, usersData, text }) {
    const { senderID, messageReply, threadID, messageID } = event;
    const userData = await usersData.get(senderID);
    const cmd = args[0]?.toLowerCase();

    // ═══════════════ عرض القائمة ═══════════════
    if (!cmd) {
      return sh.reply(
        `🎨 أوامر Art - محول الصور الاحترافي\n\n` +
        `🖼️ art [رقم] - رد على صورة للتحويل\n` +
        `📋 art موديلات [صفحة] - عرض الستايلات\n` +
        `🔍 art بحث <كلمة> - البحث عن ستايل\n` +
        `⭐ art مفضل <رقم> - حفظ ستايلك المفضل\n` +
        `📊 art احصائيات - عدد الستايلات المتاحة\n\n` +
        `مثال: art 29 (رد على صورة)`
      );
    }

    // ═══════════════ حفظ المفضل ═══════════════
    if (cmd === "مفضل" || cmd === "fav") {
      const fav = parseInt(args[1]);
      
      if (!fav) {
        return sh.reply("⭐ اكتب رقم الستايل\n\nمثال: art مفضل 29");
      }

      const models = await Models();
      
      if (fav < 0 || fav >= models.length) {
        return sh.reply(`❌ رقم خاطئ! اختر بين 0 و ${models.length - 1}`);
      }

      await usersData.set(senderID, fav, "data.styleNum");
      sh.react("✅");
      return sh.reply(
        `✅ تم حفظ الستايل المفضل!\n\n` +
        `🎭 ${models[fav].name}\n` +
        `🆔 رقم: ${fav}\n\n` +
        `الآن فقط رد على صورة بدون رقم وسأستخدم هذا الستايل 🎨`
      );
    }

    // ═══════════════ الإحصائيات ═══════════════
    if (cmd === "احصائيات" || cmd === "stats") {
      sh.react("⏳");
      const models = await Models();
      return sh.reply(
        `📊 إحصائيات Art\n\n` +
        `🎨 عدد الستايلات: ${models.length}\n` +
        `⭐ ستايلك المفضل: ${userData.data?.styleNum || "غير محدد"}\n` +
        `🔥 الأكثر شعبية: Anime Style\n\n` +
        `💡 اكتب "art موديلات" لعرض القائمة الكاملة`
      );
    }

    // ═══════════════ عرض الموديلات ═══════════════
    if (cmd === "موديلات" || cmd === "models" || cmd === "list") {
      sh.react("📋");
      const page = parseInt(args[1]) || 1;
      const models = await Models();
      
      return await showModels(models, page, sh, senderID, "🎨 قائمة جميع الستايلات");
    }

    // ═══════════════ البحث ═══════════════
    if (cmd === "بحث" || cmd === "search") {
      const searchQuery = args.slice(1).join(" ").trim();
      
      if (!searchQuery) {
        return sh.reply("🔍 اكتب كلمة للبحث\n\nمثال: art بحث anime");
      }

      sh.react("🔍");
      const models = await Models(searchQuery);
      
      if (models.length === 0) {
        return sh.reply(`😢 لم أجد ستايلات لـ "${searchQuery}"\n\nجرب كلمات أخرى`);
      }

      return await showModels(models, 1, sh, senderID, `🔎 نتائج "${searchQuery}"`);
    }

    // ═══════════════ تحويل الصورة ═══════════════
    if (messageReply?.attachments?.[0]?.type === "photo") {
      let styleNum = 29; // الافتراضي: Starry Girl

      // التحقق من الرقم المدخل
      if (args[0] && !isNaN(args[0])) {
        styleNum = parseInt(args[0]);
      } else if (userData.data?.styleNum !== undefined) {
        styleNum = userData.data.styleNum;
      }

      const models = await Models();
      
      if (styleNum < 0 || styleNum >= models.length) {
        return sh.reply(`❌ رقم خاطئ! اختر بين 0 و ${models.length - 1}`);
      }

      const selectedStyle = models[styleNum];
      
      sh.react("🎨");
      await sh.reply(
        `🎨 جاري التحويل...\n\n` +
        `🎭 الستايل: ${selectedStyle.name}\n` +
        `🆔 رقم: ${styleNum}\n\n` +
        `⏱️ انتظر 10-30 ثانية...`
      );

      try {
        // تحميل الصورة
        const imgResponse = await axios.get(messageReply.attachments[0].url, {
          responseType: "arraybuffer",
          timeout: 30000
        });

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        const randNum = Math.floor(Math.random() * 999999);
        const imgPath = path.join(cacheDir, `Art${randNum}.png`);
        fs.writeFileSync(imgPath, imgResponse.data);

        // تحويل الصورة
        const result = await ProcessImage(imgPath, selectedStyle.id);

        // إرسال النتيجة
        const resultStream = await getStream(result);
        
        await api.sendMessage({
          body: `✅ تم التحويل بنجاح!\n\n🎭 ${selectedStyle.name}\n🆔 ${styleNum}`,
          attachment: resultStream
        }, threadID, messageID);

        sh.react("✅");

        // حذف الملف
        setTimeout(() => {
          try {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          } catch (e) {}
        }, 5000);

      } catch (error) {
        console.error("Art Error:", error.message);
        sh.react("❌");
        return sh.reply(
          `❌ فشل التحويل!\n\n` +
          `السبب: ${error.message}\n\n` +
          `💡 جرب:\n` +
          `• صورة أخرى\n` +
          `• ستايل مختلف\n` +
          `• حاول مرة أخرى بعد قليل`
        );
      }
    } else {
      return sh.reply(
        `📸 رد على صورة لتحويلها!\n\n` +
        `مثال:\n` +
        `• art 29 (ستايل رقم 29)\n` +
        `• art (ستايلك المفضل)\n\n` +
        `📋 اكتب "art موديلات" لعرض القائمة`
      );
    }
  },

  // ═══════════════ معالجة الرد (التصفح) ═══════════════
  Reply: async function({ event, Reply, sh }) {
    if (!Reply || Reply.name !== "art") return;
    if (event.senderID !== Reply.author) return;

    const { pages, title } = Reply;
    const page = parseInt(event.body) || 1;

    return await showModels(pages, page, sh, event.senderID, title);
  }
};

// ═══════════════ دوال مساعدة ═══════════════

// عرض الموديلات مع التصفح
async function showModels(models, page, sh, author, title) {
  const pageSize = 30; // زيادة العدد لكل صفحة
  const totalPages = Math.ceil(models.length / pageSize);
  
  if (page < 1 || page > totalPages) {
    return sh.reply(`📄 رقم خاطئ! اختر بين 1 و ${totalPages}`);
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const modelsPage = models.slice(start, end);

  let msg = `${title}\n`;
  msg += `📄 صفحة ${page}/${totalPages} (${models.length} ستايل)\n\n`;
  
  modelsPage.forEach((m) => {
    msg += `${m.originalIndex}. ${m.name}\n`;
  });

  msg += `\n💬 رد برقم الصفحة التالية (${page + 1}-${totalPages})`;

  const sent = await sh.reply(msg);
  
  if (sent?.messageID) {
    global.shelly.Reply.push({
      name: "art",
      ID: sent.messageID,
      author: author,
      pages: models,
      title: title
    });
  }
}

// جلب stream من URL
async function getStream(url) {
  const response = await axios.get(url, { 
    responseType: 'stream',
    timeout: 30000
  });
  return response.data;
}

// جلب قائمة الموديلات
async function Models(searchQuery = "") {
  const idgen = genUID();
  
  const config = {
    method: 'GET',
    url: `https://be.aimirror.fun/filter_search?uid=${idgen}`,
    headers: {
      'User-Agent': 'AIMirror/6.2.4+168 (android)',
      'Accept-Encoding': 'gzip',
      'uid': idgen,
      'env': 'PRO',
      'accept-language': 'en',
      'package-name': 'com.ai.polyverse.mirror',
      'app-version': '6.2.4+168'
    },
    timeout: 15000
  };

  const res = await axios.request(config);
  
  let models = res.data.search_info
    .filter(i => !i.key_words.includes("video"))
    .map((i, index) => ({
      id: i.model_id,
      name: i.model,
      key_words: i.key_words,
      originalIndex: index
    }))
    .sort((a, b) => Number(a.id) - Number(b.id));

  // إزالة التكرار
  models = [...new Map(models.map(i => [i.id, i])).values()];
  models = [...new Map(models.map(i => [i.name, i])).values()];
  
  // إعادة ترقيم
  models = models.map((model, index) => ({
    ...model,
    originalIndex: index
  }));

  // البحث
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    models = models.filter(model =>
      model.name.toLowerCase().includes(lowerQuery) ||
      model.key_words.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
  }

  return models;
}

// معالجة الصورة (الدالة الرئيسية)
async function ProcessImage(imagePath, modelId) {
  const idgen = genUID();
  
  // 1. توليد توكن
  const token = await genImageToken(idgen);
  
  // 2. رفع الصورة
  await uploadImage(token, imagePath);
  
  // 3. إنشاء مهمة التحويل
  const task = await createDrawTask(idgen, modelId, token, imagePath);
  
  // 4. انتظار النتيجة
  const result = await waitForResult(idgen, task.draw_request_id);
  
  return result.generated_image_addresses[0];
}

// توليد توكن الصورة
async function genImageToken(uid) {
  const hash = crypto.randomBytes(20).toString('hex');
  
  const config = {
    method: 'GET',
    url: `https://be.aimirror.fun/app_token/v2?cropped_image_hash=${hash}.jpeg&uid=${uid}`,
    headers: {
      'User-Agent': 'AIMirror/6.2.4+168 (android)',
      'uid': uid,
      'env': 'PRO',
      'package-name': 'com.ai.polyverse.mirror',
      'app-version': '6.2.4+168'
    }
  };

  const res = await axios.request(config);
  return res.data;
}

// رفع الصورة
async function uploadImage(token, imagePath) {
  const data = new FormData();
  data.append('name', token.name);
  data.append('key', token.key);
  data.append('policy', token.policy);
  data.append('OSSAccessKeyId', token.OSSAccessKeyId);
  data.append('success_action_status', token.success_action_status);
  data.append('signature', token.signature);
  data.append('backend_type', token.backend_type);
  data.append('region', token.region);
  data.append('file', fs.createReadStream(imagePath));

  const config = {
    method: 'POST',
    url: 'https://aimirror-images-sg.oss-ap-southeast-1.aliyuncs.com',
    headers: { 'Accept-Encoding': 'gzip' },
    data: data
  };

  await axios.request(config);
}

// إنشاء مهمة التحويل
async function createDrawTask(uid, modelId, token, imagePath) {
  const imgData = fs.readFileSync(imagePath);
  const { width, height } = imageSize(Buffer.from(imgData));

  const data = JSON.stringify({
    "model_id": parseInt(modelId),
    "cropped_image_key": token.key,
    "cropped_height": height,
    "cropped_width": width,
    "package_name": "com.ai.polyverse.mirror",
    "ext_args": { "imagine_value2": 50, "custom_prompt": "" },
    "version": "6.2.4",
    "force_default_pose": true,
    "is_free_trial": true,
    "free_size": true
  });

  const config = {
    method: 'POST',
    url: `https://be.aimirror.fun/draw?uid=${uid}`,
    headers: {
      'User-Agent': 'AIMirror/6.2.4+168 (android)',
      'Content-Type': 'application/json',
      'uid': uid,
      'env': 'PRO',
      'package-name': 'com.ai.polyverse.mirror',
      'app-version': '6.2.4+168'
    },
    data: data
  };

  const res = await axios.request(config);
  return res.data;
}

// انتظار النتيجة
async function waitForResult(uid, taskId) {
  let status = "WAITING";
  let result;
  
  while (status !== "SUCCEED") {
    await new Promise(r => setTimeout(r, 2000)); // انتظار ثانيتين
    
    const config = {
      method: 'GET',
      url: `https://be.aimirror.fun/draw/process?draw_request_id=${taskId}&uid=${uid}`,
      headers: {
        'User-Agent': 'AIMirror/6.2.4+168 (android)',
        'uid': uid,
        'env': 'PRO',
        'package-name': 'com.ai.polyverse.mirror',
        'app-version': '6.2.4+168'
      }
    };

    const res = await axios.request(config);
    result = res.data;
    status = result.draw_status;
  }

  return result;
}

// توليد UID
function genUID() {
  const prefix = 'fe20871';
  const n = 16 - prefix.length;
  const hexChars = '0123456789abcdef';
  let random = '';
  
  for (let i = 0; i < n; i++) {
    random += hexChars[Math.floor(Math.random() * 16)];
  }
  
  return prefix + random;
}