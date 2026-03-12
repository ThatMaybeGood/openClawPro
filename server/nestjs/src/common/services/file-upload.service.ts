import { Injectable, BadRequestException } from '@nestjs/common';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.maxFileSize = parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10); // 默认 10MB

    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 生成 Multer 配置
   */
  generateMulterConfig(options?: { field: string; dest?: string }) {
    return multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const dest = options?.dest || this.uploadDir;
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          this.checkFileType(file);
          
          // 生成唯一文件名
          const uniqueSuffix = crypto.randomBytes(8).toString('hex');
          const ext = path.extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: this.maxFileSize,
      },
      fileFilter: (req, file, cb) => {
        this.checkFileType(file);
        cb(null, true);
      },
    });
  }

  /**
   * 检查文件类型
   */
  private checkFileType(file: Express.Multer.File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`不支持的文件类型：${file.mimetype}`);
    }
  }

  /**
   * 生成访问 URL（本地文件）
   */
  getPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  /**
   * 删除文件
   */
  deleteFile(filename: string): boolean {
    const filePath = path.join(this.uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * 清理过期文件（定时任务调用）
   */
  cleanupOldFiles(days: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let deletedCount = 0;
    const files = fs.readdirSync(this.uploadDir);
    
    for (const file of files) {
      const filePath = path.join(this.uploadDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile() && stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
    
    console.log(`清理了 ${deletedCount} 个过期文件`);
    return deletedCount;
  }

  /**
   * 云存储上传（预留阿里云 OSS 实现）
   */
  async uploadToCloudStorage(file: Express.Multer.File): Promise<string> {
    // TODO: 实现阿里云 OSS/腾讯云 COS 等云存储
    // 示例伪代码：
    /*
    const ossClient = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
    
    const result = await ossClient.put(file.originalname, file.buffer);
    return result.url;
    */
    
    return this.getPublicUrl(file.filename);
  }

  /**
   * 获取上传目录大小统计
   */
  getStorageUsage(): { totalSize: number; fileCount: number } {
    const files = fs.readdirSync(this.uploadDir);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(this.uploadDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }
    
    return {
      totalSize,
      fileCount: files.length,
    };
  }
}
