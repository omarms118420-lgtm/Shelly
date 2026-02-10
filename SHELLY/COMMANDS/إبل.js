function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class CamelTrade {
    constructor() {
        Object.assign(this, {
            config: {
                name: "إبل",
                Auth: 0,
                Owner: "عبدالرحمن",
                Info: "شراء وتربية الإبل وإرسال القوافل التجارية",
                Class: "الاموال",
            }
        });

        // أنواع الإبل
        this.camelTypes = {
            'هجن': { price: 50000, speed: 1.5, production: 8000, name: 'هجن سريعة', emoji: '🏃' },
            'بخاتي': { price: 35000, speed: 1.0, production: 6000, name: 'بخاتي قوية', emoji: '💪' },
            'مجاهيم': { price: 70000, speed: 1.2, production: 10000, name: 'مجاهيم أصيلة', emoji: '👑' },
            'عرب': { price: 45000, speed: 1.3, production: 7000, name: 'عرب نجدية', emoji: '⭐' }
        };
    }

    async onPick({ api, event, args, sh: black, usersData }) {
        const { messageID, senderID } = event;

        try {
            const action = args[0]?.toLowerCase();

            // عرض المساعدة
            if (!action) {
                api.setMessageReaction("🐪", messageID, (err) => {}, true);
                return black.reply(`◈ ──『 🐪 سوق الإبل 🐪 』── ◈

مرحباً يا تاجر القوافل!

📋 الأوامر المتاحة:

🐫 إبل [عدد] [نوع] - شراء إبل
🚛 قافلة - إرسال قافلة تجارية
💧 رعاية [عدد] - رعاية الإبل
📊 حظيرتي - عرض إبلك

📝 أنواع الإبل:
  🏃 هجن: 50,000 ج.س (سريعة)
  💪 بخاتي: 35,000 ج.س (قوية)
  👑 مجاهيم: 70,000 ج.س (أصيلة)
  ⭐ عرب: 45,000 ج.س (نجدية)

مثال: إبل 10 هجن
◈ ──────────────── ◈`);
            }

            const userData = await usersData.get(senderID);
            const userName = await usersData.getName(senderID);
            const userMoney = userData.money || 0;
            let camelData = userData.data?.camels || {
                total: 0,
                types: {},
                level: 1,
                lastCare: 0,
                caravans: 0
            };

            // شراء الإبل
            if (!isNaN(action)) {
                const count = parseInt(action);
                const type = args[1]?.toLowerCase();

                if (!type || !this.camelTypes[type]) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ نوع الإبل غير صحيح!

الأنواع المتاحة:
🏃 هجن - 💪 بخاتي - 👑 مجاهيم - ⭐ عرب

مثال: إبل 10 هجن
◈ ──────────────── ◈`);
                }

                if (count <= 0 || count > 50) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ العدد يجب أن يكون بين 1 و 50!
◈ ──────────────── ◈`);
                }

                const camelInfo = this.camelTypes[type];
                const totalCost = camelInfo.price * count;

                if (userMoney < totalCost) {
                    api.setMessageReaction("💸", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 💸 رصيد غير كافٍ 💸 』── ◈

📦 ${count}x ${camelInfo.emoji} ${camelInfo.name}
💰 التكلفة: ${totalCost.toLocaleString()} ج.س

💵 رصيدك: ${userMoney.toLocaleString()} ج.س
❌ ينقصك: ${(totalCost - userMoney).toLocaleString()} ج.س
◈ ──────────────── ◈`);
                }

                api.setMessageReaction("🐫", messageID, (err) => {}, true);

                // إضافة الإبل
                camelData.total += count;
                camelData.types[type] = (camelData.types[type] || 0) + count;

                // خصم المبلغ
                await usersData.set(senderID, {
                    money: userMoney - totalCost,
                    data: {
                        ...userData.data,
                        camels: camelData
                    }
                });

                const dailyProduction = camelInfo.production * count;
                const readyTime = 6;

                return black.reply(`◈ ──『 🎉 شراء ناجح 🎉 』── ◈

🐪 اشتريت ${count}x ${camelInfo.emoji} ${camelInfo.name}
   من سوق الحديدة! 🏜️

💰 التكلفة: ${totalCost.toLocaleString()} ج.س
   (${camelInfo.price.toLocaleString()} لكل واحدة)

📊 المستوى: ${camelData.level} (تحتاج رعاية)
⏳ جاهزة للقافلة بعد ${readyTime} ساعات

📈 إنتاج متوقع: ${dailyProduction.toLocaleString()} ج.س يومياً

💵 رصيدك: ${(userMoney - totalCost).toLocaleString()} ج.س
🐫 إجمالي إبلك: ${camelData.total}
◈ ──────────────── ◈`);
            }

            // إرسال قافلة
            if (action === 'قافلة') {
                if (camelData.total === 0) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ ليس لديك إبل!

اشتري إبل أولاً: إبل 10 هجن
◈ ──────────────── ◈`);
                }

                // حساب الربح
                let baseProfit = 0;
                let camelDetails = '';
                for (const [type, count] of Object.entries(camelData.types)) {
                    const typeInfo = this.camelTypes[type];
                    baseProfit += typeInfo.production * count * typeInfo.speed;
                    camelDetails += `  ${typeInfo.emoji} ${count}x ${typeInfo.name}\n`;
                }

                // مكافأة المستوى
                const levelBonus = camelData.level * 0.2;
                const totalProfit = Math.floor(baseProfit * (1 + levelBonus));

                // التكاليف
                const costs = Math.floor(totalProfit * 0.15);
                const netProfit = totalProfit - costs;

                // احتمال الهجوم
                const attackChance = Math.max(5, 15 - (camelData.level * 2));
                const isAttacked = Math.random() * 100 < attackChance;

                api.setMessageReaction("🚛", messageID, (err) => {}, true);

                black.reply(`◈ ──『 🚛 قافلة تجارية 🚛 』── ◈

📦 أرسلت قافلة بـ ${camelData.total} إبل
   محملة بالتمر والحلي والبهارات!

🐪 تفاصيل القافلة:
${camelDetails}
👥 العبيد المرافقين: ${Math.floor(camelData.total / 2)}
   (للحماية والخدمة)

💰 ربح القافلة: ${totalProfit.toLocaleString()} ج.س
💸 الأكل والرشاوى: -${costs.toLocaleString()} ج.س
✅ ربح صافي: +${netProfit.toLocaleString()} ج.س

🎁 المكافآت:
  ⭐ مستوى ${camelData.level}: +${(levelBonus * 100).toFixed(0)}%
${camelData.types['هجن'] ? '  🏃 هجن سريعة: +50%\n' : ''}
⚠️ احتمال الهجوم: ${attackChance}%

⏳ انتظر النتيجة...
◈ ──────────────── ◈`, async () => {
                    await delay(3000);

                    if (isAttacked) {
                        const lostCamels = Math.floor(camelData.total * 0.2);
                        const lostMoney = Math.floor(netProfit * 0.5);
                        
                        camelData.total = Math.max(0, camelData.total - lostCamels);
                        
                        // تحديث عدد الإبل لكل نوع
                        for (const type in camelData.types) {
                            camelData.types[type] = Math.floor(camelData.types[type] * 0.8);
                        }
                        
                        await usersData.set(senderID, {
                            money: userMoney + lostMoney,
                            data: {
                                ...userData.data,
                                camels: camelData
                            }
                        });

                        api.setMessageReaction("⚔️", messageID, (err) => {}, true);

                        return black.reply(`◈ ──『 ⚔️ هجوم! ⚔️ 』── ◈

💀 تعرضت قافلتك لهجوم عنيف!
⚔️ العبيد قاوموا لكن...

📉 الخسائر:
  🐪 فقدت ${lostCamels} إبل
  💰 سُرق نصف البضاعة

💵 الربح بعد الهجوم: ${lostMoney.toLocaleString()} ج.س
🐫 إبلك المتبقية: ${camelData.total}

💪 ارفع مستوى إبلك للحماية!
◈ ──────────────── ◈`);
                    } else {
                        camelData.caravans++;
                        
                        await usersData.set(senderID, {
                            money: userMoney + netProfit,
                            data: {
                                ...userData.data,
                                camels: camelData
                            }
                        });

                        api.setMessageReaction("✅", messageID, (err) => {}, true);

                        return black.reply(`◈ ──『 ✅ قافلة ناجحة ✅ 』── ◈

🎊 وصلت قافلتك بسلام!
📦 البضاعة سُلّمت بالكامل

💰 الربح الصافي: +${netProfit.toLocaleString()} ج.س
💵 رصيدك الجديد: ${(userMoney + netProfit).toLocaleString()} ج.س

📊 إحصائياتك:
  🚛 إجمالي القوافل: ${camelData.caravans}
  ⭐ مستوى الإبل: ${camelData.level}
  🐫 عدد الإبل: ${camelData.total}

🌟 تاجر ماهر! بارك الله في مالك
◈ ──────────────── ◈`);
                    }
                });

                return;
            }

            // رعاية الإبل
            if (action === 'رعاية') {
                if (camelData.total === 0) {
                    api.setMessageReaction("⚠️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ ليس لديك إبل للرعاية!
◈ ──────────────── ◈`);
                }

                const careCount = parseInt(args[1]) || camelData.total;
                
                if (careCount > camelData.total) {
                    return black.reply(`◈ ──『 ⚠️ تنبيه ⚠️ 』── ◈

❌ لديك فقط ${camelData.total} إبل!
◈ ──────────────── ◈`);
                }

                const careCost = careCount * 15000;

                if (userMoney < careCost) {
                    api.setMessageReaction("💸", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 💸 رصيد غير كافٍ 💸 』── ◈

💧 تكلفة الرعاية: ${careCost.toLocaleString()} ج.س
💵 رصيدك: ${userMoney.toLocaleString()} ج.س
◈ ──────────────── ◈`);
                }

                camelData.level++;
                camelData.lastCare = Date.now();

                await usersData.set(senderID, {
                    money: userMoney - careCost,
                    data: {
                        ...userData.data,
                        camels: camelData
                    }
                });

                api.setMessageReaction("💧", messageID, (err) => {}, true);

                const bonusPercent = camelData.level * 20;

                return black.reply(`◈ ──『 💧 رعاية إبل 💧 』── ◈

🐪 رعيت ${careCount} إبل بالعشب الجيد
   والماء النقي من البئر 💧

💰 التكلفة: ${careCost.toLocaleString()} ج.س

📈 مستواها الآن: ${camelData.level}! ⭐

🎁 المكافآت:
  💰 ربح القافلة: +${bonusPercent}%
  🏥 أقل عرضة للمرض
  🛡️ احتمال هجوم: -${camelData.level * 2}%

💵 رصيدك: ${(userMoney - careCost).toLocaleString()} ج.س

🌟 إبلك الآن أقوى وأسرع!
◈ ──────────────── ◈`);
            }

            // عرض الحظيرة
            if (action === 'حظيرتي') {
                if (camelData.total === 0) {
                    api.setMessageReaction("🏜️", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 🏜️ حظيرة فارغة 🏜️ 』── ◈

❌ حظيرتك فارغة!

ابدأ بشراء إبل: إبل 10 هجن
◈ ──────────────── ◈`);
                }

                api.setMessageReaction("🐫", messageID, (err) => {}, true);

                let camelList = '';
                let totalValue = 0;
                for (const [type, count] of Object.entries(camelData.types)) {
                    const typeInfo = this.camelTypes[type];
                    camelList += `  ${typeInfo.emoji} ${count}x ${typeInfo.name}\n`;
                    totalValue += typeInfo.price * count;
                }

                return black.reply(`◈ ──『 🐫 حظيرة ${userName} 🐫 』── ◈

📊 إحصائيات الحظيرة:

🐪 إجمالي الإبل: ${camelData.total}
⭐ المستوى: ${camelData.level}
🚛 القوافل الناجحة: ${camelData.caravans || 0}

📋 أنواع الإبل:
${camelList}
💰 القيمة الإجمالية: ${totalValue.toLocaleString()} ج.س

🌟 تاجر ناجح! استمر في التجارة
◈ ──────────────── ◈`);
            }

        } catch (error) {
            console.error("Camel Trade Error:", error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return black.reply(`◈ ──『 ❌ خطأ ❌ 』── ◈

⚠️ حدث خطأ: ${error.message}
◈ ──────────────── ◈`);
        }
    }
}

module.exports = new CamelTrade();