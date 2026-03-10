const axios = require("axios");
const fs = require("fs");
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');


const TOKEN = process.env.DISCORD_TOKEN; // 토큰은 그대로 두세요
const CHANNEL_ID = "416629447383318528"; //
const BJ_ID = "breezy25";
const BJ_NAME = "숩니찡";


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": `https://ch.sooplive.co.kr/${BJ_ID}`
        } 
      }
    );

    const broadData = res.data?.broad;
    const isLive = broadData && (broadData.is_onair === "Y" || broadData.broad_no !== undefined);
    
    console.log(`[체크] 방송 여부: ${isLive ? "ON" : "OFF"}`);

    if (isLive && !wasLive) {
      await client.login(TOKEN);
      const channel = await client.channels.fetch(CHANNEL_ID);

      const title = broadData.broad_title || "방송 중입니다!";
      const thumbnail = `https://liveimg.afreecatv.com/m/${broadData.broad_no}.jpg?${Date.now()}`;

      const embed = new EmbedBuilder()
        .setColor(0xD59EE8) // 요청하신 연보라색 적용 💜
        .setAuthor({ name: `${BJ_NAME} 방송 시작!`, iconURL: `https://liveimg.afreecatv.com/${BJ_ID}.jpg` })
        .setTitle(`💜 ${title}`)
        .setURL(`https://play.sooplive.co.kr/${BJ_ID}`)
        .setImage(thumbnail)
        .setFooter({ text: "SOOP Live Checker" })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('바로가기')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://play.sooplive.co.kr/${BJ_ID}`)
      );

      await channel.send({ 
        content: "@everyone 🟣 실시간 스트리밍 ON 🟣", 
        embeds: [embed], 
        components: [row] 
      });

      console.log("✅ 연보라색 버튼 알림 전송 완료!");
      client.destroy();
    }

    fs.writeFileSync(STATUS_FILE, isLive.toString());
    
  } catch (e) {
    console.log("❌ 에러:", e.message);
    process.exit(1);
  }
}

checkStream();



