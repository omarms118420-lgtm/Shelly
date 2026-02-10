module.exports = {
  config: {
    name: "ban_manager",
    Multi: ["ban_manager"],
    author: "GryKJ",
    cooldowns: 5,
    Auth: 2,
    description: "ادارة المستخدمين والغروبات [حظر - فك حظر - بحث]",
    Class: "المطور"
  },

  onPick: async function ({ args, usersData, threadsData, sh, event, command }) {
    const getTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `\( {day}/ \){month}/${year} \( {hours}: \){minutes}:${seconds}`;
    };

    const type = args[0]?.toLowerCase();

    // جزء الغروبات (thread / غروب / مجموعة)
    if (["thread", "غروب", "مجموعة"].includes(command.toLowerCase())) {
      try {
        switch (type) {
          case "ban":
          case "حظر":
          case "بان":
          case "-b": {
            let tid, reason;
            if (!isNaN(args[1])) {
              tid = args[1];
              reason = args.slice(2).join(" ") || "لا يوجد سبب محدد";
            } else {
              tid = event.threadID;
              reason = args.slice(1).join(" ") || "لا يوجد سبب محدد";
            }

            const threadData = await threadsData.get(tid);
            const name = threadData.threadName || "غير متوفر";

            if (threadData.banned?.status) {
              return sh.reply(`الغروب [${tid} | ${name}] محظور بالفعل:\n» السبب: ${threadData.banned.reason}\n» التاريخ: ${threadData.banned.date}`);
            }

            const time = getTime();
            await threadsData.set(tid, {
              banned: {
                status: true,
                reason,
                date: time
              }
            });

            sh.reply(`تم حظر الغروب بنجاح\n[${name} | ${tid}]\n» السبب: ${reason}\n» التاريخ: ${time}`);
            break;
          }

          case "unban":
          case "الغاء":
          case "فك":
          case "-u": {
            let tid = !isNaN(args[1]) ? args[1] : event.threadID;

            const threadData = await threadsData.get(tid);
            const name = threadData.threadName || "غير متوفر";

            if (!threadData.banned?.status) {
              return sh.reply(`الغروب [${tid} | ${name}] غير محظور أصلاً`);
            }

            await threadsData.set(tid, { banned: {} });
            sh.reply(`تم فك الحظر عن الغروب\n[${name} | ${tid}]`);
            break;
          }

          default:
            sh.reply("استخدام خاطئ!\nالأوامر المتاحة: ban أو unban");
        }
      } catch (error) {
        console.error(error);
        sh.reply("حدث خطأ: " + error.message);
      }
      return;
    }

    // جزء المستخدمين (الأمر الرئيسي "المستخدم")
    try {
      switch (type) {
        case "بحث":
        case "find":
        case "search":
        case "-s":
        case "-f": {
          const keyWord = args.slice(1).join(" ");
          if (!keyWord) return sh.reply("أدخل اسم أو كلمة للبحث عنها");

          const allUsers = await usersData.getAll();
          const results = allUsers.filter(u => (u.name || "").toLowerCase().includes(keyWord.toLowerCase()));

          if (results.length === 0) {
            return sh.reply(`❌ لم يتم العثور على أي مستخدم باسم يحتوي على: ${keyWord}`);
          }

          let msg = `🔎 تم العثور على ${results.length} مستخدم:\n\n`;
          results.forEach(user => {
            msg += `╭─ الاسم: ${user.name || "غير معروف"}\n╰─ الآيدي: ${user.userID}\n\n`;
          });

          sh.reply(msg);
          break;
        }

        case "ban":
        case "حظر":
        case "بان":
        case "-b": {
          let uid, reason = "لا يوجد سبب محدد";

          if (event.messageReply) {
            uid = event.messageReply.senderID;
            reason = args.slice(1).join(" ") || reason;
          } else if (Object.keys(event.mentions || {}).length > 0) {
            uid = Object.keys(event.mentions)[0];
            reason = args.slice(1).join(" ").replace(event.mentions[uid], "").trim() || reason;
          } else if (args[1] && !isNaN(args[1])) {
            uid = args[1];
            reason = args.slice(2).join(" ") || reason;
          } else {
            return sh.reply("↻ رد على رسالة أو منشن شخص أو أدخل آيدي المستخدم");
          }

          const userData = await usersData.get(uid);
          const name = userData.name || "غير معروف";

          if (userData.banned?.status) {
            return sh.reply(`المستخدم [${name} | ${uid}] محظور بالفعل`);
          }

          const time = getTime();
          await usersData.set(uid, {
            banned: {
              status: true,
              reason,
              date: time
            }
          });

          sh.reply(`◈ ──『 ❀ رهان ❀ 』── ◈
🔴 خاب 🎰
( {result} ){bonus}

💰 رصيدك: 299,800,034,999,999,270,000 ج.س
📊 نسبة فوز: 33%
🍀 حظك اليوم: 88%
⚡ التحدي: 0/3
🏅 الميداليات: 7
◈ ──────────── ◈`);
          break;
        }

        case "unban":
        case "فك":
        case "الغاء":
        case "-u": {
          let uid;

          if (event.messageReply) {
            uid = event.messageReply.senderID;
          } else if (Object.keys(event.mentions || {}).length > 0) {
            uid = Object.keys(event.mentions)[0];
          } else if (args[1] && !isNaN(args[1])) {
            uid = args[1];
          } else {
            return sh.reply("↻ رد على رسالة أو منشن شخص أو أدخل آيدي");
          }

          const userData = await usersData.get(uid);
          const name = userData.name || "غير معروف";

          if (!userData.banned?.status) {
            return sh.reply(`المستخدم [${name} | ${uid}] غير محظور`);
          }

          await usersData.set(uid, { banned: {} });
          sh.reply(`تم فك الحظر بنجاح عن المستخدم\n[${name} | ${uid}]`);
          break;
        }

        default:
          sh.reply(`الأوامر المتاحة:\n• المستخدم ban @منشن أو رد\n• المستخدم unban\n• المستخدم بحث [اسم]\n• غروب ban [سبب]`);
      }
    } catch (error) {
      console.error(error);
      sh.reply("حدث خطأ غير متوقع: " + error.message);
    }
  }
};