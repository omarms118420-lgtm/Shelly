function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Marriage {
    constructor() {
        Object.assign(this, {
            config: {
                name: "زوجيني",
                Auth: 0,
                Owner: "عبدالرحمن",
                Info: "زواج عشوائي بتكلفة متغيرة", 
                Class: "العاب",
                Time: 5,
            }
        });
    }

    async onPick({ api, event, usersData, sh: black }) {
        const { threadID, messageID, senderID, isGroup, participantIDs } = event;

        try {
            // التحقق من أن الأمر في مجموعة
            if (!isGroup) {
                api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                return black.reply(`⚠️ ◆ ══《 مجموعات فقط 》══ ◆ ⚠️

✧┃Dora Bot
✧┃هذا الأمر للمجموعات فقط!
✧┃انضم لمجموعة وجرب مرة أخرى
⚠️ ◆ ═════════════ ◆ ⚠️`);
            }

            // الحصول على بيانات المستخدم
            const userData = await usersData.get(senderID);
            const money = userData.money || 0;
            const gender = userData.gender;
            const senderName = userData.name;

            // تكلفة عشوائية للزواج (من 5,000 إلى 25,000 جنيه سوداني)
            const marriageCost = Math.floor(Math.random() * 20001) + 5000;
            
            // نسبة الحب العشوائية
            let lovePercentage = Math.floor(Math.random() * 101);

            // التحقق من الرصيد
            if (money < marriageCost) {
                api.setMessageReaction("💸", messageID, (err) => {}, true);
                return black.reply(`💸 ◆ ══《 رصيد غير كافٍ 》══ ◆ 💸

✧┃Dora Bot
✧┃عذراً، رصيدك غير كافٍ للزواج!
✧┃
✧┃التكلفة المطلوبة: ${marriageCost.toLocaleString()} ج.س
✧┃رصيدك الحالي: ${money.toLocaleString()} ج.س
✧┃ينقصك: ${(marriageCost - money).toLocaleString()} ج.س
✧┃
✧┃اكتب "منجم" للحصول على المال
💸 ◆ ═════════════ ◆ 💸`);
            }

            // التحقق من الجنس
            if (gender !== 1 && gender !== 2) {
                api.setMessageReaction("🏳️‍🌈", messageID, (err) => {}, true);
                return black.reply(`🏳️‍🌈 ◆ ══《 عذراً 》══ ◆ 🏳️‍🌈

✧┃Dora Bot
✧┃أسفة بس ما أزوج المثليين 🥺
✧┃يرجى تحديث جنسك في البروفايل
🏳️‍🌈 ◆ ═════════════ ◆ 🏳️‍🌈`);
            }

            // البحث عن شريك مناسب
            api.setMessageReaction("💘", messageID, (err) => {}, true);
            
            black.reply(`💘 ◆ ══《 جاري البحث 》══ ◆ 💘

✧┃Dora Bot
✧┃جاري البحث عن شريك/ة مناسبة...
✧┃التكلفة: ${marriageCost.toLocaleString()} ج.س
✧┃انتظر قليلاً... 💕
💘 ◆ ═════════════ ◆ 💘`, async () => {
                try {
                    await delay(2000);

                    const targetGender = gender === 2 ? 1 : 2; // إذا ذكر يبحث عن أنثى والعكس
                    let partnerId;
                    let partnerData;
                    let partnerGender;

                    // البحث عن شريك
                    let attempts = 0;
                    do {
                        partnerId = participantIDs[Math.floor(Math.random() * participantIDs.length)];
                        
                        // تجنب اختيار نفس الشخص
                        if (partnerId === senderID) continue;
                        
                        partnerData = await usersData.get(partnerId);
                        partnerGender = partnerData.gender;
                        attempts++;
                        
                        // إذا لم يجد بعد 50 محاولة، يتوقف
                        if (attempts > 50) {
                            api.setMessageReaction("❌", messageID, (err) => {}, true);
                            return black.reply(`❌ ◆ ══《 لم يتم العثور 》══ ◆ ❌

✧┃Dora Bot
✧┃عذراً، لم أجد شريك/ة مناسبة
✧┃في المجموعة حالياً
✧┃حاول مرة أخرى لاحقاً
❌ ◆ ═════════════ ◆ ❌`);
                        }
                    } while (partnerGender !== targetGender);

                    const partnerName = partnerData.name;

                    // خصم التكلفة
                    await usersData.set(senderID, {
                        money: money - marriageCost
                    });

                    // الحصول على الصور
                    let senderAvatar, partnerAvatar;
                    try {
                        senderAvatar = await usersData.getAvatarUrl(senderID);
                        partnerAvatar = await usersData.getAvatarUrl(partnerId);
                    } catch (err) {
                        senderAvatar = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;
                        partnerAvatar = `https://graph.facebook.com/${partnerId}/picture?width=512&height=512`;
                    }

                    // تحميل الصور
                    let images = [];
                    try {
                        if (global.funcs && global.funcs.imgd) {
                            images.push(await global.funcs.imgd(senderAvatar));
                            images.push(await global.funcs.imgd(partnerAvatar));
                        }
                    } catch (err) {
                        console.log("Failed to load images:", err);
                    }

                    // إعداد المنشن
                    const mentions = [
                        { id: senderID, tag: senderName },
                        { id: partnerId, tag: partnerName }
                    ];

                    // رسالة خاصة للمطور
                    const developerID = global.config?.AD?.[0] || global.config?.OWNERID;
                    let message;

                    if (partnerId === developerID) {
                        lovePercentage = 100;
                        message = `💍 ◆ ══《 تم الزواج 》══ ◆ 💍

✧┃Dora Bot
✧┃مبروك! تم عقد القران 💒
✧┃
✧┃${senderName} 💓 ${partnerName}
✧┃
✧┃💕 نسبة الحب: ${lovePercentage}% 💕
✧┃💰 التكلفة: ${marriageCost.toLocaleString()} ج.س
✧┃
✧┃أنا غيووووره 😞🩷
✧┃بس مبروك للعروسين! 🎉
💍 ◆ ═════════════ ◆ 💍`;
                    } else {
                        // رسائل مختلفة حسب نسبة الحب
                        let loveMessage = "";
                        if (lovePercentage >= 90) {
                            loveMessage = "✧┃توافق مثالي! 💯 حب حقيقي!";
                        } else if (lovePercentage >= 70) {
                            loveMessage = "✧┃علاقة رائعة! 🌟 استمروا معاً!";
                        } else if (lovePercentage >= 50) {
                            loveMessage = "✧┃علاقة جيدة 💕 بالتوفيق!";
                        } else if (lovePercentage >= 30) {
                            loveMessage = "✧┃علاقة متوسطة 😅 اعملوا على تحسينها!";
                        } else {
                            loveMessage = "✧┃علاقة صعبة 😬 بالتوفيق!";
                        }

                        message = `💍 ◆ ══《 تم الزواج 》══ ◆ 💍

✧┃Dora Bot
✧┃مبروك! تم عقد القران 💒
✧┃
✧┃${senderName} 💓 ${partnerName}
✧┃
✧┃💕 نسبة الحب: ${lovePercentage}% 💕
✧┃💰 التكلفة: ${marriageCost.toLocaleString()} ج.س
✧┃💵 الرصيد المتبقي: ${(money - marriageCost).toLocaleString()} ج.س
✧┃
${loveMessage}
✧┃ألف مبروك للعروسين! 🎉
💍 ◆ ═════════════ ◆ 💍`;
                    }

                    // إرسال الرسالة
                    const messageData = {
                        body: message,
                        mentions: mentions
                    };

                    if (images.length > 0) {
                        messageData.attachment = images;
                    }

                    api.setMessageReaction("💑", messageID, (err) => {}, true);
                    return api.sendMessage(messageData, threadID, messageID);

                } catch (error) {
                    console.error("Marriage Error:", error);
                    api.setMessageReaction("❌", messageID, (err) => {}, true);
                    return black.reply(`❌ حدث خطأ أثناء إتمام الزواج: ${error.message}`);
                }
            });

        } catch (error) {
            console.error("Marriage Main Error:", error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return black.reply(`❌ حدث خطأ: ${error.message}`);
        }
    }
}

module.exports = new Marriage();