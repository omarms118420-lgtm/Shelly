const axios = require('axios');
const crypto = require("crypto");

// دالة بدء جلسة استخراج الـ prompt
async function startSession(imgUrl) {
  let sessionID = crypto.randomBytes(4).toString("hex").toUpperCase();
  let data = JSON.stringify({
    data: [
      null,
      null,
      imgUrl,
      0.3,
      0.85,
      "threshold",
      25,
      10,
      false,
      false
    ],
    event_data: null,
    fn_index: 2,
    trigger_id: 26,
    session_hash: sessionID
  });

  let config = {
    method: 'POST',
    url: 'https://pixai-labs-pixai-tagger-demo.hf.space/gradio_api/queue/join?__theme=system',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'application/json',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'x-zerogpu-uuid': crypto.randomBytes(4).toString("hex").toUpperCase(),
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.7',
      'origin': 'https://pixai-labs-pixai-tagger-demo.hf.space',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'sec-fetch-storage-access': 'none',
      'referer': 'https://pixai-labs-pixai-tagger-demo.hf.space/?__theme=system',
      'priority': 'u=1, i'
    },
    data: data,
    timeout: 30000
  };

  return {
    data: (await axios.request(config)).data,
    sessionID
  };
}

// دالة الحصول على النتيجة
async function getResult(sessionID) {
  let config = {
    method: 'GET',
    url: 'https://pixai-labs-pixai-tagger-demo.hf.space/gradio_api/queue/data?session_hash=' + sessionID,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept': 'text/event-stream',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'content-type': 'application/json',
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.7',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'sec-fetch-storage-access': 'none',
      'referer': 'https://pixai-labs-pixai-tagger-demo.hf.space/?__theme=system',
      'priority': 'u=1, i'
    },
    timeout: 60000
  };

  return (await axios.request(config)).data;
}

// دالة استخراج الـ prompt من الصورة
async function extractPrompt(imageUrl) {
  try {
    const session = await startSession(imageUrl);
    
    // انتظار قليل للمعالجة
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const data = await getResult(session.sessionID);
    
    // البحث عن الـ prompt في النتيجة
    const match = data.match(/"output":\{"data":\["([^"]+)","([^"]+)","([^"]+)"/);
    
    if (match) {
      const prompt = match[1];            
      const character = (match[2] && match[2] !== '—') ? match[2] : null; 
      const series = (match[3] && match[3] !== '—') ? match[3] : null; 

      if (character && series) {
        return `${series}, ${character}, ${prompt}`;
      } else if (character) {
        return `${character}, ${prompt}`;
      } else if (series) {
        return `${series}, ${prompt}`;
      } else {
        return prompt;
      }
    }
    
    // محاولة patterns أخرى
    const alternativePatterns = [
      /"data":\["([^"]+)"/,
      /"text":"([^"]+)"/,
      /"prompt":"([^"]+)"/
    ];
    
    for (let pattern of alternativePatterns) {
      const altMatch = data.match(pattern);
      if (altMatch && altMatch[1]) {
        return altMatch[1];
      }
    }
    
    return null;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  config: {
    name: 'برومبت',
    Multi: ['prompt'],
    version: '1.0.0',
    author: 'Assistant',
    countDown: 15,
    Auth: 0,
    shortDescription: 'استخراج الـ prompt من الصور',
    longDescription: 'يقوم باستخراج الـ prompt المستخدم لتوليد الصورة باستخدام الذكاء الاصطناعي',
    category: 'الذكاء الصناعي',
    guide: '{pn} [رد على صورة] - لاستخراج الـ prompt من الصورة'
  },

  onPick: async function ({ api, event, sh }) {
    try {
      // إضافة reaction ساعة رملية عند البداية
      sh.react("⏳");
      
      let imageUrl = null;
      
      // فحص إذا كانت الرسالة رد على رسالة تحتوي على صورة
      if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const imageAttachment = event.messageReply.attachments.find(att => {
          return att.type === "photo" || att.type === "image" || 
                 (att.url && att.url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i));
        });
        
        if (imageAttachment && imageAttachment.url) {
          imageUrl = imageAttachment.url;
        }
      }
      
      // فحص المرفقات في الرسالة الحالية
      if (!imageUrl && event.attachments && event.attachments.length > 0) {
        const imageAttachment = event.attachments.find(att => {
          return att.type === "photo" || att.type === "image" ||
                 (att.url && att.url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i));
        });
        
        if (imageAttachment && imageAttachment.url) {
          imageUrl = imageAttachment.url;
        }
      }
      
      if (!imageUrl) {
        sh.react("❌");
        return sh.reply('يرجى الرد على رسالة تحتوي على صورة لاستخراج الـ prompt منها');
      }
      
      // استخراج الـ prompt
      const extractedPrompt = await extractPrompt(imageUrl);
      
      if (extractedPrompt) {
        // إرسال الـ prompt بدون أي زخرفة
        sh.reply(extractedPrompt);
        sh.react("✅");
      } else {
        sh.reply('لم يتم العثور على prompt في هذه الصورة');
        sh.react("❌");
      }
      
    } catch (error) {
      sh.reply(`حدث خطأ أثناء معالجة الصورة`);
      sh.react("❌");
    }
  }
};