const axios = require('axios');
const fs = require('fs');
const path = require('path');

let cmd = {
    config: {
        name: "goodbye",
        Type: ["log:unsubscribe"]
    }, 

    Event: async function ({ api, sh, threadsData, usersData, event }) {
        const { threadID } = event;
        const leftParticipant = event.logMessageData.leftParticipantFbId;

        // إذا كان العضو الذي غادر هو البوت نفسه
        if (leftParticipant == config.shellyID) {
            try {
                // الحصول على معلومات المجموعة
                const threadInfo = await threadsData.get(threadID);
                const threadName = threadInfo?.threadName || "غير معروف";
                
                // الحصول على معلومات من قام بالطرد
                const kickerID = event.author;
                let kickerInfo;
                try {
                    kickerInfo = await usersData.get(kickerID);
                } catch (e) {
                    kickerInfo = null;
                }
                const kickerName = kickerInfo?.name || "غير معروف";
                
                // الحصول على الوقت الحالي
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = now.getFullYear();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const timeString = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                
                // إرسال رسالة للمالك
                const logMessage = `◆ ──『 سجلات - دورا 』── ◆
✦│ ❌ تم طرد البوت من مجموعة
✦│ 👤 من قام بالطرد: ${kickerName}
✦│ 📌 اسم المجموعة: ${threadName}
✦│ 🆔 معرف المجموعة: ${threadID}
✦│ 🕒 الوقت: ${timeString}
◆ ───────────── ◆`;

                api.sendMessage(logMessage, config.TID);
            } catch (error) {
                console.error("خطأ في إرسال إشعار طرد البوت:", error.message);
                api.sendMessage(`⚝ تمت إزالة شيلي من المجموعة ⚝\n📍 ID: ${threadID}`, config.TID);
            }
            return;
        }
        
        // الحصول على معلومات العضو الذي غادر
        let userInfo;
        try {
            userInfo = await usersData.get(leftParticipant);
        } catch (e) {
            userInfo = null;
        }
        const userName = userInfo?.name || "العضو";

        // إذا كان العضو الذي غادر هو المالك
        if (leftParticipant == config.OWNERID) {
            return sh.send(`◈ ──『 وداعاً سيدي 』── ◈
❁┊😢💔 وداعاً سيدي ${userName}
❁┊🌟 المجموعة لن تكون نفسها بدونك
❁┊💙 نسأل الله أن يحفظك ويرعاك
◈ ──────────── ◈`);
        }

        // للأعضاء العاديين
        let threadDat = await threadsData.get(threadID);
        let threadData = threadDat?.data || {};

        // التحقق من إعدادات إرسال رسالة الوداع
        if (threadDat?.settings?.sendGoodbyeMessage == false) return;

        try {
            // الحصول على معلومات المجموعة
            const threadInfo = await threadsData.get(threadID);
            const groupName = threadInfo?.threadName || "المجموعة";
            const memberCount = threadInfo?.members?.length || "غير معروف";

            // الحصول على تاريخ المغادرة
            const now = new Date();
            const dateString = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // التحقق من نوع المغادرة (طرد أم مغادرة طوعية)
            const isKicked = event.author && event.author !== leftParticipant;

            let kickerName = "";
            if (isKicked) {
                // حالة الطرد - الحصول على معلومات من قام بالطرد
                try {
                    const kickerInfo = await usersData.get(event.author);
                    kickerName = kickerInfo?.name || "أحد الأعضاء";
                } catch (e) {
                    kickerName = "أحد الأعضاء";
                }
            }

            if (isKicked) {
                // حالة الطرد
                await sh.send(`هل ترون الإزالة؟ أنا لا أراها 👀🦵
إذا رأيتم إزالة قولوا: إزالة
أحسنتم 🎉`);
            } else {
                // حالة المغادرة الطوعية
                await sh.send(`هل ترون المغادرة؟ أنا لا أراها 👀🚪
إذا رأيتم مغادرة قولوا: مغادرة
أحسنتم 🎉`);
            }

            // انتظار ثانيتين
            await new Promise(resolve => setTimeout(resolve, 2000));

            let msg;
            
            // إذا كان هناك رسالة وداع مخصصة
            if (threadData.customLeave) {
                msg = threadData.customLeave
                    .replace(/{name}/g, userName)
                    .replace(/{اسم_العضو}/g, userName)
                    .replace(/{تاريخ_المغادرة}/g, dateString)
                    .replace(/{تاريخ_الإزالة}/g, dateString)
                    .replace(/{اسم_الجروب}/g, groupName)
                    .replace(/{اسم_الشخص}/g, kickerName)
                    .replace(/{عدد_الأعضاء}/g, memberCount);
            } else {
                // رسالة حسب نوع المغادرة
                if (isKicked) {
                    // رسالة الطرد
                    msg = `◈ ──『 ❀ إزالة - دورا ❀ 』── ◈
❁┊✨ آه لا! تم إزالة عضو من المجموعة
❁┊👤 اسم العضو: ${userName}
❁┊📅 تاريخ الإزالة: ${dateString}
❁┊🏠 اسم الجروب: ${groupName}
❁┊💫 أزال بواسطة: ${kickerName}
❁┊👥 عدد الأعضاء الآن: ${memberCount}
❁┊🌸💌 نتمنى لك التوفيق دائمًا!
◈ ──────────── ◈`;
                } else {
                    // رسالة المغادرة الطوعية
                    msg = `◈ ──『 مغادرة - دورا 』── ◈
❁┊💔 غادر أحد الأعضاء المجموعة
❁┊👤 اسم العضو: ${userName}
❁┊📅 تاريخ المغادرة: ${dateString}
❁┊📌 اسم الجروب: ${groupName}
❁┊➖ تمت المغادرة
❁┊👥 عدد الأعضاء الآن: ${memberCount}
◈ ──────────── ◈`;
                }
            }

            // تحميل صورة بروفايل العضو المغادر
            try {
                const profilePicUrl = `https://graph.facebook.com/${leftParticipant}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                
                
                // تحميل الصورة
                const response = await axios.get(profilePicUrl, { 
                    responseType: 'stream',
                    timeout: 10000 
                });
              

                // إرسال الرسالة مع صورة البروفايل
                await sh.send({
                    body: msg,
                    attachment: response.data
                });


            } catch (error) {
                console.error("خطأ في تحميل صورة البروفايل:", error.message);
                
                // إرسال الرسالة بدون صورة في حالة الخطأ
                sh.send({
                    body: msg,
                    mentions: [{
                        tag: userName,
                        id: leftParticipant
                    }]
                });
            }

        } catch (error) {
            console.error("خطأ في إرسال رسالة الوداع:", error.message);
        }
    }
}

module.exports = cmd;