class ResetMoney {
    constructor() {
        Object.assign(this, {
            config: {
                name: "تصفير",
                Auth: 2, // يحتاج صلاحية مطور فقط
                Owner: "عبدالرحمن",
                Info: "تصفير أموال عضو محدد أو الكل - حذف الرصيد نهائياً",
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
                api.setMessageReaction("💸", messageID, (err) => {}, true);
                return black.reply(`◈ ──『 💸 تصفير الأموال 💸 』── ◈

🗑️ حذف أموال الأعضاء نهائياً

📋 الأوامر المتاحة:

💥 تصفير @منشن - تصفير عضو محدد
💥 تصفير [ID] - تصفير بالـID
🔥 تصفير الكل - تصفير الجميع
📊 تصفير معاينة - معاينة قبل التصفير

⚠️ تحذير خطير:
  ❌ حذف نهائي للأموال
  ❌ لا يمكن التراجع
  ❌ يؤثر على البنك والمحفظة
  ⚡ عملية فورية

💡 هذا الأمر للمطورين فقط!
⚠️ استخدمه بحذر شديد!
◈ ──────────────── ◈`);
            }

            // التحقق من الصلاحيات (مطورين فقط)
            if (Auth < 2) {
                api.setMessageReaction("🚫", messageID, (err) => {}, true);
                return black.reply(`◈ ──『 🚫 ممنوع 🚫 』── ◈

❌ هذا الأمر للمطورين فقط!

👑 يحتاج صلاحيات عليا لخطورته
💸 يحذف الأموال نهائياً

⚠️ غير مصرح لك باستخدامه
◈ ──────────────── ◈`);
            }

            const threadData = await threadsData.get(threadID);

            // تصفير عضو محدد
            if (action !== 'الكل' && action !== 'معاينة') {
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
  تصفير @منشن
  تصفير [ID صحيح]
◈ ──────────────── ◈`);
                    }
                }

                if (!targetID) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ يجب تحديد العضو!

استخدم:
  تصفير @منشن
  تصفير [ID]
◈ ──────────────── ◈`);
                }

                // منع تصفير المطورين الرئيسيين
                if (global.config.MAD && global.config.MAD.includes(targetID)) {
                    api.setMessageReaction("🚫", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 🚫 ممنوع 🚫 』── ◈

❌ لا يمكن تصفير المطور الرئيسي!

👑 هذا الشخص مطور رئيسي
🛡️ محمي من التصفير

⚠️ تواصل مع المالك للتغيير
◈ ──────────────── ◈`);
                }

                // الحصول على بيانات العضو
                const userData = await usersData.get(targetID);
                const oldMoney = userData.money || 0;
                const oldBank = userData.data?.bank || 0;
                const totalMoney = oldMoney + oldBank;

                if (totalMoney === 0) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ رصيد العضو صفر بالفعل!

👤 ${targetName}
🆔 ${targetID}
💰 المحفظة: 0 ج.س
🏦 البنك: 0 ج.س
◈ ──────────────── ◈`);
                }

                // رسالة التأكيد
                api.setMessageReaction("⏳", messageID, (err) => {}, true);

                return black.reply(`◈ ──『 ⚠️ تأكيد التصفير ⚠️ 』── ◈

🔴 عملية خطيرة! تحتاج تأكيد

👤 العضو: ${targetName}
🆔 الـID: ${targetID}

💰 سيتم حذف:
  💵 المحفظة: ${oldMoney.toLocaleString()} ج.س
  🏦 البنك: ${oldBank.toLocaleString()} ج.س
  📊 الإجمالي: ${totalMoney.toLocaleString()} ج.س

⚠️ هذا الإجراء:
  ❌ لا يمكن التراجع عنه
  ❌ نهائي وفوري
  ❌ يحذف كل الأموال

✅ للتأكيد: رد بـ "نعم" خلال 30 ثانية
❌ للإلغاء: رد بـ "لا" أو تجاهل
◈ ──────────────── ◈`, (err, info) => {
                    if (err) return;

                    // إضافة للـ Reply
                    global.shelly.Reply.push({
                        name: this.config.name,
                        ID: info.messageID,
                        targetID: targetID,
                        targetName: targetName,
                        oldMoney: oldMoney,
                        oldBank: oldBank,
                        totalMoney: totalMoney,
                        type: 'single',
                        timeout: setTimeout(() => {
                            // حذف من Reply بعد 30 ثانية
                            const index = global.shelly.Reply.findIndex(e => e.ID === info.messageID);
                            if (index !== -1) {
                                global.shelly.Reply.splice(index, 1);
                            }
                        }, 30000)
                    });
                });

                return;
            }

            // تصفير الكل
            if (action === 'الكل') {
                const members = threadData.members || [];
                let totalWillReset = 0;
                let totalMoneyWillLost = 0;

                // حساب الإحصائيات
                for (const member of members) {
                    const memberID = member.userID || member;
                    
                    // تجاهل المطورين الرئيسيين
                    if (global.config.MAD && global.config.MAD.includes(memberID)) {
                        continue;
                    }

                    const userData = await usersData.get(memberID);
                    const memberMoney = (userData.money || 0) + (userData.data?.bank || 0);
                    
                    if (memberMoney > 0) {
                        totalWillReset++;
                        totalMoneyWillLost += memberMoney;
                    }
                }

                if (totalWillReset === 0) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ لا يوجد أعضاء لديهم أموال!

الجميع رصيدهم صفر بالفعل ✅
◈ ──────────────── ◈`);
                }

                // رسالة التأكيد
                api.setMessageReaction("⏳", messageID, (err) => {}, true);

                return black.reply(`◈ ──『 🔥 تأكيد التصفير الشامل 🔥 』── ◈

⚠️⚠️ عملية خطيرة جداً! ⚠️⚠️

📊 سيتم تصفير:
  👥 عدد الأعضاء: ${totalWillReset}
  💰 إجمالي الأموال: ${totalMoneyWillLost.toLocaleString()} ج.س
  🏦 البنوك والمحافظ: الكل

⚠️ هذا الإجراء:
  ❌ لا يمكن التراجع عنه أبداً
  ❌ نهائي وفوري
  ❌ يحذف كل أموال المجموعة
  ⚡ سيفقد الجميع أموالهم

🛡️ محمي من التصفير:
  👑 المطورين الرئيسيين: ${global.config.MAD?.length || 0}

✅ للتأكيد: رد بـ "تأكيد شامل" خلال 30 ثانية
❌ للإلغاء: رد بـ "لا" أو تجاهل

⚠️ فكر جيداً قبل التأكيد!
◈ ──────────────── ◈`, (err, info) => {
                    if (err) return;

                    // إضافة للـ Reply
                    global.shelly.Reply.push({
                        name: this.config.name,
                        ID: info.messageID,
                        type: 'all',
                        totalWillReset: totalWillReset,
                        totalMoneyWillLost: totalMoneyWillLost,
                        members: members,
                        timeout: setTimeout(() => {
                            const index = global.shelly.Reply.findIndex(e => e.ID === info.messageID);
                            if (index !== -1) {
                                global.shelly.Reply.splice(index, 1);
                            }
                        }, 30000)
                    });
                });

                return;
            }

            // معاينة التصفير
            if (action === 'معاينة') {
                const members = threadData.members || [];
                let richList = [];

                // جمع بيانات الأعضاء
                for (const member of members) {
                    const memberID = member.userID || member;
                    
                    if (global.config.MAD && global.config.MAD.includes(memberID)) {
                        continue;
                    }

                    const userData = await usersData.get(memberID);
                    const memberName = await usersData.getName(memberID);
                    const wallet = userData.money || 0;
                    const bank = userData.data?.bank || 0;
                    const total = wallet + bank;
                    
                    if (total > 0) {
                        richList.push({
                            id: memberID,
                            name: memberName,
                            wallet: wallet,
                            bank: bank,
                            total: total
                        });
                    }
                }

                if (richList.length === 0) {
                    api.setMessageReaction("✅", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ✅ معاينة ✅ 』── ◈

🎉 لا يوجد أعضاء لديهم أموال!

الجميع رصيدهم صفر ✅
◈ ──────────────── ◈`);
                }

                // ترتيب من الأغنى للأفقر
                richList.sort((a, b) => b.total - a.total);

                // عرض أغنى 10 فقط
                const top10 = richList.slice(0, 10);
                let list = '';
                let totalMoney = 0;

                top10.forEach((user, index) => {
                    totalMoney += user.total;
                    list += `${index + 1}. 👤 ${user.name}\n`;
                    list += `   💵 محفظة: ${user.wallet.toLocaleString()} ج.س\n`;
                    list += `   🏦 بنك: ${user.bank.toLocaleString()} ج.س\n`;
                    list += `   📊 إجمالي: ${user.total.toLocaleString()} ج.س\n\n`;
                });

                const allTotal = richList.reduce((sum, u) => sum + u.total, 0);

                api.setMessageReaction("📊", messageID, (err) => {}, true);

                return black.reply(`◈ ──『 📊 معاينة التصفير 📊 』── ◈

💰 أغنى ${top10.length} أعضاء:

${list}📊 الإحصائيات الكاملة:
  👥 إجمالي الأعضاء الأغنياء: ${richList.length}
  💰 إجمالي الأموال: ${allTotal.toLocaleString()} ج.س
  💵 متوسط الرصيد: ${Math.floor(allTotal / richList.length).toLocaleString()} ج.س
  👑 الأغنى: ${richList[0].name} (${richList[0].total.toLocaleString()} ج.س)

⚠️ هذه الأموال ستُحذف عند التصفير!

💡 للتصفير:
  تصفير @منشن (عضو محدد)
  تصفير الكل (الجميع)
◈ ──────────────── ◈`);
            }

        } catch (error) {
            console.error("Reset Money Error:", error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return black.reply(`◈ ──『 ❌ خطأ ❌ 』── ◈

⚠️ حدث خطأ: ${error.message}
◈ ──────────────── ◈`);
        }
    }

    // دالة الرد على التأكيد
    async Reply({ api, event, sh: black, usersData, threadsData, Reply }) {
        const { senderID, body, messageID } = event;

        try {
            const response = body.toLowerCase().trim();

            // تصفير عضو واحد
            if (Reply.type === 'single') {
                clearTimeout(Reply.timeout);

                if (response === 'نعم') {
                    api.setMessageReaction("💥", messageID, (err) => {}, true);

                    // تصفير الرصيد
                    await usersData.set(Reply.targetID, {
                        money: 0,
                        data: {
                            ...(await usersData.get(Reply.targetID)).data,
                            bank: 0
                        }
                    });

                    api.setMessageReaction("✅", messageID, (err) => {}, true);

                    return black.reply(`◈ ──『 ✅ تم التصفير ✅ 』── ◈

💥 تم تصفير رصيد العضو بنجاح!

👤 الاسم: ${Reply.targetName}
🆔 الـID: ${Reply.targetID}

📉 الأموال المحذوفة:
  💵 المحفظة: ${Reply.oldMoney.toLocaleString()} ج.س
  🏦 البنك: ${Reply.oldBank.toLocaleString()} ج.س
  📊 الإجمالي: ${Reply.totalMoney.toLocaleString()} ج.س

✅ الرصيد الآن: 0 ج.س

📋 العملية:
  👮 بواسطة: ${await usersData.getName(senderID)}
  📅 التاريخ: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}

⚠️ لا يمكن التراجع عن هذا الإجراء!
◈ ──────────────── ◈`);
                } else if (response === 'لا') {
                    api.setMessageReaction("❌", messageID, (err) => {}, true);

                    return black.reply(`◈ ──『 ❌ تم الإلغاء ❌ 』── ◈

✅ تم إلغاء عملية التصفير

💰 رصيد ${Reply.targetName} لم يُمس
📊 الأموال محفوظة: ${Reply.totalMoney.toLocaleString()} ج.س

👍 قرار حكيم!
◈ ──────────────── ◈`);
                }
            }

            // تصفير الكل
            if (Reply.type === 'all') {
                clearTimeout(Reply.timeout);

                if (response === 'تأكيد شامل') {
                    api.setMessageReaction("⏳", messageID, (err) => {}, true);

                    let resetCount = 0;
                    let totalReset = 0;

                    // تصفير جميع الأعضاء
                    for (const member of Reply.members) {
                        const memberID = member.userID || member;
                        
                        if (global.config.MAD && global.config.MAD.includes(memberID)) {
                            continue;
                        }

                        const userData = await usersData.get(memberID);
                        const memberMoney = (userData.money || 0) + (userData.data?.bank || 0);
                        
                        if (memberMoney > 0) {
                            await usersData.set(memberID, {
                                money: 0,
                                data: {
                                    ...userData.data,
                                    bank: 0
                                }
                            });

                            resetCount++;
                            totalReset += memberMoney;
                        }
                    }

                    api.setMessageReaction("💥", messageID, (err) => {}, true);

                    return black.reply(`◈ ──『 💥 تم التصفير الشامل 💥 』── ◈

🔥 تم تصفير أموال الجميع!

📊 الإحصائيات:
  👥 عدد المصفرين: ${resetCount}
  💰 إجمالي الأموال المحذوفة: ${totalReset.toLocaleString()} ج.س
  🏦 البنوك والمحافظ: صفر

🛡️ محمي من التصفير:
  👑 المطورين الرئيسيين: ${global.config.MAD?.length || 0}

📋 العملية:
  👮 بواسطة: ${await usersData.getName(senderID)}
  📅 التاريخ: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}

⚠️ تم مسح كل الأموال نهائياً!
🔄 يمكن للأعضاء البدء من جديد
◈ ──────────────── ◈`);
                } else if (response === 'لا') {
                    api.setMessageReaction("❌", messageID, (err) => {}, true);

                    return black.reply(`◈ ──『 ❌ تم الإلغاء ❌ 』── ◈

✅ تم إلغاء التصفير الشامل

💰 جميع الأموال محفوظة
👥 ${Reply.totalWillReset} عضو نجوا من التصفير
📊 الأموال: ${Reply.totalMoneyWillLost.toLocaleString()} ج.س

👍 قرار حكيم جداً!
◈ ──────────────── ◈`);
                }
            }

        } catch (error) {
            console.error("Reset Money Reply Error:", error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return black.reply(`◈ ──『 ❌ خطأ ❌ 』── ◈

⚠️ حدث خطأ: ${error.message}
◈ ──────────────── ◈`);
        }
    }
}

module.exports = new ResetMoney();