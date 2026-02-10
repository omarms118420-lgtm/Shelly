const schedule = require('node-schedule');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class SudaneseFarm {
    constructor() {
        Object.assign(this, {
            config: {
                name: "زراعة",
                Auth: 0,
                Owner: "عبدالرحمن",
                Info: "نظام زراعة سوداني متطور",
                Class: "الاموال",
            }
        });

        // أنواع المزروعات السودانية
        this.crops = {
            'كركديه': { 
                time: 30, // 30 دقيقة
                price: 5000, 
                sellPrice: 12000,
                water: 3,
                emoji: '🌺',
                color: '💗'
            },
            'عدريب': { 
                time: 45, 
                price: 8000, 
                sellPrice: 18000,
                water: 4,
                emoji: '🥭',
                color: '🧡'
            },
            'دنقليس': { 
                time: 25, 
                price: 4000, 
                sellPrice: 9000,
                water: 2,
                emoji: '🍊',
                color: '💛'
            },
            'نبق': { 
                time: 35, 
                price: 6000, 
                sellPrice: 14000,
                water: 3,
                emoji: '🫐',
                color: '💜'
            },
            'بلح': { 
                time: 40, 
                price: 7000, 
                sellPrice: 16000,
                water: 4,
                emoji: '🌴',
                color: '🤎'
            },
            'دخن': { 
                time: 50, 
                price: 10000, 
                sellPrice: 25000,
                water: 5,
                emoji: '🌾',
                color: '💚'
            },
            'سمسم': { 
                time: 35, 
                price: 6500, 
                sellPrice: 15000,
                water: 3,
                emoji: '🌰',
                color: '🤍'
            },
            'حلبة': { 
                time: 30, 
                price: 5500, 
                sellPrice: 13000,
                water: 3,
                emoji: '🫘',
                color: '💛'
            },
            'شعير': { 
                time: 45, 
                price: 8500, 
                sellPrice: 20000,
                water: 4,
                emoji: '🌾',
                color: '💚'
            }
        };

        this.maxSlots = 5; // عدد الخانات
    }

    getProgressBar(percentage) {
        const filled = Math.floor(percentage / 10);
        const empty = 10 - filled;
        return '▰'.repeat(filled) + '▱'.repeat(empty);
    }

    getColorByProgress(percentage) {
        if (percentage >= 90) return '💚';
        if (percentage >= 70) return '💛';
        if (percentage >= 50) return '🧡';
        if (percentage >= 30) return '💗';
        return '❤️';
    }

    calculateProgress(plantTime, cropTime) {
        const elapsed = Date.now() - plantTime;
        const total = cropTime * 60 * 1000; // تحويل لميلي ثانية
        return Math.min(100, Math.floor((elapsed / total) * 100));
    }

    getRemainingTime(plantTime, cropTime) {
        const elapsed = Date.now() - plantTime;
        const total = cropTime * 60 * 1000;
        const remaining = Math.max(0, total - elapsed);
        return Math.ceil(remaining / 60000); // تحويل لدقائق
    }

    async onPick({ api, event, args, sh: black, usersData }) {
        const { messageID, senderID } = event;

        try {
            const action = args[0]?.toLowerCase();
            const userName = await usersData.getName(senderID);
            const userData = await usersData.get(senderID);
            const userMoney = userData.money || 0;

            // إنشاء بيانات المزرعة إذا لم تكن موجودة
            if (!userData.data) {
                userData.data = {};
            }

            let farmData = userData.data.farm;
            
            // إنشاء بيانات المزرعة الافتراضية
            if (!farmData || !farmData.slots || !Array.isArray(farmData.slots)) {
                farmData = {
                    slots: Array(this.maxSlots).fill(null),
                    storage: {},
                    totalHarvests: 0
                };
                
                // حفظ البيانات الجديدة
                await usersData.set(senderID, {
                    data: {
                        ...userData.data,
                        farm: farmData
                    }
                });
            }

            // عرض القائمة الرئيسية
            if (!action) {
                api.setMessageReaction("🌾", messageID, (err) => {}, true);
                return black.reply(`◈ ──『 ❀ زراعة - دورا ❀ 』── ◈

❁┊👤 المزارع: ${userName}
❁┊💰 رصيدك: ${userMoney.toLocaleString()} ج.س
❁┊🌾 الحصادات: ${farmData.totalHarvests || 0}

❁┊📋 الأوامر:
❁┊  • زراعة <اسم_الزرعة>
❁┊  • زراعة سقي <رقم_الخانة>
❁┊  • زراعة حالة (عرض الحديقة)
❁┊  • زراعة حصاد <رقم_الخانة>
❁┊  • زراعة بيع <اسم> <كمية>
❁┊  • زراعة مخزن (عرض المخزون)

❁┊🌱 المزروعات المتاحة:
❁┊  🌺 كركديه - 🥭 عدريب - 🍊 دنقليس
❁┊  🫐 نبق - 🌴 بلح - 🌾 دخن
❁┊  🌰 سمسم - 🫘 حلبة - 🌾 شعير

❁┊💡 أمثلة:
❁┊  • زراعة كركديه
❁┊  • زراعة سقي 1
❁┊  • زراعة حالة
◈ ──────────── ◈`);
            }

            // زراعة
            if (this.crops[action]) {
                const cropName = action;
                const crop = this.crops[cropName];
                
                // التأكد من وجود slots
                if (!farmData.slots || !Array.isArray(farmData.slots)) {
                    farmData.slots = Array(this.maxSlots).fill(null);
                }
                
                const emptySlot = farmData.slots.findIndex(slot => slot === null);

                if (emptySlot === -1) {
                    api.setMessageReaction("🚫", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 🚫 حديقة ممتلئة 🚫 』── ◈

❁┊👤 المزارع: ${userName}
❁┊🚫 الحديقة ممتلئة!

❁┊💡 احصد أولاً ثم ازرع
❁┊📝 اكتب: زراعة حالة
◈ ──────────── ◈`);
                }

                if (userMoney < crop.price) {
                    api.setMessageReaction("💸", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 💸 رصيد غير كافٍ 💸 』── ◈

❁┊👤 المزارع: ${userName}

❁┊🌱 تكلفة ${cropName}: ${crop.price.toLocaleString()} ج.س
❁┊💰 رصيدك: ${userMoney.toLocaleString()} ج.س
❁┊📉 ينقصك: ${(crop.price - userMoney).toLocaleString()} ج.س

❁┊💡 اكتب: منجم
◈ ──────────── ◈`);
                }

                // زراعة
                farmData.slots[emptySlot] = {
                    name: cropName,
                    plantTime: Date.now(),
                    watered: 0,
                    needsWater: crop.water
                };

                await usersData.set(senderID, {
                    money: userMoney - crop.price,
                    data: {
                        ...userData.data,
                        farm: farmData
                    }
                });

                api.setMessageReaction("🌱", messageID, (err) => {}, true);

                const slotNumbers = ['①', '②', '③', '④', '⑤'];

                return black.reply(`◈ ──『 ❀ زراعة - دورا ❀ 』── ◈

❁┊👤 المزارع: ${userName}
❁┊🌱 زرعت ${crop.emoji} ${cropName}!

❁┊💰 التكلفة: ${crop.price.toLocaleString()} ج.س
❁┊📍 الخانة: ${slotNumbers[emptySlot]}
❁┊⏰ وقت النضج: ${crop.time} دقيقة
❁┊💧 يحتاج سقي: ${crop.water} مرات

❁┊💵 رصيدك: ${(userMoney - crop.price).toLocaleString()} ج.س

❁┊🌟 اسقيها جيداً لتنمو!
❁┊💡 اكتب: زراعة سقي ${emptySlot + 1}
◈ ──────────── ◈`);
            }

            // سقي
            if (action === 'سقي') {
                const slotNum = parseInt(args[1]);
                
                if (!slotNum || slotNum < 1 || slotNum > this.maxSlots) {
                    return black.reply(`⚠️ رقم الخانة يجب أن يكون بين 1 و ${this.maxSlots}

مثال: زراعة سقي 1`);
                }

                const slot = farmData.slots[slotNum - 1];
                
                if (!slot) {
                    return black.reply(`⚠️ الخانة ${slotNum} فارغة!

اكتب: زراعة حالة`);
                }

                if (slot.watered >= slot.needsWater) {
                    return black.reply(`◈ ──『 💧 مروية كافياً 💧 』── ◈

❁┊👤 المزارع: ${userName}
❁┊💧 هذه الزرعة مروية بشكل كافٍ!

❁┊✅ السقي: ${slot.watered} / ${slot.needsWater}
❁┊🌟 لا تحتاج المزيد
◈ ──────────── ◈`);
                }

                slot.watered++;

                await usersData.set(senderID, {
                    data: {
                        ...userData.data,
                        farm: farmData
                    }
                });

                api.setMessageReaction("💧", messageID, (err) => {}, true);

                const crop = this.crops[slot.name];

                return black.reply(`◈ ──『 ❀ سقي - دورا ❀ 』── ◈

❁┊👤 المزارع: ${userName}
❁┊💧 سقيت ${crop.emoji} ${slot.name}

❁┊📊 حالة الري:
${crop.color}${'▰'.repeat(slot.watered)}${'▱'.repeat(slot.needsWater - slot.watered)} 〔${Math.floor((slot.watered / slot.needsWater) * 100)}%〕

❁┊✅ السقي: ${slot.watered} / ${slot.needsWater}

${slot.watered >= slot.needsWater ? '❁┊🌟 الزرعة مروية بشكل مثالي!' : '❁┊💧 تحتاج المزيد من السقي'}
◈ ──────────── ◈`);
            }

            // عرض حالة الحديقة
            if (action === 'حالة') {
                api.setMessageReaction("🌷", messageID, (err) => {}, true);

                const filledSlots = farmData.slots.filter(s => s !== null).length;
                
                let slotsDisplay = '';
                const slotNumbers = ['①', '②', '③', '④', '⑤'];
                
                for (let i = 0; i < this.maxSlots; i++) {
                    const slot = farmData.slots[i];
                    
                    if (slot) {
                        const crop = this.crops[slot.name];
                        const progress = this.calculateProgress(slot.plantTime, crop.time);
                        const remaining = this.getRemainingTime(slot.plantTime, crop.time);
                        const progressBar = this.getProgressBar(progress);
                        const color = this.getColorByProgress(progress);
                        
                        slotsDisplay += `\n${slotNumbers[i]} ${crop.emoji} ${slot.name}\n`;
                        slotsDisplay += `${color}${progressBar} 〔${progress}%〕`;
                        
                        if (progress < 100) {
                            slotsDisplay += ` ⏳ ${remaining}د`;
                        } else {
                            slotsDisplay += ` ✅ جاهز!`;
                        }
                        
                        slotsDisplay += `\n💧 ${slot.watered}/${slot.needsWater}\n`;
                    } else {
                        slotsDisplay += `\n${slotNumbers[i]} — فارغة —\n\n`;
                    }
                }

                return black.reply(`◈ ──『 🌷 حديقتك 🌷 』── ◈

❁┊👤 المزارع: ${userName}
❁┊📊 المساحة: ${filledSlots} / ${this.maxSlots}
━━━━━━━━━━━━━━
${slotsDisplay}━━━━━━━━━━━━━━
❁┊🌾 احصد الزرعات الجاهزة!
❁┊💡 زراعة حصاد <رقم>
◈ ──────────── ◈`);
            }

            // حصاد
            if (action === 'حصاد') {
                const slotNum = parseInt(args[1]);
                
                if (!slotNum || slotNum < 1 || slotNum > this.maxSlots) {
                    return black.reply(`⚠️ رقم الخانة يجب أن يكون بين 1 و ${this.maxSlots}

مثال: زراعة حصاد 1`);
                }

                const slot = farmData.slots[slotNum - 1];
                
                if (!slot) {
                    return black.reply(`⚠️ الخانة ${slotNum} فارغة!`);
                }

                const crop = this.crops[slot.name];
                const progress = this.calculateProgress(slot.plantTime, crop.time);

                if (progress < 100) {
                    const remaining = this.getRemainingTime(slot.plantTime, crop.time);
                    const progressBar = this.getProgressBar(progress);
                    const color = this.getColorByProgress(progress);
                    
                    return black.reply(`◈ ──『 ⏳ غير جاهزة ⏳ 』── ◈

❁┊👤 المزارع: ${userName}
❁┊⏳ الزرعة غير جاهزة بعد!

❁┊📊 التقدم:
${color}${progressBar} 〔${progress}%〕

❁┊⏰ الوقت المتبقي: ${remaining} دقيقة
❁┊💡 انتظر حتى تصبح 100%
◈ ──────────── ◈`);
                }

                // حساب الكمية حسب السقي
                const waterBonus = (slot.watered / slot.needsWater);
                const baseAmount = 10;
                const amount = Math.floor(baseAmount * waterBonus);

                // إضافة للمخزن
                if (!farmData.storage) {
                    farmData.storage = {};
                }
                
                farmData.storage[slot.name] = (farmData.storage[slot.name] || 0) + amount;
                farmData.totalHarvests++;
                farmData.slots[slotNum - 1] = null;

                await usersData.set(senderID, {
                    data: {
                        ...userData.data,
                        farm: farmData
                    }
                });

                api.setMessageReaction("🎉", messageID, (err) => {}, true);

                return black.reply(`◈ ──『 ❀ حصاد - دورا ❀ 』── ◈

❁┊👤 المزارع: ${userName}
❁┊🎉 حصدت ${crop.emoji} ${slot.name}!

❁┊📦 الكمية: ${amount} كيلو
❁┊💧 نسبة السقي: ${Math.floor(waterBonus * 100)}%
${waterBonus >= 1 ? '❁┊⭐ حصاد ممتاز!' : waterBonus >= 0.7 ? '❁┊✅ حصاد جيد' : '❁┊⚠️ حصاد ضعيف (اسقي أكثر المرة القادمة)'}

❁┊🏪 أضيف للمخزن
❁┊📊 إجمالي حصاداتك: ${farmData.totalHarvests}

❁┊💰 جاهز للبيع!
❁┊💡 زراعة بيع ${slot.name} ${amount}
◈ ──────────── ◈`);
            }

            // بيع
            if (action === 'بيع') {
                const cropName = args[1]?.toLowerCase();
                const amount = parseInt(args[2]);

                if (!cropName || !this.crops[cropName]) {
                    return black.reply(`⚠️ اسم الزرعة غير صحيح!

المتاح: كركديه، عدريب، دنقليس، نبق، بلح، دخن، سمسم، حلبة، شعير`);
                }

                if (!amount || amount <= 0) {
                    return black.reply(`⚠️ الكمية غير صحيحة!

مثال: زراعة بيع كركديه 5`);
                }

                const available = farmData.storage?.[cropName] || 0;

                if (available < amount) {
                    return black.reply(`◈ ──『 ⚠️ كمية غير كافية ⚠️ 』── ◈

❁┊👤 المزارع: ${userName}
❁┊⚠️ ليس لديك هذه الكمية!

❁┊📦 المتوفر: ${available} كيلو
❁┊📝 المطلوب: ${amount} كيلو

❁┊💡 اكتب: زراعة مخزن
◈ ──────────── ◈`);
                }

                const crop = this.crops[cropName];
                const totalPrice = crop.sellPrice * amount;

                farmData.storage[cropName] -= amount;
                if (farmData.storage[cropName] === 0) {
                    delete farmData.storage[cropName];
                }

                await usersData.set(senderID, {
                    money: userMoney + totalPrice,
                    data: {
                        ...userData.data,
                        farm: farmData
                    }
                });

                api.setMessageReaction("💰", messageID, (err) => {}, true);

                return black.reply(`◈ ──『 ❀ بيع - دورا ❀ 』── ◈

❁┊👤 المزارع: ${userName}
❁┊💰 بعت ${crop.emoji} ${cropName}!

❁┊📦 الكمية: ${amount} كيلو
❁┊💵 سعر الكيلو: ${crop.sellPrice.toLocaleString()} ج.س
❁┊💰 الإجمالي: ${totalPrice.toLocaleString()} ج.س

❁┊💵 رصيدك الجديد: ${(userMoney + totalPrice).toLocaleString()} ج.س

❁┊🌟 تاجر ناجح! جزاك الله خيراً
◈ ──────────── ◈`);
            }

            // عرض المخزن
            if (action === 'مخزن') {
                api.setMessageReaction("📦", messageID, (err) => {}, true);

                if (!farmData.storage || Object.keys(farmData.storage).length === 0) {
                    return black.reply(`◈ ──『 📦 المخزن 📦 』── ◈

❁┊👤 المزارع: ${userName}
❁┊📦 المخزن فارغ!

❁┊🌱 ازرع واحصد لتملأ المخزن
❁┊💡 اكتب: زراعة حالة
◈ ──────────── ◈`);
                }

                let storageList = '';
                let totalValue = 0;

                for (const [name, amount] of Object.entries(farmData.storage)) {
                    const crop = this.crops[name];
                    const value = crop.sellPrice * amount;
                    totalValue += value;
                    storageList += `\n❁┊${crop.emoji} ${name}: ${amount} كيلو\n`;
                    storageList += `❁┊  💰 ${value.toLocaleString()} ج.س\n`;
                }

                return black.reply(`◈ ──『 📦 المخزن 📦 』── ◈

❁┊👤 المزارع: ${userName}
━━━━━━━━━━━━━━
${storageList}━━━━━━━━━━━━━━
❁┊💰 القيمة الإجمالية:
❁┊  ${totalValue.toLocaleString()} ج.س

❁┊🏪 للبيع: زراعة بيع <اسم> <كمية>
◈ ──────────── ◈`);
            }

        } catch (error) {
            console.error("Farm Error:", error);
            console.error("Error stack:", error.stack);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return black.reply(`❌ حدث خطأ: ${error.message}

💡 جرب: زراعة (بدون أي شيء)`);
        }
    }
}

module.exports = new SudaneseFarm();