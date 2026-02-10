const axios = require('axios');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

let cache = {};

// ============= دالة السكراب الجديدة =============
async function scrapePinterest(query, limit = 50) {
  const params = {
    data: JSON.stringify({
      options: {
        query: query,
        scope: "pins",
        appliedProductFilters: "---",
        domains: null,
        user: null,
        seoDrawerEnabled: false,
        applied_unified_filters: null,
        auto_correction_disabled: false,
        journey_depth: null,
        source_module_id: null,
        selected_one_bar_modules: null,
        query_pin_sigs: null,
        page_size: limit,
        price_max: null,
        price_min: null,
        request_params: null,
        top_pin_ids: null,
        article: null,
        corpus: null,
        customized_rerank_type: null,
        filters: null,
        rs: "ac",
        redux_normalize_feed: true
      },
      context: {}
    }),
    _: Date.now()
  };

  const headers = {
    "accept": "application/json, text/javascript, */*, q=0.01",
    "x-pinterest-appstate": "active",
    "x-pinterest-pws-handler": "www/search/[scope].js",
    "x-pinterest-source-url": `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,
    "cookie": "_pinterest_sess=TWc9PSZ4NDFaQmU0Ymh3OWtMUy8xaVA1OGJVUlhCTUg3Q1B5MXJSb3VuM2tPbEJMcXd6MFppYVE4YnZDRHY0N25JVHZkVlRIL0xKa0RXRWE0RkdIVGlmYmg3YjJBUjBsYnRucHdxSVcvQ25tQmR3VT0mQVk4cWNkemVWbnlRNXNNSzMzTURKNXhWV2tNPQ==; _auth=0; csrftoken=936140a434d486d3b1cfb2b10ab494ab; _routing_id=\"1d08a466-2002-4691-af11-647525500eb2\"; g_state={\"i_l\":0,\"i_ll\":1761916384803}",
    "Referer": "https://www.pinterest.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  };

  try {
    console.log(`[Pinterest] Scraping for query: ${query}`);
    
    const { data } = await axios.get("https://www.pinterest.com/resource/BaseSearchResource/get/", {
      headers,
      params,
      timeout: 15000
    });

    // استخراج روابط الصور باستخدام regex
    const imageUrls = JSON.stringify(data)
      .match(/https:\/\/i\.pinimg\.com\/(736|1200)x\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]+\.(jpg|png|webp)/gi);

    if (!imageUrls || imageUrls.length === 0) {
      console.log("[Pinterest] No images found in response");
      return [];
    }

    // إزالة التكرارات
    const uniqueUrls = [...new Set(imageUrls)];
    console.log(`[Pinterest] Found ${uniqueUrls.length} unique images`);
    
    return uniqueUrls;

  } catch (error) {
    console.error("[Pinterest] Scraping error:", error.message);
    throw error;
  }
}

// ============= Module Export =============
module.exports.config = {
  name: "بينترست",
  Auth: 0,
  Owner: "Updated Scraper",
  Info: "البحث عن صور على Pinterest وإرسالها",
  Class: "البحث",
  Multi: ["pin", "pinterest", "بين"],
  Time: 5,
  How: "بينترست <كلمة_مفتاحية>\nمثال: بينترست anime girl"
};

module.exports.onPick = async function ({ sh, args, event }) {
  const threadID = event.threadID;
  const senderID = event.senderID;
  
  if (!args[0]) {
    return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊⚠️ يرجى إدخال كلمة مفتاحية للبحث
❁┊💡 مثال: بينترست anime girl
◈ ──────────── ◈`);
  }
  
  const query = args.join(" ");
  const limit = 10; // عدد الصور في كل دفعة

  // تهيئة الـ cache
  if (!cache[threadID]) cache[threadID] = {};
  if (!cache[threadID][query]) {
    cache[threadID][query] = { used: new Set(), all: [] };
  }

  let searchingMsg;

  // إذا كان البحث جديد، نجلب الصور من Pinterest
  if (cache[threadID][query].all.length === 0) {
    searchingMsg = await sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊🔍 جاري البحث عن: ${query}
❁┊⏳ انتظر قليلاً...
◈ ──────────── ◈`);

    try {
      const imageUrls = await scrapePinterest(query, 200); // جلب 200 صورة
      
      if (!imageUrls || imageUrls.length === 0) {
        if (searchingMsg) {
          try { await sh.unsend(searchingMsg.messageID); } catch (e) {}
        }
        return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊❌ لم يتم العثور على نتائج
❁┊💡 جرب كلمة أخرى
◈ ──────────── ◈`);
      }

      cache[threadID][query].all = imageUrls;

      if (searchingMsg) {
        try { await sh.unsend(searchingMsg.messageID); } catch (e) {}
      }

      await sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊✅ تم العثور على ${imageUrls.length} صورة!
❁┊📸 جاري إرسال الصور...
◈ ──────────── ◈`);

    } catch (error) {
      console.error("[Pinterest] Error:", error);
      if (searchingMsg) {
        try { await sh.unsend(searchingMsg.messageID); } catch (e) {}
      }
      return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊❌ فشل الاتصال بـ Pinterest
❁┊🔄 حاول لاحقاً
◈ ──────────── ◈`);
    }
  }

  // اختيار صور لم تستخدم بعد
  const availableUrls = cache[threadID][query].all.filter(
    url => !cache[threadID][query].used.has(url)
  );

  if (availableUrls.length === 0) {
    return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊✔️ تم استخدام جميع الصور
❁┊💡 جرب كلمة بحث أخرى
◈ ──────────── ◈`);
  }

  const toSend = availableUrls.slice(0, limit);
  const attachments = [];
  const cacheDir = path.join(__dirname, 'cache');

  // إنشاء مجلد cache إن لم يكن موجوداً
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  try {
    for (let i = 0; i < toSend.length; i++) {
      const url = toSend[i];
      const filename = `pinterest_${Date.now()}_${i}.jpg`;
      const filepath = path.join(cacheDir, filename);

      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 10000
        });

        await fsPromises.writeFile(filepath, response.data);
        attachments.push(fs.createReadStream(filepath));
        cache[threadID][query].used.add(url);

        // حذف الملف بعد 60 ثانية
        setTimeout(() => {
          try {
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
          } catch (e) {
            console.error("[Pinterest] Delete error:", e);
          }
        }, 60000);

      } catch (imgError) {
        console.error(`[Pinterest] Failed to download image: ${url}`, imgError.message);
      }
    }

    if (attachments.length === 0) {
      return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊❌ فشل تحميل الصور
❁┊🔄 حاول مرة أخرى
◈ ──────────── ◈`);
    }

    const remaining = availableUrls.length - toSend.length;
    const hasMore = remaining > 0;

    const sent = await sh.reply({
      body: `◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊✅ تم إرسال ${attachments.length} صورة
❁┊🔍 البحث: ${query}
${hasMore ? `❁┊📊 المتبقي: ${remaining} صورة\n❁┊👍 اضغط لايك للحصول على المزيد!` : `❁┊✔️ تم إرسال جميع الصور`}
◈ ──────────── ◈`,
      attachment: attachments
    });

    // حفظ معلومات الرد للتفاعل
    if (sent && sent.messageID && hasMore) {
      global.shelly.Reply.push({
        name: "بينترست",
        ID: sent.messageID,
        author: senderID,
        type: "pinterest",
        query: query
      });
    }

  } catch (error) {
    console.error("[Pinterest] Send error:", error);
    return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊❌ حدث خطأ أثناء الإرسال
❁┊🔄 حاول مرة أخرى
◈ ──────────── ◈`);
  }
};

// معالج التفاعلات
module.exports.Reply = async function({ event, sh, Reply }) {
  if (Reply.type !== "pinterest" || Reply.author !== event.senderID) return;

  const threadID = event.threadID;
  const query = Reply.query;

  if (!cache[threadID] || !cache[threadID][query]) {
    return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊❌ انتهت جلسة البحث
❁┊💡 ابدأ بحث جديد: بينترست ${query}
◈ ──────────── ◈`);
  }

  const loadingMsg = await sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊🔄 جاري تحميل المزيد من الصور...
◈ ──────────── ◈`);

  // اختيار صور لم تستخدم بعد
  const availableUrls = cache[threadID][query].all.filter(
    url => !cache[threadID][query].used.has(url)
  );

  if (availableUrls.length === 0) {
    if (loadingMsg) {
      try { await sh.unsend(loadingMsg.messageID); } catch (e) {}
    }
    return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊✔️ تم استخدام جميع الصور
❁┊💡 جرب كلمة بحث أخرى
◈ ──────────── ◈`);
  }

  const limit = 10;
  const toSend = availableUrls.slice(0, limit);
  const attachments = [];
  const cacheDir = path.join(__dirname, 'cache');

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  try {
    for (let i = 0; i < toSend.length; i++) {
      const url = toSend[i];
      const filename = `pinterest_${Date.now()}_${i}.jpg`;
      const filepath = path.join(cacheDir, filename);

      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 10000
        });

        await fsPromises.writeFile(filepath, response.data);
        attachments.push(fs.createReadStream(filepath));
        cache[threadID][query].used.add(url);

        setTimeout(() => {
          try {
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
          } catch (e) {
            console.error("[Pinterest] Delete error:", e);
          }
        }, 60000);

      } catch (imgError) {
        console.error(`[Pinterest] Failed to download image: ${url}`, imgError.message);
      }
    }

    if (loadingMsg) {
      try { await sh.unsend(loadingMsg.messageID); } catch (e) {}
    }

    if (attachments.length === 0) {
      return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊❌ فشل تحميل الصور
❁┊🔄 حاول مرة أخرى
◈ ──────────── ◈`);
    }

    const remaining = availableUrls.length - toSend.length;
    const hasMore = remaining > 0;

    const sent = await sh.reply({
      body: `◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊✅ تم إرسال ${attachments.length} صورة
❁┊🔍 البحث: ${query}
${hasMore ? `❁┊📊 المتبقي: ${remaining} صورة\n❁┊👍 اضغط لايك للحصول على المزيد!` : `❁┊✔️ تم إرسال جميع الصور`}
◈ ──────────── ◈`,
      attachment: attachments
    });

    if (sent && sent.messageID && hasMore) {
      global.shelly.Reply.push({
        name: "بينترست",
        ID: sent.messageID,
        author: event.senderID,
        type: "pinterest",
        query: query
      });
    }

  } catch (error) {
    console.error("[Pinterest] Send error:", error);
    if (loadingMsg) {
      try { await sh.unsend(loadingMsg.messageID); } catch (e) {}
    }
    return sh.reply(`◈ ──『 ❀ بينترست ❀ 』── ◈
❁┊❌ حدث خطأ أثناء الإرسال
❁┊🔄 حاول مرة أخرى
◈ ──────────── ◈`);
  }
};