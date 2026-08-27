import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

export interface RetrievedChunk {
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

@Injectable()
export class RetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embedding: EmbeddingService,
  ) {}

  async retrieve(query: string, topK = 4): Promise<RetrievedChunk[]> {
    const [queryEmbedding] = await this.embedding.embed([query]);
    const vectorLiteral = `[${queryEmbedding.join(',')}]`;

    return this.prisma.$queryRawUnsafe<RetrievedChunk[]>(
      `SELECT content, metadata, 1 - (embedding <=> $1::vector) AS similarity
       FROM knowledge_chunks
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      vectorLiteral,
      topK,
    );
  }

  formatAsContext(chunks: RetrievedChunk[]): string {
    if (!chunks.length) return 'No relevant knowledge base entries found.';
    return chunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n');
  }
}