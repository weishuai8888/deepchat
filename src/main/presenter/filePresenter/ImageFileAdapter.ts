import { BaseFileAdapter } from './BaseFileAdapter'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
// import { VisionService } from '../llm/VisionService'
// import { loadVisionConfig } from '../../utils/env'

export class ImageFileAdapter extends BaseFileAdapter {
  private maxFileSize: number
  imageMetadata: {
    width?: number
    height?: number
    format?: string
  } = {}
  // private visionDescription: string | undefined

  constructor(filePath: string, maxFileSize: number) {
    super(filePath)
    this.maxFileSize = maxFileSize
  }

  protected getFileDescription(): string | undefined {
    return 'Image File'
  }

  /**
   * 使用视觉模型生成图片描述
   * 后续可以接入具体的视觉模型实现
   */
  // private async generateImageDescription(): Promise<string> {
  //   const visionConfig = loadVisionConfig()
  //   console.info('visionconfig', visionConfig)
  //   if (!visionConfig) {
  //     return ''
  //   }

  //   const visionService = new VisionService(visionConfig)
  //   return visionService.describeImage(this.filePath)
  // }

  /**
   * 提取图片的基本信息
   */
  private async extractImageMetadata(): Promise<void> {
    try {
      const metadata = await sharp(this.filePath).metadata()
      this.imageMetadata = {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      }
    } catch (error) {
      console.error('Error extracting image metadata:', error)
      // 如果 sharp 失败，至少从文件扩展名获取格式
      this.imageMetadata.format = path.extname(this.filePath).substring(1).toLowerCase()
    }
  }

  public async getLLMContent(): Promise<string | undefined> {
    const stats = await fs.stat(this.filePath)
    if (stats.size > this.maxFileSize) {
      return undefined
    }

    // 提取图片元数据
    await this.extractImageMetadata()

    // 压缩图片并转换为JPG格式
    const compressedImage = await sharp(this.filePath)
      .resize(1200, 1200, {
        // 限制最大尺寸
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        // 统一转换为JPG
        quality: 70, // 压缩质量
        mozjpeg: true // 使用mozjpeg优化
      })
      .toBuffer()

    const base64ImageString = compressedImage.toString('base64')
    return `data:image/jpeg;base64,${base64ImageString}`
  }

  async getContent(): Promise<string | undefined> {
    // if (this.visionDescription === undefined) {
    //   this.visionDescription = await this.generateImageDescription()
    // }
    // return this.visionDescription
    return ''
  }
}
