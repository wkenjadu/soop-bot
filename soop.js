const axios = require("axios");
const fs = require("fs");

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const BJ_ID = "breezy25";
const BJ_NAME = "숩니찡";
const STATUS_FILE = "status.txt";

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("clientReady", async () => {
  console.log(`🤖 로그인 완료: ${client.user.tag}`);
  await checkStream();
  process.exit(0);
});

async function checkStream() {
  try {
    let wasLive = false;
    let isFirstRun = false;

    // status.txt 없으면 최초 실행
    if (!fs.existsSync(STATUS_FILE)) {
      isFirstRun = true;
    } else {
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

    // 🔥 핵심 조건
    if (isLive && (!wasLive || isFirstRun)) {

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
        content: "@everyone 🟣 방송 중입니다!",
        embeds: [embed],
        components: [row]
      });

      console.log("✅ 알림 전송 완료");
    }

    fs.writeFileSync(STATUS_FILE, String(isLive));

  } catch (e) {
    console.log("❌ 에러:", e.message);
  }
}

// 로그인
if (!TOKEN) {
  console.log("❌ 토큰 없음");
} else {
  client.login(TOKEN);
}
