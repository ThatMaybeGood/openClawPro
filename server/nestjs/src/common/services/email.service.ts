import { Injectable, Logger } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  // private transporter: any;

  constructor() {
    // TODO: 配置真实 SMTP 服务器
    /*
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    */
    
    this.logger.log('Email service initialized');
  }

  /**
   * 发送邮件（模拟）
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    // 开发环境：打印日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`
═══════════════════════════════════════════
📧 模拟发送邮件
═══════════════════════════════════════════
收件人：${to}
主题：${subject}
内容预览：${html.substring(0, 200)}...
═══════════════════════════════════════════
`);
      return;
    }

    // 生产环境：实际发送
    try {
      // await this.transporter.sendMail({
      //   from: process.env.SMTP_FROM || 'noreply@zhiqu.com',
      //   to,
      //   subject,
      //   html,
      // });
      
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const html = `
      <h1>欢迎加入筑栖平台！🏠</h1>
      <p>亲爱的 ${username}，</p>
      <p>感谢您注册筑栖平台！我们为您提供一站式家庭装修建造管理服务。</p>
      <p>您可以：</p>
      <ul>
        <li>上传户型图并获取设计方案</li>
        <li>选择优质施工团队</li>
        <li>实时查看施工进度和环境监测</li>
        <li>管理项目预算和付款记录</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}">立即开始使用 →</a></p>
      <p style="color: #999; font-size: 12px;">筑栖平台 · 筑心筑造，安心安居</p>
    `;

    await this.sendEmail(
      email,
      '欢迎加入筑栖平台',
      html,
    );
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    
    const html = `
      <h1>密码重置</h1>
      <p>您请求了密码重置，请点击以下链接设置新密码：</p>
      <p><a href="${resetUrl}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">重置密码</a></p>
      <p>如果这不是您的操作，请忽略此邮件。</p>
      <p style="color: #999;">该链接将在 1 小时后失效。</p>
    `;

    await this.sendEmail(
      email,
      '密码重置请求',
      html,
    );
  }

  /**
   * 发送项目进度通知
   */
  async sendProjectUpdateEmail(to: string, projectName: string, progress: number): Promise<void> {
    const html = `
      <h1>项目进度更新 🚀</h1>
      <p>您的项目 <strong>"${projectName}"</strong> 最新进度：</p>
      <div style="background: #f0f0f0; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0;">
        <div style="background: linear-gradient(90deg, #667eea, #764ba2); width: ${progress}%; height: 100%; display: flex; align-items: center; justify-content: center; color: white;">${progress}%</div>
      </div>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/dashboard">查看详情 →</a></p>
    `;

    await this.sendEmail(
      to,
      `项目"${projectName}"进度更新`,
      html,
    );
  }

  /**
   * 发送预算超支警告
   */
  async sendBudgetAlertEmail(to: string, projectName: string, overBudgetAmount: number): Promise<void> {
    const html = `
      <h1 style="color: #dc3545;">⚠️ 预算超支警告</h1>
      <p>您的项目 <strong>"${projectName}"</strong> 已超出预算：</p>
      <p style="font-size: 24px; color: #dc3545; font-weight: bold;">¥${overBudgetAmount.toLocaleString('zh-CN')}</p>
      <p>请及时检查预算明细并进行调整。</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/budget">查看详情 →</a></p>
    `;

    await this.sendEmail(
      to,
      '【重要】预算超支提醒',
      html,
    );
  }

  /**
   * 批量发送邮件
   */
  async sendBulkEmail(recipients: Array<{ email: string; name: string }>, templateData: any): Promise<number> {
    let successCount = 0;
    
    for (const recipient of recipients) {
      try {
        await this.sendEmail(
          recipient.email,
          templateData.subject,
          templateData.html.replace('{{name}}', recipient.name),
        );
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to send to ${recipient.email}: ${error.message}`);
      }
    }
    
    return successCount;
  }
}
