// 筑栖平台交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 筑栖平台已加载！');
    
    // 功能卡片点击事件
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            showModal(title);
        });
    });
    
    // 主按钮点击事件
    const heroButton = document.querySelector('.btn-primary');
    if (heroButton) {
        heroButton.addEventListener('click', function() {
            alert('🎉 欢迎使用筑栖平台！\n\n选择您需要的服务开始吧~');
        });
    }
    
    // 窗口大小变化处理
    window.addEventListener('resize', function() {
        console.log('📱 窗口大小变化：' + window.innerWidth + 'x' + window.innerHeight);
    });
});

function showModal(title) {
    const messages = {
        '户型上传与设计': '您可以上传户型图或宅基地信息，获取专业设计方案和预算报价。支持 JPG、PNG、PDF 格式（最大 50MB）。',
        '优质施工团队': '严选认证施工团队，查看资质等级、完成项目数、用户评价。多对一比较选择，确保工程质量。',
        '全流程施工监控': '实时进度跟踪、环境监测（天气/温湿度）、施工质量上报、节点验收确认。手机随时查看工地情况。',
        '专业设计服务': '资深设计师一对一服务，定制个性化空间方案。包含平面布局、效果图、施工图制作。',
        '精准预算管理': '分项明细报价（材料费/人工费/设备费等），费用透明可控，合同锁价，拒绝隐形消费。',
        '装修材料供应': '对接优质建材供应商，价格透明，品质保证。支持在线选购、配送跟踪、质量追溯。'
    };
    
    alert('🚀 ' + title + '\n\n' + (messages[title] || ''));
}