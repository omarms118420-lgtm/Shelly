function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Money {
  constructor() {
    Object.assign(this, {
      config: {
        name: "رصيدي",
        Auth: 0,
        Owner: "عبدالرحمن",
        Info: "تعرف رصيدك",
        Class: "الاموال",
      }
    });
  }

  async onPick({ api, event, args, sh: black, usersData }) {
    const tat = await usersData.get(event.senderID);
    if (!tat.name || !tat.gender) {
      await usersData.create(event.senderID);
    }

    const name = await usersData.getName(event.senderID);
    const data = await usersData.get(event.senderID);

    const gender = {
      1: "بنت 👩",
      2: "ولد 👨",
      3: "🤡🏳️‍🌈",
      4: "🤡🏳️‍🌈",
      5: "🤡🏳️‍🌈",
      6: "🤡🏳️‍🌈",
    };

    black.reply(
`◆ ──『 رصيد - دورا 』── ◆
✦│ يا زول خلينا نشوف حسابك 😄
✦│ الاسم: ${name}
✦│ جاري التحميل...
◆ ───────────── ◆`,
      async (err, hi) => {
        const { messageID } = hi;

        await delay(1500);
        api.editMessage(
`◆ ──『 رصيد - دورا 』── ◆
✦│ 👤 اسمك: ${name}
✦│ 🆔 ايديك: ${event.senderID}
✦│ 💰 قروشك: انتظر شوية...
✦│ 🧍 جنسك: انتظر...
◆ ───────────── ◆`,
          messageID
        );

        await delay(1500);
        api.editMessage(
`◆ ──『 رصيد - دورا 』── ◆
✦│ 👤 اسمك: ${name}
✦│ 🆔 ايديك: ${event.senderID}
✦│ 💰 قروشك: ${data.money} جنيه
✦│ 🧍 جنسك: ${gender[data.gender] || "غير معروف"}
◆ ───────────── ◆`,
          messageID
        );
      }
    );
  }
}

module.exports = new Money();