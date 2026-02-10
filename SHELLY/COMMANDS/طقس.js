const axios = require("axios");

module.exports = {
  config: {
    name: "طقس",
    Multi: ["weather", "الجو", "حالة الجو", "درجة الحرارة"],
    Auth: 0,
    Owner: "Shelly",
    Info: "معرفة حالة الطقس لأي مدينة",
    Class: "أدوات",
    How: "طقس [اسم المدينة]",
    Time: 5,
  },

  onPick: async function({ api, event, args, sh }) {
    const city = args.join(" ");
    
    if (!city) {
      return sh.reply("⚠️ الرجاء كتابة اسم المدينة!\n\n📝 مثال: طقس الرياض");
    }

    try {
      const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      const data = response.data;
      
      const current = data.current_condition[0];
      const location = data.nearest_area[0];
      
      const weatherEmojis = {
        "Sunny": "☀️",
        "Clear": "🌙",
        "Partly cloudy": "⛅",
        "Cloudy": "☁️",
        "Overcast": "☁️",
        "Mist": "🌫️",
        "Fog": "🌫️",
        "Light rain": "🌧️",
        "Rain": "🌧️",
        "Heavy rain": "⛈️",
        "Thunder": "⛈️",
        "Snow": "❄️",
        "Blizzard": "🌨️"
      };
      
      const desc = current.weatherDesc[0].value;
      const emoji = weatherEmojis[desc] || "🌡️";
      
      const msg = `${emoji} ═══『 حالة الطقس 』═══ ${emoji}

📍 المدينة: ${location.areaName[0].value}
🏳️ الدولة: ${location.country[0].value}

🌡️ درجة الحرارة: ${current.temp_C}°C
🤔 تحس إنها: ${current.FeelsLikeC}°C
💧 الرطوبة: ${current.humidity}%
💨 سرعة الرياح: ${current.windspeedKmph} كم/ساعة
🧭 اتجاه الرياح: ${current.winddir16Point}
☁️ الحالة: ${desc}
👁️ مدى الرؤية: ${current.visibility} كم

⏰ آخر تحديث: الآن`;

      return sh.reply(msg);
    } catch (error) {
      return sh.reply(`❌ لم أتمكن من العثور على المدينة "${city}"\n\n💡 تأكد من كتابة اسم المدينة بشكل صحيح!`);
    }
  }
};
