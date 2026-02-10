class AdminOnly {
    constructor() {
        Object.assign(this, {
            config: {
                name: "ادمنفقط",
                Auth: 1, // يحتاج صلاحية أدمن المجموعة على الأقل (1)
                Owner: "عبدالرحمن",
                Info: "تفعيل وضع الأدمن فقط - البوت يشتغل لأدمن المجموعة فقط (وللمطورين دائمًا)",
                Class: "الادارة",
            }
        });
    }

    async onPick({ api, event, args, sh: black, usersData, threadsData, globalData, Auth }) {
        const { messageID, senderID, threadID, isGroup } = event;

        try {
            // التأكد من أن الأمر داخل مجموعة
            if (!isGroup) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return black.reply(`◈ ──『 ❌ خطأ ❌ 』── ◈
⚠️ هذا الأمر يعمل داخل المجموعات فقط!
◈ ──────────────── ◈`);
            }

            const action = args[0]?.toLowerCase();

            // عرض المساعدة
            if (!action || (action !== 'تشغيل' && action !== 'إيقاف' && action !== 'حالة')) {
                api.setMessageReaction("🔐", messageID, () => {}, true);
                return black.reply(`◈ ──『 🔐 وضع الأدمن فقط 🔐 』── ◈

🛡️ التحكم في من يستخدم البوت داخل المجموعة

📋 الأوامر المتاحة:
🔴 ادمنفقط تشغيل → تفعيل الوضع
🟢 ادمنفقط إيقاف → إيقاف الوضع
📊 ادمنفقط حالة → عرض الحالة الحالية

⚠️ عند التفعيل:
  • فقط أدمن المجموعة + المطورين يقدرون يستخدمون البوت
  • الأعضاء العاديين محظورين من الأوامر مؤقتًا

🔑 هذا الأمر لأدمن المجموعة والمطورين فقط
◈ ──────────────── ◈`);
            }

            // جلب بيانات المجموعة
            const threadData = await threadsData.get(threadID);
            let adminOnlyMode = threadData.settings?.adminOnly || false;

            // عرض الحالة
            if (action === 'حالة') {
                api.setMessageReaction("📊", messageID, () => {}, true);

                const statusEmoji = adminOnlyMode ? '🔴 مُفعّل' : '🟢 مُعطّل';
                const allowed = adminOnlyMode 
                    ? `👮 أدمن المجموعة فقط (\( {threadData.adminIDs?.length || 0})\n👑 + المطورين دائمًا ( \){global.config.AD?.length || 0})`
                    : '✅ الجميع (أعضاء + أدمن + مطورين)';

                return black.reply(`◈ ──『 📊 حالة وضع الأدمن فقط 📊 』── ◈

🔐 الحالة: ${statusEmoji}

👥 المسموح لهم باستخدام البوت:
${allowed}

📋 تفاصيل المجموعة:
  🆔 ID: ${threadID}
  📛 الاسم: ${threadData.threadName || 'غير معروف'}
  👥 عدد الأعضاء: ${threadData.members?.length || 'غير معروف'}
  👮 عدد الأدمنز: ${threadData.adminIDs?.length || 0}

⚙️ للتغيير:
  🔴 ادمنفقط تشغيل
  🟢 ادمنفقط إيقاف
◈ ──────────────── ◈`);
            }

            // تشغيل الوضع
            if (action === 'تشغيل') {
                if (adminOnlyMode) {
                    api.setMessageReaction("⚠️", messageID, () => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

🔴 وضع "الأدمن فقط" مُفعّل بالفعل!

للإيقاف: ادمنفقط إيقاف
◈ ──────────────── ◈`);
                }

                await threadsData.set(threadID, true, "settings.adminOnly");

                api.setMessageReaction("🔴", messageID, () => {}, true);

                return black.reply(`◈ ──『 🔴 تم تفعيل وضع الأدمن فقط 🔴 』── ◈

🛡️ الآن البوت يعمل فقط لـ:
  👮 أدمن المجموعة (${threadData.adminIDs?.length || 0} أدمن)
  👑 المطورين الرئيسيين (${global.config.AD?.length || 0})

❌ الأعضاء العاديين لا يمكنهم استخدام الأوامر حاليًا

🔒 مثالي للتنظيف، الإعدادات، أو منع السبام

💡 لإعادة السماح للجميع: ادمنفقط إيقاف
◈ ──────────────── ◈`);
            }

            // إيقاف الوضع
            if (action === 'إيقاف' || action === 'ايقاف') {
                if (!adminOnlyMode) {
                    api.setMessageReaction("⚠️", messageID, () => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

🟢 وضع "الأدمن فقط" غير مُفعّل أصلاً!

البوت متاح للجميع حاليًا ✅
◈ ──────────────── ◈`);
                }

                await threadsData.set(threadID, false, "settings.adminOnly");

                api.setMessageReaction("🟢", messageID, () => {}, true);

                return black.reply(`◈ ──『 🟢 تم إيقاف وضع الأدمن فقط 🟢 』── ◈

✅ الآن الجميع يمكنهم استخدام البوت بحرية:
  👥 الأعضاء العاديين
  👮 الأدمن
  👑 المطورين

🎉 المجموعة عادت للوضع الطبيعي!

💡 للتفعيل مرة أخرى: ادمنفقط تشغيل
◈ ──────────────── ◈`);
            }

        } catch (error) {
            console.error("AdminOnly Mode Error:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return black.reply(`◈ ──『 ❌ خطأ في النظام ❌ 』── ◈

⚠️ حدث خطأ غير متوقع:
${error.message}

📛 تواصل مع المطور إذا استمر الخطأ
◈ ──────────────── ◈`);
        }
    }
}

module.exports = new AdminOnly();