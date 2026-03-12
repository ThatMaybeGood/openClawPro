import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileUploadService } from '../services/file-upload.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';

@ApiTags('uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('image')
  @ApiOperation({ summary: '上传图片' })
  @UseInterceptors(FileInterceptor('file', this.fileUploadService.generateMulterConfig()))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      success: true,
      data: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: this.fileUploadService.getPublicUrl(file.filename),
      },
    };
  }

  @Delete(':filename')
  @ApiOperation({ summary: '删除文件（管理员）' })
  @ApiBearerAuth()
  async deleteFile(@Param('filename') filename: string) {
    const deleted = this.fileUploadService.deleteFile(filename);
    
    if (!deleted) {
      return { success: false, message: '文件不存在或已被删除' };
    }
    
    return { success: true, message: '文件已删除' };
  }

  @Get('storage-usage')
  @ApiOperation({ summary: '获取存储使用情况' })
  @ApiBearerAuth()
  getStorageUsage() {
    const usage = this.fileUploadService.getStorageUsage();
    return {
      success: true,
      data: {
        totalSize: usage.totalSize,
        totalSizeFormatted: this.formatBytes(usage.totalSize),
        fileCount: usage.fileCount,
      },
    };
  }

  /**
   * 字节转换格式化
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
