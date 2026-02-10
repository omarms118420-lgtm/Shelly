class Command {
  constructor() {
    this.config = {
      name: "لاست",
      version: "1.0.0",
      Auth: 3, // فقط المطور الرئيسي
      credits: "عمر (معدل بواسطة Grok)",
      description: "عرض قائمة الجروبات اللي البوت فيها مع خيار حظر أو خروج",
      usage: "لاست",
      cooldowns: 15
    };
  }

  async handleReply({ api, event, sh, handleReply, threadsData }) {
    if (String(event.senderID) !== String(handleReply.author)) return;

    const args = event.body.trim().split(/\s+/);
    const action = args[0].toLowerCase();
    const number = parseInt(args[1]);

    if (isNaN(number) || number <= 0 || number > handleReply.groupid.length) {
      return sh.reply("⚠️ رقم الجروب غير صحيح! اختر رقم موجود في القائمة.");
    }

    const threadID = handleReply.groupid[number - 1];

    if (action === "حظر" || action === "بان") {
      await threadsData.set(threadID, true, "banned.status");
      await threadsData.set(threadID, "حظر بواسطة المطور", "banned.reason");
      await threadsData.set(threadID, Date.now(), "banned.date");

      sh.reply(`✅ تم حظر الجروب بنجاح:\n🆔 ${threadID}`);
    }
    else if (action === "خروج" || action === "غادر" || action === "leave") {
      api.removeUserFromGroup(api.getCurrentUserID(), threadID, (err) => {
        if (err) {
          return sh.reply("❌ فشل الخروج (ربما البوت مش أدمن في الجروب).");
        }
        sh.reply(`✅ تم الخروج من الجروب بنجاح:\n🆔 ${threadID}`);
      });
    }
    else {
      sh.reply("⚠️ استخدم: حظر [رقم] أو خروج [رقم]");
    }
  }

  async onPick({ api, event, sh, threadsData }) {
    try {
      sh.reply("⏳ جاري تحميل قائمة الجروبات...");

      const inbox = await api.getThreadList(100, null, ["INBOX"]);
      const groups = inbox.filter(g => g.isGroup && g.isSubscribed);

      if (groups.length === 0) {
        return sh.reply("⚠️ البوت مش موجود في أي جروب حاليًا.");
      }

      const groupList = [];
      const groupIds = [];

      for (const group of groups) {
        try {
          const info = await api.getThreadInfo(group.threadID);
          const threadData = await threadsData.get(group.threadID) || {};

          groupList.push({
            name: group.name || "جروب بدون اسم",
            id: group.threadID,
            members: info.participantIDs?.length || 0,
            status: threadData.banned?.status ? "🔴 محظور" : "🟢 نشط"
          });
          groupIds.push(group.threadID);
        } catch (e) {
          continue;
        }
      }

      groupList.sort((a, b) => b.members - a.members);

      let msg = "🏛️ قائمة الجروبات (" + groupList.length + "):\n\n";
      groupList.forEach((g, i) => {
        msg += `${i + 1}. ${g.name}\n`;
        msg += `   🆔 ${g.id}\n`;
        msg += `   👥 ${g.members} عضو\n`;
        msg += `   ${g.status}\n\n`;
      });

      msg += "📌 رد بـ:\n• حظر [رقم]\n• خروج [رقم]";

      sh.reply(msg, (err, info) => {
        if (!err) {
          global.shelly.Reply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            groupid: groupIds,
            type: "reply"
          });
        }
      });

    } catch (err) {
      console.error(err);
      sh.reply("❌ حدث خطأ أثناء جلب القائمة.");
    }
  }
}

module.exports = new Command();