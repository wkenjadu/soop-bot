const axios = require("axios");
const fs = require("fs");
const http = require("http");
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const TOKEN = (process.env.DISCORD_TOKEN || "").trim();
const CHANNEL_ID = "1418380178358534200";
const BJ_ID = "breezy25";
const BJ_NAME = "숩니찡";
const STATUS_FILE = "status.txt";

console.log("파일 실행 시작");
console.log("TOKEN 있음?", !!TOKEN);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Bot running");
}).listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Web server listening on port ${PORT}`);
});

client.once("clientReady", async () => {
  console.log(`🤖 봇 로그인 완료: ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    console.log("📨 채널 찾기 성공:", channel?.id);
    await channel.send("✅ 테스트 메시지");
    console.log("✅ 테스트 메시지 전송 성공");
  } catch (e) {
    console.log("❌ 채널/권한 문제:", e.message);
  }

  checkStream();
  setInterval(checkStream, 30000);
});

client.on("error", (err) => {
  console.log("❌ client error:", err.message);
});

client.on("warn", (msg) => {
  console.log("⚠️ warn:", msg);
});

client.on("shardError", (err) => {
  console.log("❌ shard error:", err.message);
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
        },
        timeout: 10000
      }
    );

    const broadData = res.data?.broad;
    const isLive = broadData ? broadData.is_onair === "Y" : false;

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
    console.log("❌ 에러:", e.response?.status || e.code || e.message, e.message);
  }
}

if (!TOKEN) {
  console.log("❌ DISCORD_TOKEN 없음");
} else {
  console.log("🔑 로그인 시도");
  client.login(TOKEN)
    .then(() => {
      console.log("✅ login() 호출 성공");
    })
    .catch((err) => {
      console.log("❌ 로그인 실패:", err.message);
    });
}
