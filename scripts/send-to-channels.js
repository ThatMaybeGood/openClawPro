// scripts/send-to-channels.js - 将简报发送到所有已接入的渠道
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 配置已接入的渠道
const CHANNELS = {
  wechat: {
    name: '企业微信',
    enabled: true,
    hookUrl: process.env.WECHAT_WEBHOOK_URL
  },
  telegram: {
    name: 'Telegram',
    enabled: true,
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID
  },
  signal: {
    name: 'Signal',
    enabled: false // Signal 需要额外配置
  },
  email: {
    name: 'Email',
    enabled: false // 需要邮件服务配置
  }
};

// 格式化消息内容（不同渠道可能需要不同的格式）
function formatMessageForChannel(content, channel) {
  switch (channel) {
    case 'wechat':
      // 企业微信支持 Markdown，但需要调整部分格式
      return content
        .replace(/###/g, '**')
        .replace(/\n\n/g, '\n\n')
        .substring(0, 2000); // 限制长度
    
    case 'telegram':
      // Telegram 使用 HTML 或 Markdown
      return content
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/_(.*?)_/g, '<i>$1</i>')
        .substring(0, 4096);
    
    default:
      return content;
  }
}

// 发送到企业微信
async function sendToWeChat(content) {
  if (!CHANNELS.wechat.enabled || !CHANNELS.wechat.hookUrl) {
    console.log('⚠️ 企业微信未配置或未启用');
    return { success: false, reason: 'Not configured' };
  }
  
  try {
    const formattedContent = formatMessageForChannel(content, 'wechat');
    
    const response = await axios.post(CHANNELS.wechat.hookUrl, {
      msgtype: 'markdown',
      markdown: {
        content: formattedContent
      }
    });
    
    console.log('✅ 企业微信发送成功');
    return { success: true, channel: 'wechat' };
  } catch (error) {
    console.error('❌ 企业微信发送失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 发送到 Telegram
async function sendToTelegram(content) {
  if (!CHANNELS.telegram.enabled || !CHANNELS.telegram.botToken || !CHANNELS.telegram.chatId) {
    console.log('⚠️ Telegram 未配置或未启用');
    return { success: false, reason: 'Not configured' };
  }
  
  try {
    const formattedContent = formatMessageForChannel(content, 'telegram');
    
    const response = await axios.post(
      `https://api.telegram.org/bot${CHANNELS.telegram.botToken}/sendMessage`,
      {
        chat_id: CHANNELS.telegram.chatId,
        text: formattedContent,
        parse_mode: 'HTML'
      }
    );
    
    console.log('✅ Telegram 发送成功');
    return { success: true, channel: 'telegram' };
  } catch (error) {
    console.error('❌ Telegram 发送失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 主发送函数
async function sendAllChannels(briefingContent) {
  const results = [];
  
  console.log('\n📬 开始向各渠道推送简报...\n');
  
  // 发送渠道列表
  const sendQueue = [];
  
  if (CHANNELS.wechat.enabled && CHANNELS.wechat.hookUrl) {
    sendQueue.push(sendToWeChat(briefingContent));
  }
  
  if (CHANNELS.telegram.enabled && CHANNELS.telegram.botToken && CHANNELS.telegram.chatId) {
    sendQueue.push(sendToTelegram(briefingContent));
  }
  
  // 等待所有发送完成
  const outcomes = await Promise.allSettled(sendQueue);
  
  outcomes.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      console.log(`❌ 发送失败: ${sendQueue[index]}`);
    }
  });
  
  return results;
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始发送每日新闻简报到各渠道...\n');
    
    // 读取刚刚生成的简报文件
    const today = new Date().toISOString().split('T')[0];
    const briefingPath = path.join(__dirname, '..', 'archives', 'news-briefings', `news-briefing-${today}.md`);
    
    if (!fs.existsSync(briefingPath)) {
      console.error('❌ 简报文件不存在，请先生成简报');
      return { success: false, error: 'Briefing file not found' };
    }
    
    const briefingContent = fs.readFileSync(briefingPath, 'utf-8');
    console.log(`📄 加载简报：${briefingPath}\n`);
    
    // 发送到所有渠道
    const results = await sendAllChannels(briefingContent);
    
    // 统计结果
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log('\n📊 发送结果汇总:');
    console.log(`   成功：${successCount}/${totalCount} 个渠道`);
    
    if (successCount > 0) {
      console.log('\n✨ 简报推送完成！\n');
      return { success: true, sent: successCount, total: totalCount, channels: results };
    } else {
      console.log('\n⚠️ 没有成功发送到任何渠道\n');
      return { success: false, error: 'No channels sent successfully' };
    }
    
  } catch (error) {
    console.error('❌ 发送简报失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 导出供其他模块使用
module.exports = {
  sendAllChannels,
  formatMessageForChannel,
  CHANNELS
};

// 如果直接运行此脚本
if (require.main === module) {
  main().then(result => {
    if (!result.success) {
      process.exit(1);
    }
  });
}
