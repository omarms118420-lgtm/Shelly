const config = {
    name: "سلوت",
    aliases: ["slot", "سلوتات", "سلوت_ماشين"],
    Auth: 0,
    description: "لعبة سلوت السودانية - جنيه سوداني",
    usage: "[المبلغ]",
    cooldown: 3
};

async function onPick({ api, event, args, sh, usersData }) {
    const { threadID, messageID, senderID } = event;

    try {
        // الحصول على بيانات المستخدم
        let userData = await usersData.get(senderID);
        let userMoney = userData.money || 0;
        const userName = userData.name || "اللاعب";

        // المبلغ المراد اللعب به
        const betAmount = parseInt(args[0]);

        // إذا لم يتم إدخال مبلغ - عرض المساعدة
        if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
            await sh.react("🎰");
            return sh.reply(
                "◈ ──『 ❀ سلوت - دورا ❀ 』── ◈\n\n" +
                "❁┊🎰 كيف تلعب السلوت؟\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊📝 الاستخدام: سلوت [المبلغ]\n" +
                "❁┊\n" +
                "❁┊💡 مثال: سلوت 10000\n" +
                "❁┊\n" +
                "❁┊📊 الحد الأدنى: 5,000 ج.س\n" +
                "❁┊📊 الحد الأقصى: 50,000,000 ج.س\n" +
                "❁┊\n" +
                "❁┊🎯 رموز الربح:\n" +
                "❁┊   🍒 🍒 🍒 → ×10 ربح كبير!\n" +
                "❁┊   🍋 🍋 🍋 → ×8 ربح ممتاز!\n" +
                "❁┊   🍊 🍊 🍊 → ×6 ربح حلو!\n" +
                "❁┊   🍎 🍎 🍎 → ×5 ربح كويس!\n" +
                "❁┊   🍇 🍇 🍇 → ×4 ربح بسيط!\n" +
                "❁┊   💎 💎 💎 → ×20 جاكبوت!\n" +
                "❁┊\n" +
                "❁┊💰 رصيدك: " + userMoney.toLocaleString() + " ج.س\n" +
                "❁┊🎲 نسبة الفوز: 35%\n" +
                "❁┊\n" +
                "◈ ──────────── ◈"
            );
        }

        // التحقق من الحدود
        if (betAmount < 5000) {
            await sh.react("❌");
            return sh.reply(
                "◈ ──『 ❀ سلوت - دورا ❀ 』── ◈\n\n" +
                "❁┊❌ مبلغ قليل جداً!\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊💰 المبلغ: " + betAmount.toLocaleString() + " ج.س\n" +
                "❁┊📊 الحد الأدنى: 5,000 ج.س\n" +
                "❁┊\n" +
                "❁┊💡 زوّد المبلغ وجرب حظك!\n" +
                "◈ ──────────── ◈"
            );
        }

        if (betAmount > 50000000) {
            await sh.react("⚠️");
            return sh.reply(
                "◈ ──『 ❀ سلوت - دورا ❀ 』── ◈\n\n" +
                "❁┊⚠️ مبلغ كبير جداً!\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊💰 المبلغ: " + betAmount.toLocaleString() + " ج.س\n" +
                "❁┊📊 الحد الأقصى: 50,000,000 ج.س\n" +
                "❁┊\n" +
                "❁┊💡 قلل المبلغ شوية!\n" +
                "◈ ──────────── ◈"
            );
        }

        // التحقق من المال
        if (userMoney < betAmount) {
            await sh.react("💸");
            return sh.reply(
                "◈ ──『 ❀ سلوت - دورا ❀ 』── ◈\n\n" +
                "❁┊💸 رصيدك غير كافٍ!\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊👤 اللاعب: " + userName + "\n" +
                "❁┊📊 رصيدك: " + userMoney.toLocaleString() + " ج.س\n" +
                "❁┊💰 تحتاج: " + betAmount.toLocaleString() + " ج.س\n" +
                "❁┊📉 النقص: " + (betAmount - userMoney).toLocaleString() + " ج.س\n" +
                "❁┊\n" +
                "❁┊💡 اجمع المزيد من الجنيهات!\n" +
                "❁┊🎯 جرب ألعاب أخرى أو اعمل!\n" +
                "◈ ──────────── ◈"
            );
        }

        // رسالة بداية اللعب
        await sh.react("🎰");
        await sh.reply(
            "◈ ──『 ❀ سلوت - دورا ❀ 』── ◈\n\n" +
            "❁┊🎰 جاري تدوير السلوت...\n" +
            "❁┊━━━━━━━━━━━━━━\n" +
            "❁┊👤 اللاعب: " + userName + "\n" +
            "❁┊💰 الرهان: " + betAmount.toLocaleString() + " ج.س\n" +
            "❁┊\n" +
            "❁┊🎲 🎲 🎲\n" +
            "❁┊⏳ انتظر شوية...\n" +
            "◈ ──────────── ◈"
        );

        // تأخير للتشويق
        await new Promise(resolve => setTimeout(resolve, 2000));

        // رموز السلوت
        const symbols = ["🍒", "🍋", "🍊", "🍎", "🍇", "💎"];
        const weights = [25, 25, 20, 15, 10, 5]; // احتمالات الظهور

        // دالة لاختيار رمز عشوائي حسب الوزن
        const getRandomSymbol = () => {
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;
            
            for (let i = 0; i < symbols.length; i++) {
                if (random < weights[i]) {
                    return symbols[i];
                }
                random -= weights[i];
            }
            return symbols[0];
        };

        // توليد نتيجة السلوت
        const slot1 = getRandomSymbol();
        const slot2 = getRandomSymbol();
        const slot3 = getRandomSymbol();

        // كُنى سودانية للربح
        const winPhrases = [
            { status: "حنّية 🌸", comment: "ربحت رزق سمح ساكت كدا", ending: "عدّت بالراحة 😌" },
            { status: "جابت 🌿", comment: "الدجاجة باضت ذهب النهاردة", ending: "على مهلك 🕊️" },
            { status: "سمحة 🤍", comment: "الرزق جاك من وين ما تدري", ending: "بالهدوء والراحة ☕" },
            { status: "ساكت كدا ☕", comment: "ما شاء الله! جات بهدوء", ending: "الحصان المهذب 🐎" },
            { status: "رزق 🎁", comment: "ربنا فتح عليك اليوم", ending: "حنّية ما شاء الله 💞" },
            { status: "بركة 🌟", comment: "البركة في مالك يا زول", ending: "الحمد لله على كل حال 🤲" },
            { status: "مبروك 🎊", comment: "يوم مبارك عليك", ending: "الله يزيدك من فضله 💫" }
        ];

        // كُنى سودانية للخسارة
        const losePhrases = [
            { status: "دعسة 💥", comment: "الليلة ما جابت", ending: "بسيطة… جرب تاني 😂" },
            { status: "خاب 💔", comment: "الحظ ما كان معاك هسع", ending: "المرة الجاية يا زول 😅" },
            { status: "ذابل 🥀", comment: "الوردة ذبلت شوية", ending: "بكرة أحسن إن شاء الله 🤲" },
            { status: "طار 💸", comment: "المال طار زي العصفور", ending: "لكن يرجع تاني 😌" },
            { status: "هطل 🌧️", comment: "هطلت سحابة سودا", ending: "بس الشمس قريبة ☀️" },
            { status: "خسران 😢", comment: "ما نفعت الليلة دي", ending: "الصبر مفتاح الفرج 🗝️" },
            { status: "غبش 🌫️", comment: "الحظ غبش شوية", ending: "بس بيصفى 🌤️" }
        ];

        // كُنى للتعادل
        const tiePhrases = [
            { status: "ساكت ☕", comment: "لا ربح لا خسارة", ending: "الحظ وقف في النص 😐" },
            { status: "وسط ⚖️", comment: "الميزان معتدل", ending: "سوا سوا 🤝" },
            { status: "عادي 😐", comment: "عادي كدا ما في حاجة", ending: "رجع زي ما كان 🔄" },
            { status: "زي ما هو 🔄", comment: "المال سرح ورجع", ending: "الحمد لله ما خسرت 🙏" }
        ];

        let multiplier = 0;
        let winAmount = 0;
        let newMoney = userMoney;
        let message = "";
        let resultEmoji = "";

        // فحص النتيجة
        if (slot1 === slot2 && slot2 === slot3) {
            // ربح! الثلاثة متطابقين
            if (slot1 === "💎") {
                multiplier = 20; // جاكبوت!
                resultEmoji = "🎊";
            } else if (slot1 === "🍒") {
                multiplier = 10;
                resultEmoji = "🎉";
            } else if (slot1 === "🍋") {
                multiplier = 8;
                resultEmoji = "✨";
            } else if (slot1 === "🍊") {
                multiplier = 6;
                resultEmoji = "🌟";
            } else if (slot1 === "🍎") {
                multiplier = 5;
                resultEmoji = "⭐";
            } else if (slot1 === "🍇") {
                multiplier = 4;
                resultEmoji = "💫";
            }

            winAmount = betAmount * multiplier;
            newMoney = userMoney + winAmount;

            const randomPhrase = winPhrases[Math.floor(Math.random() * winPhrases.length)];

            await sh.react("🎉");
            message = "◈ ──『 ❀ سلوت - دورا ❀ 』── ◈\n\n" +
                "❁┊👤 اللاعب: " + userName + "\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊🎰 ┃ " + slot1 + " " + slot2 + " " + slot3 + " ┃ 🎰\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊" + randomPhrase.status + "\n" +
                "❁┊\n" +
                "❁┊🎉 " + randomPhrase.comment + "\n" +
                (multiplier === 20 ? "❁┊🎊 جاكبوت! ربح أسطوري!\n" : "") +
                "❁┊💰 الرهان: " + betAmount.toLocaleString() + " ج.س\n" +
                "❁┊" + resultEmoji + " المضاعف: ×" + multiplier + "\n" +
                "❁┊✅ الربح: " + winAmount.toLocaleString() + " ج.س\n" +
                "❁┊\n" +
                "❁┊" + randomPhrase.ending + "\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊💵 الرصيد السابق: " + userMoney.toLocaleString() + " ج.س\n" +
                "❁┊💰 الرصيد الحالي: " + newMoney.toLocaleString() + " ج.س\n" +
                "❁┊📈 الزيادة: +" + winAmount.toLocaleString() + " ج.س\n" +
                "◈ ──────────── ◈";

        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            // تعادل - اثنان متطابقان
            const randomPhrase = tiePhrases[Math.floor(Math.random() * tiePhrases.length)];

            await sh.react("😐");
            message = "◈ ──『 ❀ سلوت - دورا ❀ 』── ◈\n\n" +
                "❁┊👤 اللاعب: " + userName + "\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊🎰 ┃ " + slot1 + " " + slot2 + " " + slot3 + " ┃ 🎰\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊" + randomPhrase.status + "\n" +
                "❁┊\n" +
                "❁┊⚖️ " + randomPhrase.comment + "\n" +
                "❁┊💰 الرهان: " + betAmount.toLocaleString() + " ج.س\n" +
                "❁┊🔄 النتيجة: تعادل\n" +
                "❁┊\n" +
                "❁┊" + randomPhrase.ending + "\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊💵 رصيدك: " + newMoney.toLocaleString() + " ج.س\n" +
                "❁┊💡 جرب مرة أخرى!\n" +
                "◈ ──────────── ◈";

        } else {
            // خسارة - لا تطابق
            newMoney = userMoney - betAmount;

            const randomPhrase = losePhrases[Math.floor(Math.random() * losePhrases.length)];

            await sh.react("💔");
            message = "◈ ──『 ❀ سلوت - دورا ❀ 』── ◈\n\n" +
                "❁┊👤 اللاعب: " + userName + "\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊🎰 ┃ " + slot1 + " " + slot2 + " " + slot3 + " ┃ 🎰\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊" + randomPhrase.status + "\n" +
                "❁┊\n" +
                "❁┊💔 " + randomPhrase.comment + "\n" +
                "❁┊💰 الرهان: " + betAmount.toLocaleString() + " ج.س\n" +
                "❁┊💸 الخسارة: -" + betAmount.toLocaleString() + " ج.س\n" +
                "❁┊\n" +
                "❁┊" + randomPhrase.ending + "\n" +
                "❁┊━━━━━━━━━━━━━━\n" +
                "❁┊💵 الرصيد السابق: " + userMoney.toLocaleString() + " ج.س\n" +
                "❁┊💰 الرصيد الحالي: " + newMoney.toLocaleString() + " ج.س\n" +
                "❁┊📉 الخسارة: -" + betAmount.toLocaleString() + " ج.س\n" +
                "❁┊🍀 حظ أوفر المرة القادمة!\n" +
                "◈ ──────────── ◈";
        }

        // تحديث الرصيد
        await usersData.set(senderID, newMoney, "money");

        return sh.reply(message);

    } catch (error) {
        console.error("Error in slot game:", error);
        await sh.react("⚠️");
        return sh.reply(
            "◈ ──『 ❀ خطأ ❀ 』── ◈\n\n" +
            "❁┊⚠️ حدث خطأ في اللعبة!\n" +
            "❁┊━━━━━━━━━━━━━━\n" +
            "❁┊📝 الخطأ: " + error.message + "\n" +
            "❁┊💡 حاول مرة أخرى\n" +
            "◈ ──────────── ◈"
        );
    }
}

module.exports = {
    config,
    onPick
};