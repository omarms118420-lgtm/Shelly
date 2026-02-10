class Command {
  constructor() {
    this.config = {
      name: "رهان",
      aliases: ["bet", "gamble"],
      Auth: 0,
      description: "لعبة الرهان مع إحصائيات وحظ يومي وتحديات"
    };
  }

  async onPick({ event, sh, args, usersData }) {
    try {
      const senderID = event.senderID;
      let userData = await usersData.get(senderID);
      let money = Number(userData.money) || 0;

      // بيانات اللعبة
      let game = userData.data?.game || {
        luckToday: Math.floor(Math.random() * 60) + 20, // 20-80%
        challengeProgress: 0,
        medals: 0,
        totalGames: 0,
        wins: 0
      };

      const bet = parseInt(args[0]);

      if (!bet || bet < 1000) {
        return sh.reply("❌ أدخل مبلغ رهان صحيح (حد أدنى 1,000 ج.س)");
      }
      if (bet > 10000000) {
        return sh.reply("❌ الحد الأقصى 10,000,000 ج.س");
      }
      if (money < bet) {
        return sh.reply(`❌ رصيدك غير كافي!\nرصيدك: ${money.toLocaleString()} ج.س`);
      }

      game.totalGames++;

      // نسب جديدة: خسارة أكبر (55%)، فوز أقل (30%)، تعادل (15%)
      const baseLuck = game.luckToday / 100;
      const winChance = 0.25 + (baseLuck * 0.10); // 25%-35%
      const tieChance = 0.15;
      const loseChance = 1 - winChance - tieChance; // 50%-60%

      const rand = Math.random();

      // مجموعة إيموجيات عشوائية لكل نتيجة
      const winEmojis = ["🍀", "💰", "🎉", "🤑", "✨", "🌟", "🏆", "🔥", "💎", "🚀"];
      const loseEmojis = ["💔", "😭", "😢", "🔥", "🪦", "😞", "💸", "😰", "🥀", "🌧️"];
      const tieEmojis = ["😐", "🤝", "⚖️", "↔️", "🔄", "😑", "🤨", "🫤", "😶", "➖"];

      const getRandomEmojis = (arr) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
      };

      let emojis, resultText, change, color;

      if (rand < winChance) {
        // فوز
        emojis = getRandomEmojis(winEmojis);
        const profit = Math.floor(bet * 1.8);
        money += profit;
        game.wins++;
        game.challengeProgress++;
        resultText = `فوز! 🎉 ربحت ${profit.toLocaleString()} ج.س`;
        color = "🟢";
        change = `+${profit.toLocaleString()}`;
      } else if (rand < winChance + tieChance) {
        // تعادل
        emojis = getRandomEmojis(tieEmojis);
        resultText = "تعادل! لا ربح ولا خسارة";
        color = "🟡";
        change = "0";
      } else {
        // خسارة
        emojis = getRandomEmojis(loseEmojis);
        money -= bet;
        game.challengeProgress = Math.max(0, game.challengeProgress - 1);
        resultText = `خسارة! خسرت ${bet.toLocaleString()} ج.س`;
        color = "🔴";
        change = `-${bet.toLocaleString()}`;
      }

      // مكافأة التحدي (3 فوز متتالي)
      let bonus = "";
      if (game.challengeProgress >= 3) {
        const bonusAmount = 100000;
        money += bonusAmount;
        game.challengeProgress = 0;
        game.medals++;
        bonus = `\n\n🎉 مبروك! أكملت التحدي!\n💰 مكافأة: ${bonusAmount.toLocaleString()} ج.س\n🏅 ميداليات: ${game.medals}`;
      }

      // تحديث نسبة الفوز
      const winRate = game.totalGames > 0 ? Math.round((game.wins / game.totalGames) * 100) : 0;

      // حفظ البيانات
      await usersData.set(senderID, money, "money");
      userData.data = userData.data || {};
      userData.data.game = game;
      await usersData.set(senderID, userData.data, "data");

      // رسالة نهائية
      sh.reply(`◈ ──『 ❀ رهان ❀ 』── ◈
${color} نتيجة الرهان 🎰
「 ${emojis[0]} | ${emojis[1]} | ${emojis[2]} 」

${resultText}
تغيير الرصيد: \( {change} ج.س \){bonus}

💰 رصيدك الآن: ${money.toLocaleString()} ج.س
📊 نسبة الفوز: ${winRate}%
🍀 حظك اليوم: ${game.luckToday}%
⚡ التحدي: ${game.challengeProgress}/3
🏅 الميداليات: ${game.medals}
◈ ──────────── ◈`);

    } catch (err) {
      console.error("خطأ في رهان:", err);
      sh.reply("❌ خطأ في اللعبة، جرب تاني.");
    }
  }
}

module.exports = new Command();