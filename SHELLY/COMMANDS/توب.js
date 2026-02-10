class TopRich {
    constructor() {
        Object.assign(this, {
            config: {
                name: "توب",
                Auth: 0,
                Owner: "عبدالرحمن",
                Info: "عرض توب أغنى المستخدمين في البوت مع ألقاب جميلة",
                Class: "الاموال",
            }
        });

        // الألقاب حسب الترتيب
        this.titles = {
            1: { title: '👑 إمبراطور الثروة', emoji: '👑', color: '🟡' },
            2: { title: '💎 ملك الذهب', emoji: '💎', color: '🔵' },
            3: { title: '🏆 أمير التجارة', emoji: '🏆', color: '🟠' },
            4: { title: '⭐ سيد الأعمال', emoji: '⭐', color: '🟢' },
            5: { title: '🌟 تاجر العصر', emoji: '🌟', color: '🟣' },
            6: { title: '💫 نجم المال', emoji: '💫', color: '🔴' },
            7: { title: '✨ فارس الثروة', emoji: '✨', color: '🟤' },
            8: { title: '🎯 صاحب الملايين', emoji: '🎯', color: '⚪' },
            9: { title: '🎪 قطب اقتصادي', emoji: '🎪', color: '⚫' },
            10: { title: '🎨 وزير المالية', emoji: '🎨', color: '🟡' }
        };

        // ألقاب حسب الفئة المالية
        this.wealthTitles = {
            billionaire: '🏰 مليـارديـر أسطـوري',
            multimillionaire: '🏛️ مليـونـيـر عظيـم',
            millionaire: '🏠 مليـونيـر طمـوح',
            wealthy: '💼 ثـري محتـرم',
            rich: '💰 غنـي متوسـط',
            moderate: '💵 متـوسـط الحـال',
            poor: '🪙 بداية الطريق'
        };
    }

    // دالة تحديد اللقب حسب المبلغ
    getWealthTitle(money) {
        if (money >= 1000000000) return this.wealthTitles.billionaire; // مليار+
        if (money >= 100000000) return this.wealthTitles.multimillionaire; // 100 مليون+
        if (money >= 10000000) return this.wealthTitles.millionaire; // 10 مليون+
        if (money >= 1000000) return this.wealthTitles.wealthy; // مليون+
        if (money >= 100000) return this.wealthTitles.rich; // 100 ألف+
        if (money >= 10000) return this.wealthTitles.moderate; // 10 ألف+
        return this.wealthTitles.poor;
    }

    // دالة تحديد إيموجي الميدالية
    getMedal(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `${rank}️⃣`;
    }

    async onPick({ api, event, args, sh: black, usersData, threadsData }) {
        const { messageID, senderID, threadID } = event;

        try {
            const action = args[0]?.toLowerCase();

            // توب السيرفر (المجموعة)
            if (!action || action === 'سيرفر' || action === 'مجموعة') {
                api.setMessageReaction("🏆", messageID, (err) => {}, true);

                const threadData = await threadsData.get(threadID);
                const members = threadData.members || [];
                let richList = [];

                // جمع بيانات الأعضاء
                for (const member of members) {
                    const memberID = member.userID || member;
                    
                    try {
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
                    } catch (err) {
                        continue;
                    }
                }

                if (richList.length === 0) {
                    api.setMessageReaction("😢", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 😢 لا يوجد أغنياء 😢 』── ◈

💸 الجميع فقراء في هذه المجموعة!

🪙 لا يوجد أحد لديه أموال
💰 كونوا أول الأثرياء!

💡 ابدأ بجمع المال: !يومي
◈ ──────────────── ◈`);
                }

                // ترتيب من الأغنى للأفقر
                richList.sort((a, b) => b.total - a.total);

                // أخذ أول 10
                const top10 = richList.slice(0, 10);

                // التحقق من موقع المستخدم الحالي
                const userRank = richList.findIndex(u => u.id === senderID) + 1;
                const userData = richList.find(u => u.id === senderID);

                let list = '';
                top10.forEach((user, index) => {
                    const rank = index + 1;
                    const medal = this.getMedal(rank);
                    const titleData = this.titles[rank] || { title: '💼 تاجر ماهر', emoji: '💼' };
                    const wealthTitle = this.getWealthTitle(user.total);
                    const isCurrentUser = user.id === senderID ? ' ← أنت' : '';
                    
                    list += `${medal} ${titleData.emoji} ${user.name}${isCurrentUser}\n`;
                    list += `   ${wealthTitle}\n`;
                    list += `   💰 ${user.total.toLocaleString()} ج.س\n`;
                    list += `   💵 محفظة: ${user.wallet.toLocaleString()} | 🏦 بنك: ${user.bank.toLocaleString()}\n\n`;
                });

                // إحصائيات
                const totalWealth = richList.reduce((sum, u) => sum + u.total, 0);
                const avgWealth = Math.floor(totalWealth / richList.length);

                let userStats = '';
                if (userRank > 0 && userRank <= richList.length) {
                    if (userRank > 10) {
                        userStats = `\n📍 موقعك: المرتبة ${userRank} من ${richList.length}\n💰 رصيدك: ${userData.total.toLocaleString()} ج.س\n${this.getWealthTitle(userData.total)}\n`;
                    }
                } else {
                    userStats = `\n❌ أنت لست في القائمة (رصيدك: 0)\n`;
                }

                return black.reply(`◈ ──『 🏆 توب الأغنياء 🏆 』── ◈
◈ ──『 👑 ${threadData.threadName} 👑 』── ◈

${list}📊 إحصائيات السيرفر:
  👥 إجمالي الأغنياء: ${richList.length} عضو
  💰 ثروة السيرفر: ${totalWealth.toLocaleString()} ج.س
  📈 متوسط الثروة: ${avgWealth.toLocaleString()} ج.س
  👑 أغنى شخص: ${richList[0].name} (${richList[0].total.toLocaleString()} ج.س)
${userStats}
🌟 استمروا في التجارة والعمل!
◈ ──────────────── ◈`);
            }

            // توب البوت (عالمي)
            if (action === 'بوت' || action === 'عالمي' || action === 'الكل') {
                api.setMessageReaction("🌍", messageID, (err) => {}, true);

                const allUsers = global.db.allUserData || [];
                let richList = [];

                // جمع بيانات جميع المستخدمين
                for (const userData of allUsers) {
                    const wallet = userData.money || 0;
                    const bank = userData.data?.bank || 0;
                    const total = wallet + bank;
                    
                    if (total > 0) {
                        richList.push({
                            id: userData.userID,
                            name: userData.name,
                            wallet: wallet,
                            bank: bank,
                            total: total
                        });
                    }
                }

                if (richList.length === 0) {
                    api.setMessageReaction("😢", messageID, (err) => {}, true);
                    return black.reply(`◈ ──『 😢 لا يوجد أغنياء 😢 』── ◈

💸 لا يوجد مستخدمين أغنياء في البوت!
◈ ──────────────── ◈`);
                }

                // ترتيب من الأغنى للأفقر
                richList.sort((a, b) => b.total - a.total);

                // أخذ أول 15 للبوت
                const top15 = richList.slice(0, 15);

                // موقع المستخدم الحالي
                const userRank = richList.findIndex(u => u.id === senderID) + 1;
                const userData = richList.find(u => u.id === senderID);

                let list = '';
                top15.forEach((user, index) => {
                    const rank = index + 1;
                    const medal = this.getMedal(rank);
                    const titleData = this.titles[rank] || { title: '💼 تاجر ماهر', emoji: '💼' };
                    const wealthTitle = this.getWealthTitle(user.total);
                    const isCurrentUser = user.id === senderID ? ' ← أنت' : '';
                    
                    list += `${medal} ${titleData.emoji} ${user.name}${isCurrentUser}\n`;
                    list += `   ${wealthTitle}\n`;
                    list += `   💰 ${user.total.toLocaleString()} ج.س\n\n`;
                });

                // إحصائيات البوت
                const totalWealth = richList.reduce((sum, u) => sum + u.total, 0);
                const avgWealth = Math.floor(totalWealth / richList.length);
                const billionaires = richList.filter(u => u.total >= 1000000000).length;
                const millionaires = richList.filter(u => u.total >= 1000000).length;

                let userStats = '';
                if (userRank > 0 && userRank <= richList.length) {
                    userStats = `\n📍 موقعك العالمي: المرتبة ${userRank} من ${richList.length}\n💰 رصيدك: ${userData.total.toLocaleString()} ج.س\n${this.getWealthTitle(userData.total)}\n`;
                } else {
                    userStats = `\n❌ أنت لست في القائمة العالمية\n`;
                }

                return black.reply(`◈ ──『 🌍 توب البوت العالمي 🌍 』── ◈

${list}📊 إحصائيات البوت:
  👥 إجمالي الأغنياء: ${richList.length.toLocaleString()} مستخدم
  💰 الثروة العالمية: ${totalWealth.toLocaleString()} ج.س
  📈 متوسط الثروة: ${avgWealth.toLocaleString()} ج.س
  🏰 مليارديرات: ${billionaires}
  🏛️ مليونيرات: ${millionaires}
  👑 أغنى شخص: ${richList[0].name}
     (${richList[0].total.toLocaleString()} ج.س)
${userStats}
🌟 تنافسوا على المركز الأول!
◈ ──────────────── ◈`);
            }

            // توب المحافظ فقط
            if (action === 'محافظ' || action === 'محفظة') {
                api.setMessageReaction("💵", messageID, (err) => {}, true);

                const threadData = await threadsData.get(threadID);
                const members = threadData.members || [];
                let richList = [];

                for (const member of members) {
                    const memberID = member.userID || member;
                    
                    try {
                        const userData = await usersData.get(memberID);
                        const memberName = await usersData.getName(memberID);
                        const wallet = userData.money || 0;
                        
                        if (wallet > 0) {
                            richList.push({
                                id: memberID,
                                name: memberName,
                                wallet: wallet
                            });
                        }
                    } catch (err) {
                        continue;
                    }
                }

                richList.sort((a, b) => b.wallet - a.wallet);
                const top10 = richList.slice(0, 10);

                let list = '';
                top10.forEach((user, index) => {
                    const rank = index + 1;
                    const medal = this.getMedal(rank);
                    const isCurrentUser = user.id === senderID ? ' ← أنت' : '';
                    
                    list += `${medal} ${user.name}${isCurrentUser}\n`;
                    list += `   💵 ${user.wallet.toLocaleString()} ج.س\n\n`;
                });

                return black.reply(`◈ ──『 💵 توب المحافظ 💵 』── ◈

${list}💡 المحافظ معرضة للسرقة!
🏦 احفظ أموالك في البنك: !ايداع
◈ ──────────────── ◈`);
            }

            // توب البنوك فقط
            if (action === 'بنوك' || action === 'بنك') {
                api.setMessageReaction("🏦", messageID, (err) => {}, true);

                const threadData = await threadsData.get(threadID);
                const members = threadData.members || [];
                let richList = [];

                for (const member of members) {
                    const memberID = member.userID || member;
                    
                    try {
                        const userData = await usersData.get(memberID);
                        const memberName = await usersData.getName(memberID);
                        const bank = userData.data?.bank || 0;
                        
                        if (bank > 0) {
                            richList.push({
                                id: memberID,
                                name: memberName,
                                bank: bank
                            });
                        }
                    } catch (err) {
                        continue;
                    }
                }

                richList.sort((a, b) => b.bank - a.bank);
                const top10 = richList.slice(0, 10);

                let list = '';
                top10.forEach((user, index) => {
                    const rank = index + 1;
                    const medal = this.getMedal(rank);
                    const isCurrentUser = user.id === senderID ? ' ← أنت' : '';
                    
                    list += `${medal} ${user.name}${isCurrentUser}\n`;
                    list += `   🏦 ${user.bank.toLocaleString()} ج.س\n\n`;
                });

                return black.reply(`◈ ──『 🏦 توب البنوك 🏦 』── ◈

${list}🛡️ الأموال في البنك محمية!
✅ حكيم من يحفظ ثروته
◈ ──────────────── ◈`);
            }

            // معلومات عن الأمر
            api.setMessageReaction("❓", messageID, (err) => {}, true);
            return black.reply(`◈ ──『 🏆 أمر التوب 🏆 』── ◈

📋 الأوامر المتاحة:

🏆 توب - توب السيرفر (المجموعة)
🌍 توب بوت - توب البوت العالمي
💵 توب محافظ - توب المحافظ فقط
🏦 توب بنوك - توب البنوك فقط

🎖️ الألقاب:
  👑 المركز 1: إمبراطور الثروة
  💎 المركز 2: ملك الذهب
  🏆 المركز 3: أمير التجارة
  ⭐ المركز 4: سيد الأعمال
  🌟 المركز 5: تاجر العصر
  ... وألقاب أخرى مميزة!

💰 الفئات المالية:
  🏰 مليارديـر: 1,000,000,000+ ج.س
  🏛️ مليونيـر عظيـم: 100,000,000+ ج.س
  🏠 مليونيـر: 10,000,000+ ج.س
  💼 ثـري: 1,000,000+ ج.س
  💰 غنـي: 100,000+ ج.س

🌟 تنافس واصعد للقمة!
◈ ──────────────── ◈`);

        } catch (error) {
            console.error("Top Rich Error:", error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return black.reply(`◈ ──『 ❌ خطأ ❌ 』── ◈

⚠️ حدث خطأ: ${error.message}
◈ ──────────────── ◈`);
        }
    }
}

module.exports = new TopRich();