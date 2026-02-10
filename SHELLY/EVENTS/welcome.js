const axios = require('axios');
const fs = require('fs');
const path = require('path');

let cmd = {
    config: {
        name: "welcome",
        Type: ["log:subscribe"]
    }, 

    Event: async function ({ api, sh, threadsData, usersData, event }) {
        const { threadID } = event;
        const { PREFIX, BOTNAME } = global.config;
        const added = event.logMessageData.addedParticipants;

        // إذا تمت إضافة البوت نفسه
        if (added.some(item => item.userFbId == config.shellyID)) {
            try {
                if (BOTNAME) api.changeNickname(BOTNAME, threadID, config.shellyID);

                // إرسال رسالة التأكيد أولاً
                await sh.send(`هل ترون بوت دورا؟ أنا لا أراه 👀🤖
إذا رأيتم بوت قولوا: بوت
أحسنتم 🎉`);

                // انتظار ثانيتين
                await new Promise(resolve => setTimeout(resolve, 2000));

                // الحصول على الوقت الحالي
                const now = new Date();
                const timeString = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

                // رسالة التفعيل
                const activationMessage = `◈ ──『 起動 - دورا 』── ◈
❁┊✅ تم تشغيل بوت دورا بنجاح
❁┊👤 البادئة الخاصة بالبوت: ( ${PREFIX} )
❁┊📌 الحالة: نشط | قوة كاملة
❁┊🆔 النظام: أنمي مود
❁┊🕒 الوقت: ${timeString}
◈ ──────────── ◈`;

                // إرسال للمجموعة
                sh.send(activationMessage);

                // إرسال للمالك
                api.sendMessage(`⚝ ${threadID} ⚝`, config.TID);

            } catch (error) {
                console.error("خطأ في إرسال رسالة التفعيل:", error.message);
                api.sendMessage(`⚝ ${threadID} ⚝`, config.TID);
                sh.send(`تم تفعيل شيلي بنجاح ✅\n البادئة الخاصة بي هي [ ${PREFIX} ] ↬`);
            }
        } 
        // إذا تمت إضافة المالك
        else if (added.some(item => item.userFbId == config.OWNERID)) {
            return sh.send(`◈ ──『 مرحباً سيدي 』── ◈
❁┊❤️ أهلاً وسهلاً بعودتك
❁┊👑 المجموعة تشرفت بوجودك
❁┊✨ أنا في خدمتك دائماً
◈ ──────────── ◈`);
        } 
        // الأعضاء العاديين
        else {
            let threadDat = await threadsData.get(event.threadID);
            let threadData = threadDat?.data || {};
            
            if (threadDat?.settings?.sendWelcomeMessage == false) return;

            // معالجة كل عضو تمت إضافته
            for (const participant of added) {
                try {
                    const newMemberID = participant.userFbId;
                    
                    // الحصول على معلومات العضو الجديد
                    let newMemberInfo;
                    try {
                        newMemberInfo = await usersData.get(newMemberID);
                    } catch (e) {
                        newMemberInfo = null;
                    }
                    const newMemberName = newMemberInfo?.name || "العضو الجديد";

                    // الحصول على معلومات من قام بالإضافة
                    const adderID = event.author;
                    let adderInfo;
                    try {
                        adderInfo = await usersData.get(adderID);
                    } catch (e) {
                        adderInfo = null;
                    }
                    const adderName = adderInfo?.name || "أحد الأعضاء";

                    // الحصول على معلومات المجموعة
                    const threadInfo = await threadsData.get(threadID);
                    const groupName = threadInfo?.threadName || "المجموعة";
                    const memberCount = threadInfo?.members?.length || "غير معروف";

                    // الحصول على تاريخ الإضافة
                    const now = new Date();
                    const dateString = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                    // إرسال رسالة التأكيد أولاً
                    await sh.send(`هل ترون العضو الجديد؟ أنا لا أراه 👀
إذا رأيتم عضو قولوا: عضو
أحسنتم 🎉`);

                    // انتظار ثانيتين
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    let msg;
                    
                    // إذا كان هناك رسالة ترحيب مخصصة
                    if (threadData.customJoin) {
                        msg = threadData.customJoin
                            .replace(/{name}/g, newMemberName)
                            .replace(/{اسم_العضو}/g, newMemberName)
                            .replace(/{تاريخ_الإضافة}/g, dateString)
                            .replace(/{اسم_الجروب}/g, groupName)
                            .replace(/{اسم_الشخص}/g, adderName)
                            .replace(/{عدد_الأعضاء}/g, memberCount);
                    } else {
                        // رسالة الترحيب الافتراضية
                        msg = `◈ ──『 ترحيب - دورا 』── ◈
❁┊🎉 مرحبًا بك في المجموعة
❁┊👤 اسم العضو: ${newMemberName}
❁┊📅 تاريخ الإضافة: ${dateString}
❁┊📌 اسم الجروب: ${groupName}
❁┊➕ أضافه بواسطة: ${adderName}
❁┊👥 عدد الأعضاء: ${memberCount}
◈ ──────────── ◈`;
                    }

                    // تحميل صورة بروفايل العضو الجديد
                    try {
                        const profilePicUrl = `https://graph.facebook.com/${newMemberID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                        
                        
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
                                tag: newMemberName,
                                id: newMemberID
                            }]
                        });
                    }

                    // انتظار ثانية واحدة بين كل رسالة ترحيب
                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (error) {
                    console.error("خطأ في معالجة عضو جديد:", error.message);
                }
            }
        }
    }
}

module.exports = cmd;