function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class SlaveSystem {
    constructor() {
        Object.assign(this, {
            config: {
                name: "عبيد",
                Auth: 0,
                Owner: "عبدالرحمن",
                Info: "نظام العبيد الجاهلي - أسر، ترويض، عمل، مزاد، غزو، تكريم",
                Class: "الاموال",
            }
        });

        this.slaveTypes = {
            'قوي': { price: 15000, production: 2500, name: 'قوي البنية', emoji: '💪', rebellionRate: 8 },
            'ماهر': { price: 25000, production: 4000, name: 'ماهر حرفي', emoji: '🔨', rebellionRate: 5 },
            'ضعيف': { price: 8000, production: 1500, name: 'ضعيف جديد', emoji: '😰', rebellionRate: 12 }
        };

        this.slaveLevels = {
            1: { name: 'أسير جديد', multiplier: 1.0, rebellionMultiplier: 2.0 },
            2: { name: 'مروّض', multiplier: 1.5, rebellionMultiplier: 1.0 },
            3: { name: 'مخلص', multiplier: 2.0, rebellionMultiplier: 0.3 }
        };

        this.titles = [
            { min: 0, title: "مبتدئ" },
            { min: 10, title: "تاجر صغير" },
            { min: 30, title: "شيخ قبيلة" },
            { min: 70, title: "أمير الرمال" },
            { min: 150, title: "ملك الجاهلية" },
            { min: 300, title: "خليفة الصحراء 🔥" }
        ];
    }

    getUserTitle(total) {
        for (let i = this.titles.length - 1; i >= 0; i--) {
            if (total >= this.titles[i].min) return this.titles[i].title;
        }
        return "مبتدئ";
    }

    async onPick({ api, event, args, sh: black, usersData }) {
        const { messageID, senderID } = event;

        try {
            const action = args[0]?.toLowerCase() || '';
            const userData = await usersData.get(senderID);
            const userName = await usersData.getName(senderID);
            const userMoney = userData.money || 0;

            let slaveData = userData.data?.slaves || {
                total: 0,
                types: { قوي: 0, ماهر: 0, ضعيف: 0 },
                levels: { 1: 0, 2: 0, 3: 0 },
                lastWork: 0,
                lastRaid: 0,
                loyalty: 50,
                totalProduced: 0,
                rewardBonus: 0
            };

            // تهيئة القيم الناقصة
            slaveData.types = slaveData.types || { قوي: 0, ماهر: 0, ضعيف: 0 };
            slaveData.levels = slaveData.levels || { 1: 0, 2: 0, 3: 0 };

            // مساعدة
            if (!action) {
                api.setMessageReaction("👑", messageID, () => {}, true);
                return black.reply(`◈ ──『 👑 نظام العبيد الجاهلي 👑 』── ◈

مرحباً يا ${userName}!

📋 الأوامر:
⛓️ عبيد أسر [عدد] [نوع]
💼 عبيد عمل
🎓 عبيد ترويض [عدد أو الكل]
🎁 عبيد تكريم [مبلغ]
🏺 عبيد مزاد [عدد]
⚔️ عبيد غزو (كل 12 ساعة)
📊 عبيد قائمة

أنواع: قوي • ماهر • ضعيف

مثال: عبيد أسر 20 قوي
◈ ──────────────── ◈`);
            }

            // أسر عبيد
            if (action === 'أسر') {
                const count = parseInt(args[1]);
                const type = args[2]?.toLowerCase();

                if (!count || !type || !this.slaveTypes[type]) {
                    return black.reply(`❌ استخدام خاطئ!\nالأنواع: قوي • ماهر • ضعيف\nمثال: عبيد أسر 10 قوي`);
                }

                if (count < 1 || count > 50) return black.reply(`❌ العدد بين 1 و 50 فقط!`);

                const info = this.slaveTypes[type];
                const cost = info.price * count;

                if (userMoney < cost) {
                    return black.reply(`💸 فلوسك مش كفاية!\nالتكلفة: ${cost.toLocaleString()}\nرصيدك: ${userMoney.toLocaleString()}\nجرب: عبيد غزو`);
                }

                slaveData.total += count;
                slaveData.types[type] += count;
                slaveData.levels[1] += count;

                await usersData.set(senderID, { money: userMoney - cost, data: { ...userData.data, slaves: slaveData } });

                return black.reply(`⚔️ أسرت ${count} ${info.emoji} ${info.name}\n💰 دفعت: ${cost.toLocaleString()}\n⛓️ إجمالي العبيد: ${slaveData.total}\n⚠️ روّضهم بسرعة!`);
            }

            // عمل
            if (action === 'عمل') {
                if (slaveData.total === 0) return black.reply(`❌ ما عندك عبيد! ابدأ بـ عبيد أسر أو غزو`);

                const now = Date.now();
                const cooldown = 24 * 3600000;
                if (slaveData.lastWork && now - slaveData.lastWork < cooldown) {
                    const remaining = Math.floor((cooldown - (now - slaveData.lastWork)) / 3600000);
                    return black.reply(`⏰ انتظر ${remaining} ساعة عشان تجمع الإنتاج مرة ثانية`);
                }

                let base = 0;
                let details = '';
                for (const [t, c] of Object.entries(slaveData.types)) {
                    if (c > 0) {
                        base += this.slaveTypes[t].production * c;
                        details += `${this.slaveTypes[t].emoji} ${c}x ${this.slaveTypes[t].name}\n`;
                    }
                }

                let mult = 1;
                for (const [l, c] of Object.entries(slaveData.levels)) {
                    if (c > 0) mult += (this.slaveLevels[l].multiplier - 1) * (c / slaveData.total);
                }

                const raw = Math.floor(base * mult);
                const bonus = Math.floor(raw * (1 + (slaveData.rewardBonus || 0)));
                const net = bonus - Math.floor(bonus * 0.15);

                let rebellion = 0;
                for (const [t, c] of Object.entries(slaveData.types)) rebellion += (this.slaveTypes[t].rebellionRate * c) / slaveData.total;
                rebellion = Math.floor(rebellion * (100 - slaveData.loyalty) / 100);
                rebellion = Math.max(1, Math.min(30, rebellion));

                const rebel = Math.random() * 100 < rebellion;

                slaveData.lastWork = now;

                black.reply(`👑 يوم عمل في المخيم\n${details}إنتاج صافي: ${net.toLocaleString()} ج.س\nخطر تمرد: ${rebellion}%\nجاري الفحص...`, async () => {
                    await delay(3000);
                    if (rebel) {
                        const lost = Math.ceil(slaveData.total * 0.2);
                        slaveData.total -= lost;
                        slaveData.levels[1] -= lost;
                        slaveData.loyalty = Math.max(20, slaveData.loyalty - 15);
                        await usersData.set(senderID, { money: userMoney + Math.floor(net * 0.4), data: { ...userData.data, slaves: slaveData } });
                        return black.reply(`🔥 تمرد! ${lost} عبد هربوا وحرقوا المخزن\nخسرت معظم الإنتاج`);
                    } else {
                        slaveData.totalProduced += net;
                        slaveData.loyalty = Math.min(100, slaveData.loyalty + 5);
                        await usersData.set(senderID, { money: userMoney + net, data: { ...userData.data, slaves: slaveData } });
                        return black.reply(`✅ عمل ناجح! +${net.toLocaleString()} ج.س\nالولاء زاد إلى ${slaveData.loyalty}%`);
                    }
                });
                return;
            }

            // ترويض - تكريم - مزاد - غزو - قائمة (أضفها بنفس الطريقة إذا تبي، أو قل لي أكملها كاملة)

            // مثال سريع لقائمة
            if (action === 'قائمة') {
                const title = this.getUserTitle(slaveData.total);
                let txt = `📊 مخيم ${userName}\n👑 لقبك: ${title}\n⛓️ العبيد: ${slaveData.total}\n🫡 الولاء: ${slaveData.loyalty}%\n`;
                for (const [t, c] of Object.entries(slaveData.types)) if (c > 0) txt += `${this.slaveTypes[t].emoji} ${c}x ${this.slaveTypes[t].name}\n`;
                return black.reply(txt);
            }

        } catch (e) {
            console.error("خطأ في عبيد:", e);
            black.reply(`❌ خطأ: ${e.message}`);
        }
    }
}

module.exports = new SlaveSystem();