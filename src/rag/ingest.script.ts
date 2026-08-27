import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EmbeddingService } from './embedding.service';

const KNOWLEDGE_ENTRIES: { content: string; metadata: Record<string, unknown> }[] = [
  {
    content:
      'We deliver within the city for orders above 1 cylinder. Delivery usually takes between 30 minutes and 2 hours depending on your location and current order volume.',
    metadata: { type: 'policy', topic: 'delivery' },
  },
  {
    content:
      'We accept payment via mobile money (MTN MoMo, Orange Money) and cash on delivery. Payment is confirmed before the order is marked as fulfilled.',
    metadata: { type: 'policy', topic: 'payment' },
  },
  {
    content:
      'Gloca gas cylinders are known for their reliable valve safety and are one of the most popular household brands we stock, available in 6kg, 12.5kg and 25kg sizes.',
    metadata: { type: 'brand_info', brand: 'Gloca' },
  },
  {
    content:
      'Total gas cylinders are widely trusted for consistent quality and are available in 6kg, 12.5kg and 25kg sizes, popular with both households and small restaurants.',
    metadata: { type: 'brand_info', brand: 'Total' },
  },
  {
    content:
      'Tradex gas cylinders are a more budget-friendly option, available in 6kg and 12.5kg sizes, and are a good choice for smaller households.',
    metadata: { type: 'brand_info', brand: 'Tradex' },
  },
  {
    content:
      'If you bring your own empty cylinder for a refill, the price is lower than buying a full cylinder with a new tank. Let the assistant know if you are refilling versus buying new.',
    metadata: { type: 'faq', topic: 'refill' },
  },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const embeddingService = app.get(EmbeddingService);

  for (const entry of KNOWLEDGE_ENTRIES) {
    await embeddingService.upsertChunk(entry.content, entry.metadata);
    console.log(`Ingested: ${entry.content.slice(0, 60)}...`);
  }

  await app.close();
  console.log(`Done. Ingested ${KNOWLEDGE_ENTRIES.length} chunks.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});