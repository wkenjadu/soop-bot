const axios = require("axios");

const WEBHOOK = "https://discord.com/api/webhooks/1480569648645931051/MxqtMCZoH5Rcf-VzM-dY2_tLJYU-02Dl8nB9-Rrmfn7Kanw9DgXF4wM1EjDsppo7Axjg";
const BJ_ID = "breezy25";
const BJ_NAME = "숩니찡";

let wasLive = false;

async function checkStream() {
  try {

const res = await axios.get(
  `https://bjapi.afreecatv.com/api/${BJ_ID}/station`,
  {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  }
);

const data = res.data;
const live = data?.broad?.is_onair === "Y";

    if (live && !wasLive) {

      const title = data.broad.broad_title;

      const thumbnail =
        `https://liveimg.afreecatv.com/${BJ_ID}.jpg`;

      await axios.post(WEBHOOK, {

        content: "@everyone 🔴 방송 시작!",

        embeds: [
          {
            title: `${BJ_NAME} 방송 시작!`,
            description: `📺 **${title}**`,
            url: `https://play.sooplive.co.kr/${BJ_ID}`,
            image: { url: thumbnail },
            color: 16711680
          }
        ]

      });

      console.log("방송 알림 보냄");

    }

    wasLive = live;

  } catch (e) {
    console.log("체크 실패", e.message);
  }
}

checkStream();
setInterval(checkStream, 30000);