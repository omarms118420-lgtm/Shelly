let wallpapers = [
  "https://wallpapers-clan.com/wp-content/uploads/2024/04/beautiful-anime-girl-blue-butterflies-desktop-wallpaper-cover.jpg",
  "https://wallpapers-clan.com/wp-content/uploads/2024/02/anime-girl-with-flowers-butterflies-desktop-wallpaper-preview.jpg",
  "https://wallpapers-clan.com/wp-content/uploads/2024/08/glitter-dream-pastel-anime-girl-desktop-wallpaper-cover.jpg",
  "https://wallpapers-clan.com/wp-content/uploads/2024/03/beautiful-anime-girl-with-rainbow-eyes-desktop-wallpaper-cover.jpg"
];

const axios = require("axios");

module.exports.config = {
  name: "اوامر",
  Multi: ["Menu", "help", "الاوامر"],
  Auth: 0,
  Hide: true,
  Owner: "حمودي",
  Info: "قائمة الاوامر",
  Class: "system",
  How: "[Tên module]",
  Time: 1,
};

module.exports.onPick = async function ({ threadsData, usersData, event, sh: Message, Auth, args }) {
  const { cmds } = global.shelly;
  const { threadID, messageID } = event;
  const randWall = wallpapers[Math.floor(Math.random() * wallpapers.length)];
  const command = cmds.get((args[0] || "").toLowerCase());
  const prefix = global.Mods.getPrefix(event.threadID);

  if (!command) {
    await Message.reply("🤖🔍 هل ترون الاوامر؟ أنا لا أراها... إذا رأيتم الاوامر قولو: اوامر📖");
    await new Promise(resolve => setTimeout(resolve, 2000));
    await Message.reply("✨ أحسنتم 🎉✨");
    await new Promise(resolve => setTimeout(resolve, 1000));

    const objInfo = {};
    const arrayInfo = [];
    const page = parseInt(args[0]) || 1;
    const numberOfOnePage = 10;

    let msg = "";

    for (var [name, value] of cmds) {
      let c = shelly.cmds.get(name);
      if (c.config.Hide && c.config.Hide == true) continue;

      let me = shelly.cmds.get(name);
      arrayInfo.push(me.config.name);

      if (objInfo[me.config.Class]) objInfo[me.config.Class].push(me.config.name);
      else {
        objInfo[me.config.Class] = [];
        objInfo[me.config.Class].push(me.config.name);
      }
    }

    // ترتيب الأوامر
    const entries = Object.entries(objInfo);
    let counter = 1;
    let allCommands = [];

    entries.forEach(([className, namesArray]) => {
      if (namesArray.length > 0) {
        allCommands.push(`◯ ${className} :`);
        namesArray.forEach((cmdName) => {
          allCommands.push(`${counter}👑${cmdName}`);
          counter++;
        });
        allCommands.push(`———————————————`);
      }
    });

    // تقسيم الصفحات
    const totalPages = Math.ceil(allCommands.length / numberOfOnePage);
    const start = (page - 1) * numberOfOnePage;
    const end = start + numberOfOnePage;
    const pageCommands = allCommands.slice(start, end).join("\n");

    const siu = `◈ ───『قائمة الاوامر』─── ◈`;
    const text = `\n◈ ─────────────── ◈\nعدد الاوامر هو: ${arrayInfo.length}\nالصفحة ${page}/${totalPages}\nاستمتع مع Dora`;

    const footer = `\n\nتم تطويره بواسطة حمودي و 🇲🇦 Gry 🇲🇦\n👑𝒟𝓸𝓻𝓪 𝓑𝓸𝒕👑`;

    let hello = siu + "\n\n" + pageCommands + text + footer;

    return Message.reply({
      body: hello,
      attachment: (await axios.get(randWall, { responseType: "stream" })).data,
    });
  }

  const infos = command;

  const msg = `
⚝ اسم الأمر ⚝⋆˚ ⬷  ☂︎ ${infos.config.name} ☂︎
⚝ الوصف ⚝ ⋆˚ ⬷ ☂︎ ${infos.config.Info || "مافي وصف"} ☂︎
⚝ اسماء اخرى ⚝⋆˚ ⬷  ☂︎ ${infos.config.Multi.join(", ") || "غير متوفر"} ☂︎
⚝ صانعه ⚝ ⋆˚ ⬷ ☂︎ ${infos.config.Owner || "حمودي"} ☂︎
⚝ تصنيفه  ⚝ ⋆˚ ⬷ ☂︎ ${infos.config.Class || "أدوات"} ☂︎
⚝ كيفية الاستعمال ⚝ ⋆˚ ⬷ ☂︎ ${infos.config.How || "غير متوفر"} ☂︎
  `;
  return Message.reply({ body: msg });
};