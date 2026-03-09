const axios = require("axios");
const fs = require("fs");

// 보안을 위해 GitHub Secrets에 등록한 변수를 가져옵니다.
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const BJ_ID = "breezy25";
const BJ_NAME = "숩니찡";
const STATUS_FILE = "status.txt";

async function checkStream() {
  try {
    // 이전 상태 읽기
    let wasLive = false;
    if (fs.existsSync(STATUS_FILE)) {
      wasLive = fs.readFileSync(STATUS_FILE, "utf8").trim() === "true";
    }

    const res = await axios.get(
      `https://bjapi.afreecatv.com/api/${BJ_ID}/station`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const isLive = res.data?.broad?.is_onair === "Y";

    // 방송 시작 시에만 알림 전송
    if (isLive && !wasLive) {
      const title = res.data.broad.broad_title;
      const thumbnail = `https://liveimg.afreecatv.com/${BJ_ID}.jpg`;

      await axios.post(WEBHOOK, {
        content: "@everyone 🔴 방송 시작!",
        embeds: [{
          title: `${BJ_NAME} 방송 시작!`,
          description: `📺 **${title}**`,
          url: `https://play.sooplive.co.kr/${BJ_ID}`,
          image: { url: thumbnail },
          color: 16711680
        }]
      });
      console.log("알림 전송 완료");
    }

    // 현재 상태 저장
    fs.writeFileSync(STATUS_FILE, isLive.toString());
  } catch (e) {
    console.log("체크 실패:", e.message);
  }
}

checkStream();
