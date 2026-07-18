require('dotenv').config();

const prisma = require('../src/config/prisma');
const vectorDb = require('../src/utils/vectorDb');

async function main() {
  if (!process.env.NEON_VECTOR_URL && !process.env.DATABASE_URL) {
    throw new Error('NEON_VECTOR_URL or DATABASE_URL is required.');
  }

  await vectorDb.initDb();

  const [hotels, documents] = await Promise.all([
    prisma.hotel.findMany({
      select: { id: true, hotelName: true },
      orderBy: { id: 'asc' }
    }),
    prisma.knowledgeDocument.groupBy({
      by: ['hotelId', 'isVectorized'],
      _count: { id: true }
    })
  ]);

  const client = await vectorDb.pool.connect();
  try {
    const embeddings = await client.query(`
      SELECT hotel_id, COUNT(*)::int AS count
      FROM embeddings
      GROUP BY hotel_id
      ORDER BY hotel_id
    `);

    const vectorCounts = new Map(
      embeddings.rows.map(row => [Number(row.hotel_id), Number(row.count)])
    );

    console.log('Vector store is ready.');
    console.log(`Hotels: ${hotels.length}`);

    for (const hotel of hotels) {
      const docGroups = documents.filter(group => group.hotelId === hotel.id);
      const vectorizedDocs = docGroups
        .filter(group => group.isVectorized)
        .reduce((sum, group) => sum + group._count.id, 0);
      const pendingDocs = docGroups
        .filter(group => !group.isVectorized)
        .reduce((sum, group) => sum + group._count.id, 0);

      console.log(
        `- hotelId=${hotel.id} name="${hotel.hotelName}" vectorRows=${vectorCounts.get(hotel.id) || 0} vectorizedDocs=${vectorizedDocs} pendingDocs=${pendingDocs}`
      );
    }
  } finally {
    client.release();
    await prisma.$disconnect();
    await vectorDb.pool.end();
  }
}

main().catch(async error => {
  console.error('[ensure-vector-store] Failed:', error.message);
  await prisma.$disconnect().catch(() => {});
  await vectorDb.pool.end().catch(() => {});
  process.exit(1);
});
