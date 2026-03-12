// scripts/generate-news.js - 生成每日新闻简报
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置新闻源
const NEWS_SOURCES = {
  // 国内新闻
  domestic: [
    { name: '新华网', url: 'https://www.xinhuanet.com/' },
    { name: '人民日报', url: 'https://www.people.com.cn/' },
    { name: '央视新闻', url: 'https://news.cctv.com/' }
  ],
  // 国际新闻
  international: [
    { name: 'BBC', url: 'https://www.bbc.com/news' },
    { name: 'Reuters', url: 'https://www.reuters.com/' },
    { name: 'AP News', url: 'https://apnews.com/' }
  ],
  // 科技新闻
  tech: [
    { name: 'TechCrunch', url: 'https://techcrunch.com/' },
    { name: '36Kr', url: 'https://36kr.com/' }
  ]
};

// 获取当天日期字符串
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化时间
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 模拟获取新闻内容（实际应调用新闻 API）
async function fetchNews() {
  const newsData = {
    date: getTodayString(),
    timestamp: formatTime(new Date()),
    sections: {}
  };

  // 国内热点
  newsData.sections.domestic = [
    {
      title: '国家重要政策解读：促进经济高质量发展',
      source: '新华社',
      summary: '最新政策强调创新驱动发展，推动产业升级...',
      link: '#',
      category: '时政'
    },
    {
      title: '科技创新成果显著，多个领域实现突破',
      source: '人民日报',
      summary: '在人工智能、量子计算、生物医药等领域取得重大进展...',
      link: '#',
      category: '科技'
    },
    {
      title: '区域经济协同发展新格局正在形成',
      source: '央视新闻',
      summary: '长三角、粤港澳大湾区等区域合作不断深化...',
      link: '#',
      category: '财经'
    }
  ];

  // 国际要闻
  newsData.sections.international = [
    {
      title: '全球气候变化峰会达成新共识',
      source: 'BBC',
      summary: '各国承诺加强减排行动，共同应对气候挑战...',
      link: '#',
      category: '环境'
    },
    {
      title: '国际金融市场波动加剧',
      source: 'Reuters',
      summary: '主要货币汇率波动明显，投资者谨慎观望...',
      link: '#',
      category: '财经'
    },
    {
      title: '国际体育赛事精彩回顾与前瞻',
      source: 'AP News',
      summary: ' upcoming 奥运会准备进入关键阶段...',
      link: '#',
      category: '体育'
    }
  ];

  // 科技前沿
  newsData.sections.tech = [
    {
      title: 'AI 大模型技术迎来新突破',
      source: 'TechCrunch',
      summary: '新一代多模态模型在多个任务上超越预期...',
      link: '#',
      category: 'AI'
    },
    {
      title: '新能源汽车销量持续攀升',
      source: '36Kr',
      summary: '新能源车市继续保持高速增长态势...',
      link: '#',
      category: '汽车'
    },
    {
      title: '元宇宙概念应用落地加速',
      source: 'TechCrunch',
      summary: '虚拟地产、数字藏品等应用场景增多...',
      link: '#',
      category: '互联网'
    }
  ];

  //  yesterday 回顾
  newsData.re yesterday = generateYesterdayRecap();

  return newsData;
}

// 生成昨天回顾
function generateYesterdayRecap() {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return {
    date: yesterday.toISOString().split('T')[0],
    highlights: [
      '昨日市场整体保持稳定',
      '多项民生政策落地见效',
      '国际交流活动有序开展'
    ]
  };
}

// 生成 Markdown 格式的新闻简报
function generateBriefing(newsData) {
  let content = `## 📰【筑栖早报】${newsData.date}\n`;
  content += `_生成时间：${newsData.timestamp}_\n\n`;
  
  // 国内热点
  content += `### 🇨🇳 国内热点\n\n`;
  newsData.sections.domestic.forEach((item, index) => {
    content += `${index + 1}. **${item.title}**\n`;
    content += `   _${item.source}_ | ${item.category}\n`;
    content += `   ${item.summary}\n\n`;
  });
  
  // 国际要闻
  content += `### 🌏 国际要闻\n\n`;
  newsData.sections.international.forEach((item, index) => {
    content += `${index + 1}. **${item.title}**\n`;
    content += `   _${item.source}_ | ${item.category}\n`;
    content += `   ${item.summary}\n\n`;
  });
  
  // 科技前沿
  content += `### 💻 科技前沿\n\n`;
  newsData.sections.tech.forEach((item, index) => {
    content += `${index + 1}. **${item.title}**\n`;
    content += `   _${item.source}_ | ${item.category}\n`;
    content += `   ${item.summary}\n\n`;
  });
  
  // 昨天回顾
  if (newsData.yesterday) {
    content += `### 📅 昨天回顾 (${newsData.yesterday.date})\n\n`;
    newsData.yesterday.highlights.forEach(highlight => {
      content += `• ${highlight}\n`;
    });
    content += `\n`;
  }
  
  // 明日预告
  content += `### 🔮 明日预告\n\n`;
  content += `_本简报由筑栖平台自动推送_ ❤️\n`;
  content += `_关注我们获取更多实时资讯_\n\n`;
  content += `---\n`;
  content += `[筑栖平台](https://github.com/ThatMaybeGood/openClawPro)\n`;
  
  return content;
}

// 保存简报到文件
function saveBriefing(briefingContent, filename) {
  const savePath = path.join(__dirname, '..', 'archives', 'news-briefings');
  
  // 确保目录存在
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }
  
  const filePath = path.join(savePath, filename);
  fs.writeFileSync(filePath, briefingContent, 'utf-8');
  
  console.log(`✅ 简报已保存：${filePath}`);
  return filePath;
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始生成每日新闻简报...\n');
    
    // 获取新闻数据
    const newsData = await fetchNews();
    console.log(`📊 获取了 ${newsData.sections.domestic.length + newsData.sections.international.length + newsData.sections.tech.length} 条新闻`);
    
    // 生成简报内容
    const briefingContent = generateBriefing(newsData);
    console.log('📝 简报内容生成完成\n');
    
    // 保存到文件
    const filename = `news-briefing-${getTodayString()}.md`;
    const filePath = saveBriefing(briefingContent, filename);
    
    console.log('\n✨ 新闻简报生成成功！\n');
    console.log('--- 简报预览 ---');
    console.log(briefingContent);
    
    return {
      success: true,
      file: filePath,
      data: newsData
    };
    
  } catch (error) {
    console.error('❌ 生成简报失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 导出供其他模块使用
module.exports = {
  generateNews: fetchNews,
  generateBriefing,
  saveBriefing,
  getTodayString
};

// 如果直接运行此脚本
if (require.main === module) {
  main().then(result => {
    if (!result.success) {
      process.exit(1);
    }
  });
}
