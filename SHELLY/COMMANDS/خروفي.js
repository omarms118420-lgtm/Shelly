const { Jimp } = require("jimp");

const fs = require("fs");

module.exports.config = {

  name: "خروفي",

  KJ: ["sheep"], 

  Auth: 0,

  Owner: "Gry KJ",

  Info: "رد على لبدك تخليه خروفك",

  Class: "✧༺قائمة_ترفية༻✧"

};

module.exports.onPick = async function({event, sh, usersData}) {

  if(!event.messageReply && Object.keys(event.mentions).length == 0) {

    sh.reply("رد على حد او منشنه عشان علي خروفك");

  } else {

    const target = event.messageReply?.senderID || Object.keys(event.mentions)?.[0];

const background = await Jimp.read("https://i.ibb.co/YThmPKSR/h2-Qh6-Jd-Wqf.jpg");

const image2 = await Jimp.read(await usersData.getAvatarUrl(event.senderID));

const image1 = await Jimp.read(await usersData.getAvatarUrl(target));

image2.resize({ w: 190, h: 190 });

image2.circle();

image1.resize({ w: 190, h: 190 });

image1.circle();

background.composite(image2, 150, 200);

background.composite(image1, 170, 430);

const path = __dirname + "/cache/shhp.jpg";

await background.write(path);

sh.reply({ attachment: fs.createReadStream(path) });

  }

}