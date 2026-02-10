class SeeDreamEdit {
  constructor(name) {
    this.config = {
      name,

      Multi: ["sd"],

      Auth: 0,

      Owner: "Gry KJ",

      Class: "ذكاء اصطناعي",
    };
  }

  async onPick({ sh, text, event }) {
    if (!text) return sh.reply("اكتب شيءا");

    sh.react("⏱️");

    try {
      if (event?.messageReply?.attachments?.[0]) {
        const urls = event.messageReply.attachments.map((e) => e.url);
        const x = new scraper.prem.SeaDream()
        const y = await x.Gen(text, urls)
        sh.str(
          "تم تعديل صورتك",

          y.images[0].url
        );
      } else {
         const x = new scraper.prem.SeaDream()
        const y = await x.Gen(text)
        sh.str("تم انشاء صورتك", y.images[0].urls);
      }
    } catch (e) {
      console.error("SeeDream Error:", e);
    }
  }
}

module.exports = new SeeDreamEdit("سيدريم");
