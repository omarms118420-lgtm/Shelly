module.exports.config = {
  name: "لغز",
  Auth: 0,
  Owner: "Gry KJ",
  Info: "حل اللغز واربح فلوس",
  Class: "الاموال",
  hello: {
    cooldownTime: 1800000  // 30 دقيقة
  }
};

module.exports.lang = {
  "ar": {
    "cooldown": "لقد حليت لغز",
    "rewarded": "لقد حصلت على: %2$",
  }
};

// قائمة الألغاز الكاملة (الأصلية + المضحكة المترجمة + الإضافية)
const riddles = [
  // الألغاز الأصلية (اللي كانت موجودة في الكود الأول)
  {
    question: "شيء كلما تحرك خطوة فقد شيئاً من ذيله فما هو؟",
    answer: "إبرة الخياطة",
    reward: 3000
  },
  {
    question: "من هو الشخص الذي مات دون أن يولد؟",
    answer: "آدم",
    reward: 2500
  },
  {
    question: "ماهو الشيء الذي يجري لكنه لا يستطيع المشي؟",
    answer: "الماء",
    reward: 2000
  },
  {
    question: "ما هو الشيء الذي يحمل طعامه فوق رأسه، فإذا مشى أكل منه وإذا سكن غطى رأسه ونام؟",
    answer: "قلم الحبر",
    reward: 3500
  },
  {
    question: "شيء يستفيد من رأسه الإنسان ويستفيد من آخره الحيوان فما هو؟",
    answer: "القمح",
    reward: 4000
  },
  {
    question: "شيء صاف كالماء ومولود في النار وإذا مات استقر على الأرض؟",
    answer: "الزجاج",
    reward: 4500
  },
  {
    question: "شيء نراه ولا نستطيع لمسه، أول حروفه شيء يقتل وآخر حروفه شيء يشرب؟",
    answer: "السماء",
    reward: 3500
  },
  {
    question: "شيء إذا وضعناه في الثلاجة لا يبرد فما هو؟",
    answer: "الفلفل الحار",
    reward: 2500
  },
  {
    question: "شيء له أوراق لكنه ليس نبات، وله جلد لكنه ليس حيوان، لديه علم لكنه ليس إنسان فما هو؟",
    answer: "الكتاب",
    reward: 3000
  },
  {
    question: "ما هو الشيء الذي ترميه كلما احتجت إليه؟",
    answer: "شبكة الصيد",
    reward: 2800
  },
  {
    question: "شيء إذا سقط على رأسك لا يجرحك فما هو؟",
    answer: "المطر",
    reward: 2000
  },
  {
    question: "شيء تحمله وفي نفس الوقت يمكنه حملك؟",
    answer: "الحذاء",
    reward: 2700
  },
  {
    question: "شيء إذا وقفنا أمامه وبكينا فإنه يبكي وإذا ضحكنا يضحك؟",
    answer: "المرآة",
    reward: 2200
  },
  {
    question: "من هو الشخص الوحيد الذي يجلس أمام الملوك والرؤساء؟",
    answer: "السائق",
    reward: 3500
  },
  {
    question: "ما هو الشيء الذي يقول الصدق دائماً لكنه إذا جاع كذب؟",
    answer: "الساعة",
    reward: 4000
  },
  {
    question: "ما هو الشيء الذي يكون أخضر في الأرض، وأسود في السوق، وأحمر في البيت؟",
    answer: "الشاي",
    reward: 3000
  },
  {
    question: "ما هو المخلوق الذي لا ينام إلا مرتدياً لحذائه؟",
    answer: "الحصان",
    reward: 2800
  },
  {
    question: "لوالد أحمد ثلاثة أبناء هم: محمد، عمر، فما اسم الابن الثالث؟",
    answer: "أحمد",
    reward: 3500
  },
  {
    question: "ما هو الشيء الذي يدور حول البيت دون أن يتحرك؟",
    answer: "الجدار",
    reward: 2500
  },
  {
    question: "لها رقبة وليس لها رأس فما هي؟",
    answer: "القنينة",
    reward: 2300
  },
  {
    question: "ما هو الشيء الذي بالصيف يحميك وبالشتاء يدفيك؟",
    answer: "الشجرة",
    reward: 3000
  },
  {
    question: "ما هو القفص الذي لا تستطيع حبس أي حيوان فيه مهما كان صغيراً؟",
    answer: "القفص الصدري",
    reward: 4500
  },
  {
    question: "كله ثقوب ومع ذلك يستطيع حفظ الماء في داخله فما هو؟",
    answer: "الإسفنج",
    reward: 3200
  },
  {
    question: "ما هو الشيء الذي يكون طويلاً حينما يكون جديداً، وقصيراً حينما يصبح قديماً؟",
    answer: "الشمعة",
    reward: 2800
  },
  {
    question: "إذا دخل الماء لا يبتل وإذا انقطع عنا بحثنا فوراً عن حل فما هو؟",
    answer: "الضوء",
    reward: 3500
  },
  {
    question: "عندي فروع، ولكن ليس لي جذع أو أوراق، فمن أنا؟",
    answer: "البنك",
    reward: 4000
  },
  {
    question: "فتاة صغيرة اشترت 10 بيضات، وخلال عودتها للمنزل، انكسر كل البيض باستثناء ثلاثة، فكم عدد البيضات المتبقية دون كسر؟",
    answer: "ثلاثة",
    reward: 3500
  },
  {
    question: "شيء يشم من اللسان وليس له أذنان ويخاف منه الإنسان فما هو؟",
    answer: "الثعبان",
    reward: 2500
  },
  {
    question: "ما الذي يمكنه أن يملأ الغرفة دون أن يشغل حيزاً؟",
    answer: "النور",
    reward: 3000
  },
  {
    question: "له إبهام وأربعة أصابع وليس اليد فما هو؟",
    answer: "القفاز",
    reward: 2700
  },
  {
    question: "كم حرفاً يوجد في الأبجدية؟",
    answer: "ثمانية",
    reward: 3500
  },
  {
    question: "من هو الخال الوحيد لأولاد عمتك؟",
    answer: "والدك",
    reward: 3000
  },
  {
    question: "ما هو الشيء الذي يوصلك من بيتك إلى عملك دون أن يتحرك؟",
    answer: "الطريق",
    reward: 2500
  },
  {
    question: "بيت بلا أبواب ولا نوافذ، فما هو؟",
    answer: "بيت الشعر",
    reward: 3500
  },
  {
    question: "ما هو الشيء الموجود في منتصف مكة؟",
    answer: "حرف الكاف",
    reward: 4000
  },
  {
    question: "ما هو الشيء الذي تأكل منه، لكن لا يمكنك أن تأكله؟",
    answer: "الطبق",
    reward: 2300
  },
  {
    question: "اسم شهر إذا حذفت أوله أصبح اسم فاكهة؟",
    answer: "تموز",
    reward: 3500
  },
  {
    question: "ما هو الشيء الذي له أسنان ولا يعض؟",
    answer: "المشط",
    reward: 2000
  },
  {
    question: "شيء نراه في السماء ليلاً، وليس شمساً؟",
    answer: "القمر",
    reward: 1800
  },
  {
    question: "ما هو الشيء الذي يسمع بدون أذن ويتكلم بدون لسان؟",
    answer: "الهاتف",
    reward: 2500
  },
  {
    question: "أنا أبيض ولكنني أذوب عندما أتعرض للشمس، من أكون؟",
    answer: "الثلج",
    reward: 2200
  },
  {
    question: "ما هو الشيء الذي يُكسر بمجرد نطقه؟",
    answer: "الصمت",
    reward: 3500
  },
  {
    question: "ما الذي يمكنك أن تمسكه بيدك اليمنى ولكن لا يمكنك إمساكه بيدك اليسرى؟",
    answer: "كوعك الأيسر",
    reward: 4000
  },
  {
    question: "ما هو الشيء الذي لديه أربعة أرجل ولا يمشي؟",
    answer: "الكرسي",
    reward: 2000
  },
  {
    question: "يمشي بلا رجلين ولا يدخل إلا بالأذنين؟",
    answer: "الصوت",
    reward: 2500
  },
  {
    question: "شيء إذا أخذت منه زاد، وإذا أعطيته نقص، ما هو؟",
    answer: "الحفرة",
    reward: 3500
  },
  {
    question: "شيء كلما زاد نقص؟",
    answer: "العمر",
    reward: 3000
  },
  {
    question: "شيء له رقبة ولا يملك رأساً، ما هو؟",
    answer: "الزجاجة",
    reward: 2300
  },
  {
    question: "أنا موجود فقط عندما تضيء الضوء، من أكون؟",
    answer: "الظل",
    reward: 2700
  },
  {
    question: "ماذا يوجد في نهاية كل شيء؟",
    answer: "حرف الهمزة",
    reward: 3500
  },
  {
    question: "ما هو حجم الفيل لكنه لا يزن شيئاً؟",
    answer: "ظل الفيل",
    reward: 3000
  },

  // الألغاز المضحكة الجديدة (مترجمة للعربية مع الحفاظ على الفكاهة)
  {
    question: "ماذا تسمي ديناصور ذو مفردات واسعة؟",
    answer: "قاموس المرادفات",
    reward: 3500
  },
  {
    question: "ما الذي تحصل عليه عندما تعبر رجل ثلج ومصاص دماء؟",
    answer: "قضمة البرد",
    reward: 3000
  },
  {
    question: "ماذا تسمي دب بلا أسنان؟",
    answer: "دب علكة",
    reward: 2800
  },
  {
    question: "ماذا تسمي سمكة بلا عيون؟",
    answer: "fsh",
    reward: 2500
  },
  {
    question: "لماذا ذهبت البقرة إلى الفضاء؟",
    answer: "لترى القمر moo",
    reward: 3200
  },
  {
    question: "لماذا انفصل الفنان عن الحامل؟",
    answer: "لأنهم لا يستطيعون تصور المستقبل معاً",
    reward: 3500
  },
  {
    question: "ما نوع الموسيقى المفضل للذكاء الاصطناعي؟",
    answer: "الإيقاعات الخوارزمية",
    reward: 4000
  },
  {
    question: "لماذا تحولت الطماطم إلى اللون الأحمر؟",
    answer: "لأنها رأت تتبيلة السلطة",
    reward: 3000
  },
  {
    question: "لماذا أفلس البستاني؟",
    answer: "لأنه لم يستطع تدبير أموره بجذوره",
    reward: 2800
  },
  {
    question: "ما الحلوى المفضلة لإيما واتسون؟",
    answer: "بودينغ إكسبكتو",
    reward: 3500
  },
  {
    question: "لماذا ذهب الخبز إلى العلاج؟",
    answer: "كان يعاني من مشاكل الغلوتين",
    reward: 3000
  },
  {
    question: "لماذا لا يروي البيض النكات؟",
    answer: "لأنه قد يتصدع",
    reward: 2500
  },
  {
    question: "لماذا كان الرقم 6 خائفاً من 7؟",
    answer: "لأن 7 أكل 8 و9",
    reward: 4000
  },
  {
    question: "ماذا تسمي السباغيتي المزيفة؟",
    answer: "إمباستا",
    reward: 3500
  },
  {
    question: "لماذا لا تقاتل الهياكل العظمية بعضها؟",
    answer: "ليس لديهم الشجاعة",
    reward: 3000
  },
  {
    question: "ماذا تسمي رجل ثلج بعضلات؟",
    answer: "رجل ثلج بطن",
    reward: 2800
  },
  {
    question: "ما الذي له مفاتيح لكنه لا يفتح أقفالاً؟",
    answer: "البيانو",
    reward: 2500
  },
  {
    question: "ما الذي له قلب لكنه لا ينبض؟",
    answer: "الخرشوف",
    reward: 3000
  },
  {
    question: "ما الذي له عين لكنه لا يرى؟",
    answer: "الإبرة",
    reward: 2200
  },
  {
    question: "ما الذي له رأس وذيل لكنه ليس حيواناً؟",
    answer: "العملة المعدنية",
    reward: 2500
  },
  {
    question: "ما الذي به مدن وغابات وأنهار لكن بدون منازل أو أشجار أو ماء؟",
    answer: "الخريطة",
    reward: 3500
  },

  // ألغاز إضافية عربية مضحكة وسهلة
  {
    question: "لماذا لا يذهب الهيكل العظمي إلى الحفلات؟",
    answer: "لأنه لا يملك قلباً ليرقص",
    reward: 3000
  },
  {
    question: "ماذا يقول الجدار للجدار الآخر؟",
    answer: "سنلتقي في الزاوية",
    reward: 2500
  },
  {
    question: "لماذا لا ينام الكتاب؟",
    answer: "لأنه مليء بالأفكار",
    reward: 2800
  },
  {
    question: "ما الشيء الذي يُضرب ولا يتألم؟",
    answer: "الدف",
    reward: 2200
  }
];

// تخزين مؤقت للألغاز النشطة
const activeRiddles = new Map();

module.exports.onPick = async ({ event, api, sh, usersData }) => {
  const { threadID, messageID, senderID } = event;

  const cooldown = this.config.hello.cooldownTime;
  let data = (await usersData.get(senderID)).data || {};
  
  // فحص الكول داون
  if (typeof data !== "undefined" && data.riddleTime && cooldown - (Date.now() - data.riddleTime) > 0) {
    const time = cooldown - (Date.now() - data.riddleTime);
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);

    return sh.reply(`◈ ──『 ❀ لغز دورا ❀ 』── ◈
❁┊⏰ لقد حليت لغز مؤخراً
❁┊⌛ انتظر: ${minutes} دقيقة و ${seconds} ثانية
❁┊🔄 لحل لغز جديد
◈ ──────────── ◈`);
  }

  // اختيار لغز عشوائي
  const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
  
  // حفظ اللغز النشط
  activeRiddles.set(senderID, {
    riddle: randomRiddle,
    startTime: Date.now(),
    threadID,
    messageID
  });

  // إرسال اللغز
  const sent = await sh.reply(`◈ ──『 ❀ لغز دورا ❀ 』── ◈
❁┊🧩 لغز جديد!

❁┊❓ ${randomRiddle.question}

❁┊⏱️ لديك 30 ثانية للإجابة
❁┊💰 الجائزة: ${randomRiddle.reward.toLocaleString()} جنيه

❁┊📝 رد على هذه الرسالة بالإجابة الصحيحة
◈ ──────────── ◈`);

  if (sent && sent.messageID) {
    global.shelly.Reply.push({
      name: "لغز",
      ID: sent.messageID,
      author: senderID,
      type: "riddle"
    });
  }

  // انتهاء الوقت بعد 30 ثانية
  setTimeout(() => {
    if (activeRiddles.has(senderID)) {
      const riddleData = activeRiddles.get(senderID);
      if (riddleData.riddle === randomRiddle) {
        activeRiddles.delete(senderID);
        sh.reply(`◈ ──『 ❀ لغز دورا ❀ 』── ◈
❁┊⏰ انتهى الوقت!
❁┊❌ الإجابة الصحيحة كانت: ${randomRiddle.answer}
❁┊😔 حظ أوفر المرة القادمة!
◈ ──────────── ◈`);
      }
    }
  }, 30000);
};

module.exports.Reply = async ({ event, api, sh, usersData, Reply }) => {
  const { senderID, body } = event;
  
  if (Reply.type !== "riddle" || Reply.author !== senderID) return;
  
  if (!activeRiddles.has(senderID)) {
    return sh.reply(`◈ ──『 ❀ لغز دورا ❀ 』── ◈
❁┊⚠️ لا يوجد لغز نشط حالياً
❁┊💡 اكتب "لغز" لبدء لغز جديد
◈ ──────────── ◈`);
  }

  const riddleData = activeRiddles.get(senderID);
  const timePassed = Date.now() - riddleData.startTime;

  if (timePassed > 30000) {
    activeRiddles.delete(senderID);
    return sh.reply(`◈ ──『 ❀ لغز دورا ❀ 』── ◈
❁┊⏰ انتهى الوقت!
❁┊❌ الإجابة الصحيحة: ${riddleData.riddle.answer}
◈ ──────────── ◈`);
  }

  const userAnswer = body.trim().toLowerCase();
  const correctAnswer = riddleData.riddle.answer.toLowerCase();

  if (userAnswer === correctAnswer || userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer)) {
    activeRiddles.delete(senderID);
    
    const reward = riddleData.riddle.reward;
    const money = (await usersData.get(senderID)).money || 0;
    await usersData.set(senderID, money + reward, "money");
    
    let data = (await usersData.get(senderID)).data || {};
    data.riddleTime = Date.now();
    await usersData.set(senderID, data, "data");

    return sh.reply(`◈ ──『 ❀ لغز دورا ❀ 』── ◈
❁┊✅ إجابة صحيحة! 🎉
❁┊💰 ربحت: ${reward.toLocaleString()} جنيه
❁┊⏱️ أجبت في: ${(timePassed / 1000).toFixed(1)} ثانية
❁┊🧠 ممتاز جداً!
◈ ──────────── ◈`);
  } else {
    const timeLeft = (30 - timePassed / 1000).toFixed(0);
    return sh.reply(`◈ ──『 ❀ لغز دورا ❀ 』── ◈
❁┊❌ إجابة خاطئة!
❁┊⏱️ الوقت المتبقي: ${timeLeft} ثانية
❁┊🔄 حاول مرة أخرى
◈ ──────────── ◈`);
  }
};