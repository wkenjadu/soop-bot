const axios = require("axios");
const fs = require("fs");

// ===== 설정 =====
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const BJ_ID = "breezy25";
const BJ_NAME = "숩니찡";
const STATUS_FILE = "status.txt";

console.log("파일 실행 시작");
console.log("TOKEN 있음?", !!TOKEN);
console.log("CHANNEL_ID:", CHANNEL_ID);

// ===== 디스코드 클라이언트 =====
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("clientReady", async () => {
  console.log(`🤖 봇 로그인 완료: ${client.user.tag}`);

  await checkStream();
  process.exit(0); // Actions용 (끝나면 종료)
});

async function checkStream() {
  try {
    let wasLive = false;

    if (fs.existsSync(STATUS_FILE)) {
      wasLive = fs.readFileSync(STATUS_FILE, "utf8").trim() === "true";
    }

    const res = await axios.get(
      `https://bjapi.afreecatv.com/api/${BJ_ID}/station`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": `https://ch.sooplive.co.kr/${BJ_ID}`
        }
      }
    );

    const broadData = res.data?.broad;
    const isLive = broadData ? (broadData.is_onair === "Y") : false;

    console.log(`[체크] 방송 상태: ${isLive ? "ON" : "OFF"}`);

    if (isLive && !wasLive) {
      const channel = await client.channels.fetch(CHANNEL_ID);

      const title = broadData?.broad_title || "방송 시작!";
      const category = broadData?.broad_cate_name || "카테고리 없음";
      const thumbnail = `https://liveimg.afreecatv.com/m/${broadData?.broad_no}.jpg?cache=${Date.now()}`;

      const embed = new EmbedBuilder()
        .setColor(0xD59EE8)
        .setTitle(`💜 ${title}`)
        .setURL(`https://play.sooplive.co.kr/${BJ_ID}`)
        .addFields({
          name: "📂 방송 카테고리",
          value: category,
          inline: true
        })
        .setImage(thumbnail)
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("방송 보러가기")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://play.sooplive.co.kr/${BJ_ID}`)
      );

      await channel.send({
        content: "@everyone 🟣 방송 시작!",
        embeds: [embed],
        components: [row]
      });

      console.log("✅ 알림 보냄");
    }

    fs.writeFileSync(STATUS_FILE, String(isLive));

  } catch (e) {
    console.log("❌ 에러:", e.message);
  }
}

// 로그인
if (!TOKEN) {
  console.log("❌ DISCORD_TOKEN 없음");
} else {
  client.login(TOKEN);
}
