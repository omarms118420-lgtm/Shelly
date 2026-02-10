const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

class Command {
  constructor() {
    this.config = {
      name: "pixiv",
      aliases: ["px", "بيكسيف"],
      Auth: 0,
      description: "بحث وجلب صور من Pixiv بجودة عالية (بدون تسجيل دخول) مع pagination",
      usage: "pixiv <كلمة بحث أو #هاشتاج>"
    };
  }

  // تخزين بيانات البحث مؤقتًا (للـ reaction)
  searchData = new Map();
  processing = new Set();

  async searchPixiv(query, page = 1) {
    const isTag = query.startsWith("#");
    const word = isTag ? query.slice(1) : query;

    try {
      const res = await axios.get("https://www.pixiv.net/touch/ajax/search/illusts", {
        params: {
          word,
          s_mode: isTag ? "s_tag" : "s_tag_full",
          p: page,
          lang: "en"
        },
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          "Referer": "https://www.pixiv.net/",
          "Accept": "application/json"
        },
        timeout: 20000
      });

      const data = res.data.body;
      const illusts = data.illusts || [];
      const total = parseInt(data.total) || 0;
      const lastPage = data.lastPage || page;

      return { illusts, total, lastPage, hasNext: page < lastPage };
    } catch (err) {
      throw new Error("فشل الاتصال بـ Pixiv");
    }
  }

  async sendBatch(sh, event, illusts, query, key) {
    const data = this.searchData.get(key);
    if (!data) return;

    const streams = [];
    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    let sentCount = 0;

    for (const art of illusts) {
      if (data.used.has(art.id) || sentCount >= 10) continue;

      // جلب أعلى جودة ممكنة بدون login
      let imgUrl = art.url
        .replace("https://i.pximg.net", "https://i.pixiv.re")
        .replace("/c/600x1200_90_webp/img-master/", "/img-original/")
        .replace("_master1200.jpg", "_p0.jpg");

      // إذا كانت PNG، غير الامتداد
      if (art.ext === "png") {
        imgUrl = imgUrl.replace(".jpg", ".png");
      }

      const ext = imgUrl.endsWith(".png") ? "png" : "jpg";
      const filePath = path.join(cacheDir, `pixiv_\( {art.id}_ \){Date.now()}.${ext}`);

      try {
        const res = await axios.get(imgUrl, {
          responseType: "arraybuffer",
          headers: { "Referer": "https://app-api.pixiv.net/" },
          timeout: 30000
        });

        fs.writeFileSync(filePath, res.data);
        streams.push(fs.createReadStream(filePath));

        // حذف بعد 90 ثانية
        setTimeout(() => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, 90000);

        sentCount++;
      } catch (e) {
        // fallback لجودة أقل
        try {
          const fallbackUrl = art.url.replace("600x1200", "1200x1200");
          const fallbackRes = await axios.get(fallbackUrl, {
            responseType: "arraybuffer",
            headers: { "Referer": "https://www.pixiv.net/" },
            timeout: 30000
          });
          fs.writeFileSync(filePath, fallbackRes.data);
          streams.push(fs.createReadStream(filePath));
          setTimeout(() => fs.existsSync(filePath) && fs.unlinkSync(filePath), 90000);
          sentCount++;
        } catch (_) {
          // تجاهل الصورة الفاشلة
        }
      }

      data.used.add(art.id);
      await new Promise(r => setTimeout(r, 500)); // تأخير بسيط
    }

    const remaining = data.total - data.used.size;
    let msg = "";

    if (streams.length > 0) {
      msg = `◈ ──『 ❀ بيكسيف ❀ 』── ◈\n` +
            `✅ تم جلب ${streams.length} صورة\n` +
            `🔍 البحث: ${query}\n` +
            `📊 المتبقي تقريبًا: ~${remaining > 0 ? remaining : 0}\n` +
            `👆 رد برياكت (أي إيموجي) للمزيد!\n` +
            `◈ ──────────── ◈`;
    } else {
      msg = `◈ ──『 ❀ بيكسيف ❀ 』── ◈\n` +
            `⚠️ ما قدرتش أجيب صور عالية الجودة لهذا البحث\n` +
            `🔄 جرب كلمة تانية أو انتظر شوية\n` +
            `◈ ──────────── ◈`;
    }

    const sentMsg = await sh.reply({
      body: msg,
      attachment: streams
    });

    // حفظ للـ reaction
    if (sentMsg && data.page < data.lastPage && remaining > 0) {
      global.shelly.Reply.push({
        name: this.config.name,
        messageID: sentMsg.messageID,
        author: event.senderID,
        searchKey: key,
        type: "reaction"
      });
    }
  }

  async handleReply({ event, sh, Reply }) {
    if (Reply.type !== "reaction" || Reply.name !== this.config.name || event.senderID !== Reply.author) return;

    const saved = this.searchData.get(Reply.searchKey);
    if (!saved) return;

    if (this.processing.has(event.threadID)) return;
    this.processing.add(event.threadID);

    try {
      saved.page++;
      const result = await this.searchPixiv(saved.query, saved.page);

      if (result.illusts.length === 0 || !result.hasNext) {
        sh.reply(`◈ ──『 ❀ بيكسيف ❀ 』── ◈\n` +
                 `✅ خلصت كل الصور المتاحة لـ: ${saved.query}\n` +
                 `🎨 جرب بحث جديد!\n` +
                 `◈ ──────────── ◈`);
        return;
      }

      await this.sendBatch(sh, event, result.illusts, saved.query, Reply.searchKey);
    } catch (err) {
      sh.reply("❌ حصل خطأ أثناء جلب الصفحة التالية، جرب تاني.");
    } finally {
      this.processing.delete(event.threadID);
    }
  }

  async onPick({ event, sh, args }) {
    const threadID = event.threadID;

    if (this.processing.has(threadID)) {
      return sh.reply("⏳ جاري معالجة طلب سابق، انتظر قليلاً...");
    }

    if (args.length === 0) {
      return sh.reply(`◈ ──『 ❀ بيكسيف ❀ 』── ◈\n` +
                      `⚠️ اكتب كلمة البحث!\n` +
                      `💡 مثال: pixiv raiden shogun\n` +
                      `◈ ──────────── ◈`);
    }

    const query = args.join(" ");
    this.processing.add(threadID);

    try {
      sh.reply(`◈ ──『 ❀ بيكسيف ❀ 』── ◈\n` +
               `🔍 جاري البحث عن: ${query}\n` +
               `⏳ انتظر قليلاً...\n` +
               `◈ ──────────── ◈`);

      const result = await this.searchPixiv(query, 1);

      if (result.illusts.length === 0) {
        this.processing.delete(threadID);
        return sh.reply(`◈ ──『 ❀ بيكسيف ❀ 』── ◈\n` +
                        `❌ ما لقيتش نتائج لـ: ${query}\n` +
                        `💡 جرب كلمة تانية\n` +
                        `◈ ──────────── ◈`);
      }

      const key = `\( {threadID}_ \){Date.now()}`;
      this.searchData.set(key, {
        query,
        page: 1,
        total: result.total,
        lastPage: result.lastPage,
        used: new Set()
      });

      await this.sendBatch(sh, event, result.illusts, query, key);

    } catch (err) {
      console.error("[Pixiv Error]", err);
      sh.reply("❌ حصل خطأ في الاتصال بـ Pixiv، جرب تاني بعد شوية.");
    } finally {
      this.processing.delete(threadID);
    }
  }
}

module.exports = new Command();