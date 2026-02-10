class FreezeBalance {
    constructor() {
        Object.assign(this, {
            config: {
                name: "تجميد",
                Auth: 1, // يحتاج صلاحية أدمن المجموعة على الأقل
                Owner: "عبدالرحمن",
                Info: "تجميد رصيد عضو محدد أو الكل - منع استخدام الأموال",
                Class: "الادارة",
            }
        });
    }

    async onPick({ api, event, args, sh: black, usersData, threadsData, Auth }) {
        const { messageID, senderID, threadID, mentions } = event;

        try {
            const action = args[0]?.toLowerCase();

            // عرض المساعدة
            if (!action) {
                api.setMessageReaction("🧊", messageID, (err) => {}, true);
                return black.reply(`◈ ──『 🧊 تجميد الرصيد 🧊 』── ◈

🔒 منع الأعضاء من استخدام أموالهم

📋 الأوامر المتاحة:

❄️ تجميد @منشن - تجميد رصيد عضو
❄️ تجميد [ID] - تجميد رصيد بالـID
🔥 تجميد فك @منشن - فك تجميد عضو
🧊 تجميد الكل - تجميد الجميع
🔥 تجميد فك_الكل - فك تجميد الجميع
📊 تجميد قائمة - عرض المجمدين

⚠️ عند التجميد:
  • لا يمكن استخدام الأموال
  • لا يمكن التحويل
  • لا يمكن الشراء
  • الأوامر المالية محظورة

💡 هذا الأمر للأدمنز والمطورين فقط
◈ ──────────────── ◈`);
            }

            const threadData = await threadsData.get(threadID);
            
            // التحقق من وجود قائمة المجمدين
            if (!threadData.data) threadData.data = {};
            if (!threadData.data.frozenUsers) threadData.data.frozenUsers = {};

            // تجميد عضو بالمنشن أو ID
            if (action !== 'فك' && action !== 'الكل' && action !== 'فك_الكل' && action !== 'قائمة') {
                let targetID;
                let targetName;

                // التحقق من المنشن
                if (Object.keys(mentions).length > 0) {
                    targetID = Object.keys(mentions)[0];
                    targetName = mentions[targetID];
                } else if (args[0]) {
                    // التحقق من ID
                    targetID = args[0];
                    targetName = await usersData.getName(targetID).catch(() => null);
                    
                    if (!targetName) {
                        api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                        return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ المستخدم غير موجود!

استخدم:
  تجميد @منشن
  تجميد [ID صحيح]
◈ ──────────────── ◈`);
                    }
                }

                if (!targetID) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ يجب تحديد العضو!

استخدم:
  تجميد @منشن
  تجميد [ID]
◈ ──────────────── ◈`);
                }

                // منع تجميد المطورين
                if (global.config.AD.includes(targetID) || global.config.MAD.includes(targetID)) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ لا يمكن تجميد المطورين!

👑 هذا الشخص مطور ولديه صلاحيات كاملة
◈ ──────────────── ◈`);
                }

                // التحقق من التجميد السابق
                if (threadData.data.frozenUsers[targetID]) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❄️ هذا العضو مجمّد بالفعل!

👤 ${targetName}
🆔 ${targetID}

للفك: تجميد فك @منشن
◈ ──────────────── ◈`);
                }

                // الحصول على رصيد العضو
                const userData = await usersData.get(targetID);
                const userMoney = userData.money || 0;

                // تجميد العضو
                threadData.data.frozenUsers[targetID] = {
                    name: targetName,
                    frozenBy: senderID,
                    frozenByName: await usersData.getName(senderID),
                    frozenAt: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' }),
                    balance: userMoney,
                    timestamp: Date.now()
                };

                await threadsData.set(threadID, threadData.data.frozenUsers, "data.frozenUsers");

                api.setMessageReaction("❄️", messageID, (err) => {}, true);

                return black.reply(`◈ ──『 ❄️ تم التجميد ❄️ 』── ◈

🧊 تم تجميد رصيد العضو بنجاح!

👤 الاسم: ${targetName}
🆔 الـID: ${targetID}
💰 الرصيد المجمد: ${userMoney.toLocaleString()} ج.س

📋 تفاصيل التجميد:
  👮 بواسطة: ${await usersData.getName(senderID)}
  📅 التاريخ: ${threadData.data.frozenUsers[targetID].frozenAt}

⚠️ العضو الآن لا يمكنه:
  ❌ استخدام الأموال
  ❌ التحويل
  ❌ الشراء
  ❌ أي أوامر مالية

💡 للفك: تجميد فك @منشن
◈ ──────────────── ◈`);
            }

            // فك تجميد عضو
            if (action === 'فك') {
                let targetID;
                let targetName;

                if (Object.keys(mentions).length > 0) {
                    targetID = Object.keys(mentions)[0];
                    targetName = mentions[targetID];
                } else if (args[1]) {
                    targetID = args[1];
                    targetName = await usersData.getName(targetID).catch(() => null);
                }

                if (!targetID) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ يجب تحديد العضو!

استخدم:
  تجميد فك @منشن
  تجميد فك [ID]
◈ ──────────────── ◈`);
                }

                if (!threadData.data.frozenUsers[targetID]) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ هذا العضو غير مجمّد!

👤 ${targetName}
🆔 ${targetID}
◈ ──────────────── ◈`);
                }

                const freezeData = threadData.data.frozenUsers[targetID];
                const frozenDuration = Math.floor((Date.now() - freezeData.timestamp) / (1000 * 60 * 60)); // بالساعات

                // فك التجميد
                delete threadData.data.frozenUsers[targetID];
                await threadsData.set(threadID, threadData.data.frozenUsers, "data.frozenUsers");

                api.setMessageReaction("🔥", messageID, (err) => {}, true);

                return black.reply(`◈ ──『 🔥 تم فك التجميد 🔥 』── ◈

✅ تم فك تجميد العضو بنجاح!

👤 الاسم: ${freezeData.name}
🆔 الـID: ${targetID}
💰 الرصيد: ${freezeData.balance.toLocaleString()} ج.س

📊 تفاصيل:
  ⏰ مدة التجميد: ${frozenDuration} ساعة
  👮 تم التجميد بواسطة: ${freezeData.frozenByName}
  📅 تاريخ التجميد: ${freezeData.frozenAt}

🎉 العضو الآن يمكنه استخدام أمواله!
◈ ──────────────── ◈`);
            }

            // تجميد الكل
            if (action === 'الكل') {
                // التحقق من صلاحية المطور فقط
                if (Auth < 2) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ هذا الأمر للمطورين فقط!

👑 يحتاج صلاحيات عالية لتجميد الجميع
◈ ──────────────── ◈`);
                }

                api.setMessageReaction("⏳", messageID, (err) => {}, true);

                const members = threadData.members || [];
                let frozenCount = 0;
                const currentTime = new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });
                const adminName = await usersData.getName(senderID);

                for (const member of members) {
                    const memberID = member.userID || member;
                    
                    // تجاهل المطورين والمجمدين سابقاً
                    if (global.config.AD.includes(memberID) || 
                        global.config.MAD.includes(memberID) || 
                        threadData.data.frozenUsers[memberID]) {
                        continue;
                    }

                    const userData = await usersData.get(memberID);
                    const memberName = await usersData.getName(memberID);

                    threadData.data.frozenUsers[memberID] = {
                        name: memberName,
                        frozenBy: senderID,
                        frozenByName: adminName,
                        frozenAt: currentTime,
                        balance: userData.money || 0,
                        timestamp: Date.now()
                    };

                    frozenCount++;
                }

                await threadsData.set(threadID, threadData.data.frozenUsers, "data.frozenUsers");

                api.setMessageReaction("❄️", messageID, (err) => {}, true);

                return black.reply(`◈ ──『 ❄️ تجميد شامل ❄️ 』── ◈

🧊 تم تجميد جميع الأعضاء!

📊 الإحصائيات:
  👥 عدد المجمدين: ${frozenCount}
  👥 إجمالي الأعضاء: ${members.length}
  👑 المطورين (مستثنين): ${global.config.AD.length}

📋 تفاصيل:
  👮 بواسطة: ${adminName}
  📅 التاريخ: ${currentTime}

⚠️ لا يمكن لأحد استخدام الأموال الآن!

💡 للفك: تجميد فك_الكل
◈ ──────────────── ◈`);
            }

            // فك تجميد الكل
            if (action === 'فك_الكل') {
                if (Auth < 2) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ هذا الأمر للمطورين فقط!
◈ ──────────────── ◈`);
                }

                const frozenCount = Object.keys(threadData.data.frozenUsers).length;

                if (frozenCount === 0) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ لا يوجد أعضاء مجمدين!
◈ ──────────────── ◈`);
                }

                // فك الجميع
                threadData.data.frozenUsers = {};
                await threadsData.set(threadID, {}, "data.frozenUsers");

                api.setMessageReaction("🔥", messageID, (err) => {}, true);

                return black.reply(`◈ ──『 🔥 فك التجميد الشامل 🔥 』── ◈

✅ تم فك تجميد جميع الأعضاء!

📊 الإحصائيات:
  👥 عدد المفكوكين: ${frozenCount}
  👮 بواسطة: ${await usersData.getName(senderID)}
  📅 التاريخ: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}

🎉 الجميع الآن يمكنهم استخدام أموالهم!
◈ ──────────────── ◈`);
            }

            // عرض قائمة المجمدين
            if (action === 'قائمة') {
                const frozenList = threadData.data.frozenUsers;
                const frozenCount = Object.keys(frozenList).length;

                if (frozenCount === 0) {
                    api.setMessageReaction("✅", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ✅ قائمة فارغة ✅ 』── ◈

🎉 لا يوجد أعضاء مجمدين!

الجميع يمكنهم استخدام أموالهم ✅
◈ ──────────────── ◈`);
                }

                api.setMessageReaction("📊", messageID, (err) => {}, true);

                let list = '';
                let totalFrozenMoney = 0;
                let index = 1;

                for (const [userID, data] of Object.entries(frozenList)) {
                    totalFrozenMoney += data.balance;
                    const duration = Math.floor((Date.now() - data.timestamp) / (1000 * 60 * 60));
                    
                    list += `${index}. 👤 ${data.name}\n`;
                    list += `   🆔 ${userID}\n`;
                    list += `   💰 ${data.balance.toLocaleString()} ج.س\n`;
                    list += `   ⏰ منذ ${duration} ساعة\n`;
                    list += `   👮 بواسطة: ${data.frozenByName}\n\n`;
                    index++;
                }

                return black.reply(`◈ ──『 📊 قائمة المجمدين 📊 』── ◈

❄️ الأعضاء المجمدين:

${list}📊 الإحصائيات:
  👥 عدد المجمدين: ${frozenCount}
  💰 إجمالي الأموال المجمدة: ${totalFrozenMoney.toLocaleString()} ج.س

💡 للفك: تجميد فك @منشن
◈ ──────────────── ◈`);
            }

        } catch (error) {
            console.error("Freeze Balance Error:", error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return black.reply(`◈ ──『 ❌ خطأ ❌ 』── ◈

⚠️ حدث خطأ: ${error.message}
◈ ──────────────── ◈`);
        }
    }
}

module.exports = new FreezeBalance();