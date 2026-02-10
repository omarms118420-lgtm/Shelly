const axios = require("axios");

function toBold(text) {
    const normal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bold = '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗠𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵';
    return text.split('').map(c => {
        const i = normal.indexOf(c);
        return i > -1 ? bold[i] : c;
    }).join('');
}

class VideoCommand {
    constructor() {
        Object.assign(this, {
            config: {
                name: "فيديو",
                aliases: ["vid", "video"],
                version: "1.0",
                Auth: 2, // مطور فقط
                Owner: "عبدالرحمن",
                Info: "أمر خاص للبحث عن فيديوهات (للمطور فقط)",
                Class: "خاص"
            }
        });
    }

    async onPick({ api, event, args, sh: reply }) {
        const query = args.join(" ");
        if (!query) {
            return reply("❌ يرجى إدخال كلمة بحث.\nمثال: فيديو teen");
        }

        const url = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(query)}&per_page=15&format=json`;

        try {
            const { data } = await axios.get(url);

            if (!data.videos || data.videos.length === 0) {
                return reply(`❌ لا توجد نتائج لـ: ${toBold(query)}`);
            }

            const videos = data.videos.slice(0, 8);
            let msg = `🔍 نتائج البحث عن: ${toBold(query)}\n\n`;

            for (let i = 0; i < videos.length; i++) {
                const v = videos[i];
                msg += `${i + 1}. ${v.title}\n`;
                msg += `   ⏱ ${v.length_min} دقيقة | ⭐ ${v.rating || 'غير معروف'}\n\n`;
            }

            msg += `📌 ارسل الرقم (1-${videos.length}) للحصول على الرابط.`;

            // إرسال الرسالة مع صور مصغرة (بدون attachment إذا ما دعمش)
            reply(msg);

            // حفظ للرد
            global.videoReplies = global.videoReplies || {};
            global.videoReplies[event.messageID] = {
                user: event.senderID,
                videos: videos
            };

        } catch (err) {
            console.error("خطأ في أمر فيديو:", err.message);
            reply("❌ حدث خطأ، حاول لاحقًا.");
        }
    }

    async handleReply({ api, event, sh: reply }) {
        const saved = global.videoReplies?.[event.messageReply?.messageID];
        if (!saved || event.senderID !== saved.user) return;

        const num = parseInt(event.body);
        if (isNaN(num) || num < 1 || num > saved.videos.length) {
            return reply("❌ رقم غير صحيح.");
        }

        const video = saved.videos[num - 1];

        try {
            const page = await axios.get(`https://www.eporner.com/embed/${video.id}`);
            const match = page.data.match(/src="(https:\/\/[^\s"]+\.mp4[^"]*)"/i);
            const direct = match ? match[1] : `https://www.eporner.com/video-\( {video.id}/ \){video.slug}/`;

            reply(`🎥 ${video.title}\n⏱ \( {video.length_min} دقيقة\n\n🔗 الرابط:\n \){direct}`);

            // حذف بعد الاستخدام
            delete global.videoReplies[event.messageReply.messageID];
        } catch (err) {
            reply(`🎥 \( {video.title}\n\nرابط الصفحة:\nhttps://www.eporner.com/video- \){video.id}/${video.slug}/`);
        }
    }
}

module.exports = new VideoCommand();