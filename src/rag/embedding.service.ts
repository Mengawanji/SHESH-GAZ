import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbeddingService {
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.get<string>('OPENAI_API_KEY') });
    this.model = this.config.get<string>('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small');
  }

  async embed(texts: string[]): Promise<number[][]> {
    const res = await this.openai.embeddings.create({ model: this.model, input: texts });
    return res.data.map((d) => d.embedding);
  }

  async upsertChunk(content: string, metadata: Record<string, unknown> = {}) {
    const [embedding] = await this.embed([content]);
    const vectorLiteral = `[${embedding.join(',')}]`;

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO knowledge_chunks (content, metadata, embedding) VALUES ($1, $2::jsonb, $3::vector)`,
      content,
      JSON.stringify(metadata),
      vectorLiteral,
    );
  }
}