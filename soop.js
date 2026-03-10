const axios = require("axios");
const fs = require("fs");

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const BJ_ID = "breezy25";
const BJ_NAME = "숩니찡";
const STATUS_FILE = "status.txt";

async function checkStream() {
  try {
    // 1. 이전 상태 읽기
    let wasLive = false;
    if (fs.existsSync(STATUS_FILE)) {
      wasLive = fs.readFileSync(STATUS_FILE, "utf8").trim() === "true";
    }

    // 2. SOOP API 호출 (헤더 보강)
    const res = await axios.get(
      `https://bjapi.afreecatv.com/api/${BJ_ID}/station`,
      { 
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": `https://ch.sooplive.co.kr/${BJ_ID}`
        } 
      }
    );

    // 3. 방송 상태 판별 (여러 경로 확인)
    const broadData = res.data?.broad;
    const isLive = broadData && (broadData.is_onair === "Y" || broadData.broad_no !== undefined);
    
    console.log(`[체크 결과] 현재 방송 여부: ${isLive ? "ON" : "OFF"}`);

    // 4. 알림 전송 조건: 현재 방송 중인데, 이전 기록은 '방종'일 때
    if (isLive && !wasLive) {
      const title = broadData.broad_title || "방송 중입니다!";
      const thumbnail = `https://liveimg.afreecatv.com/m/${broadData.broad_no}.jpg?${Date.now()}`;

await axios.post(WEBHOOK, {
        content: "@everyone 🔴 실시간 스트리밍 ON",
        embeds: [{
          title: `🔗 방송 보러가기 바로가기`, // 제목을 버튼 문구처럼 변경
          description: `📺 **${title}**`,
          url: `https://play.sooplive.co.kr/${BJ_ID}`, // 제목을 누르면 바로 이동
          image: { url: thumbnail },
          color: 0xD59EE8,
          fields: [
            {
              name: "\u200b", // 빈 공간을 만들어 구분선 효과
              value: `[**▶️ 방송국 바로가기 클릭**](https://play.sooplive.co.kr/${BJ_ID})`, 
              inline: false
            }
          ],
          footer: { text: "SOOP Live Checker" },
          timestamp: new Date()
        }]
      });
      console.log("✅ 디스코드 알림 전송 완료!");
    }

    // 5. 현재 상태 저장
    fs.writeFileSync(STATUS_FILE, isLive.toString());
    
  } catch (e) {
    console.log("❌ 체크 실패 에러:", e.message);
  }
}

checkStream();


