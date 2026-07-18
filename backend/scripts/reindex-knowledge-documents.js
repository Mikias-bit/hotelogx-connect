require('dotenv').config();

const prisma = require('../src/config/prisma');
const vectorDb = require('../src/utils/vectorDb');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function parseArgs(argv) {
  return argv.slice(2).reduce((acc, arg) => {
    if (arg === '--force') {
      acc.force = true;
      return acc;
    }

    const [key, value] = arg.replace(/^--/, '').split('=');
    if (key && value !== undefined) acc[key] = value;
    return acc;
  }, {});
}

function chunkText(text, maxChars = 1000) {
  const chunks = [];
  let currentChunk = '';
  const sentences = String(text || '').split(/(?<=[.?!])\s+/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = `${sentence} `;
    } else {
      currentChunk += `${sentence} `;
    }
  }

  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

async function createEmbeddings(chunks) {
  const batchSize = Number(process.env.RAG_EMBEDDING_BATCH_SIZE || 64);
  const embeddings = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
      dimensions: 1024
    });

    embeddings.push(...response.data.map(item => item.embedding));
  }

  return embeddings;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required to create embeddings.');
  }

  const args = parseArgs(process.argv);
  const where = {
    rawText: { not: null }
  };

  if (args.hotelId) where.hotelId = Number(args.hotelId);
  if (args.documentId) where.id = Number(args.documentId);
  if (!args.force) where.isVectorized = false;

  const take = args.limit ? Number(args.limit) : undefined;
  const documents = await prisma.knowledgeDocument.findMany({
    where,
    orderBy: { updatedAt: 'asc' },
    ...(take ? { take } : {})
  });

  await vectorDb.initDb();
  console.log(`Found ${documents.length} document(s) to re-index.`);

  for (const doc of documents) {
    const chunks = chunkText(doc.rawText);
    if (!chunks.length) {
      console.warn(`Skipping documentId=${doc.id}; rawText is empty.`);
      continue;
    }

    console.log(`Re-indexing documentId=${doc.id} hotelId=${doc.hotelId} filename="${doc.filename}" chunks=${chunks.length}`);

    const embeddings = await createEmbeddings(chunks);
    const records = chunks.map((chunk, index) => ({
      id: `doc_${doc.id}_chunk_${index}`,
      documentId: doc.id,
      hotelId: doc.hotelId,
      content: chunk,
      embedding: embeddings[index]
    }));

    await vectorDb.deleteDocumentEmbeddings(doc.id);
    await vectorDb.upsertEmbeddings(records);

    await prisma.knowledgeDocument.update({
      where: { id: doc.id },
      data: {
        isVectorized: true,
        vectorCount: records.length
      }
    });
  }

  console.log('Knowledge document re-indexing complete.');
}

main()
  .catch(error => {
    console.error('[reindex-knowledge-documents] Failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
    await vectorDb.pool.end().catch(() => {});
  });
