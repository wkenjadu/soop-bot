const axios = require("axios");

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

async function test() {
  try {
    console.log("웹훅 테스트 시작...");
    await axios.post(WEBHOOK, {
      content: "🚀 웹훅 연결 성공! 이 메시지가 보이면 설정이 끝난 거예요."
    });
    console.log("전송 성공!");
  } catch (e) {
    console.log("전송 실패! 에러 내용:", e.message);
  }
}

test();
