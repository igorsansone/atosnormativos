import { Router } from 'express';
import prisma from '../db';

const router = Router();

/**
 * Helper: aplica filtro por soft delete (deletedAt IS NULL)
 */
function addNotDeleted(where: any) {
  if (!where) return { deletedAt: null };
  return { AND: [where, { deletedAt: null }] };
}

/**
 * Cria um novo ato.
 * Lógica:
 *  - Em transação: obter/atualizar sequence (FOR UPDATE) para actType+year
 *  - Incrementar last_number e usar como sequentialNumber
 *  - Gerar number string: padStart(3,'0') + '/' + year
 */
router.post('/', async (req, res) => {
  try {
    const {
      actType,
      object,
      requestingSector,
      dateAct,
      homologation,
      homologationNumber,
      publishedSite,
      publishedWord,
      publishedPdf,
      publishedPending,
    } = req.body;

    const now = new Date();
    const year = now.getFullYear();

    const created = await prisma.$transaction(async (tx) => {
      // Busca sequence com lock FOR UPDATE
      const seqRows: any[] = await tx.$queryRaw`
        SELECT id, last_number FROM sequences
        WHERE act_type = ${actType} AND year = ${year}
        FOR UPDATE
      `;

      let lastNumber: number;
      if (seqRows.length === 0) {
        await tx.$executeRaw`
          INSERT INTO sequences(act_type, year, last_number)
          VALUES (${actType}, ${year}, 1)
        `;
        lastNumber = 1;
      } else {
        lastNumber = seqRows[0].last_number + 1;
        await tx.$executeRaw`
          UPDATE sequences SET last_number = ${lastNumber}
          WHERE id = ${seqRows[0].id}
        `;
      }

      const numberStr = String(lastNumber).padStart(3, '0') + '/' + year;

      const act = await tx.act.create({
        data: {
          number: numberStr,
          sequentialNumber: lastNumber,
          year,
          actType,
          object,
          requestingSector,
          dateAct: dateAct ? new Date(dateAct) : null,
          homologation,
          homologationNumber,
          publishedSite: !!publishedSite,
          publishedWord: !!publishedWord,
          publishedPdf: !!publishedPdf,
          publishedPending: !!publishedPending,
        },
      });

      return act;
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('Create act error', err);
    res.status(500).json({ error: 'Erro ao criar ato' });
  }
});

/**
 * Listar / Pesquisar (somente não deletados)
 * Query params:
 *  - q: texto livre (vai pesquisar em number, object, homologationNumber)
 *  - actType, status, requestingSector, year, dateFrom, dateTo
 *  - page, pageSize
 */
router.get('/', async (req, res) => {
  try {
    const {
      q,
      actType,
      status,
      requestingSector,
      year,
      dateFrom,
      dateTo,
      page = '1',
      pageSize = '50',
    } = req.query as any;

    const pageNum = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    const filters: any = {};

    if (actType) filters.actType = actType;
    if (status) filters.status = status;
    if (requestingSector) filters.requestingSector = requestingSector;
    if (year) filters.year = parseInt(year, 10);

    // Construir where para pesquisa livre
    const whereOr: any[] = [];
    if (q) {
      const qstr = String(q);
      whereOr.push({ number: { contains: qstr, mode: 'insensitive' } });
      whereOr.push({ object: { contains: qstr, mode: 'insensitive' } });
      whereOr.push({ homologationNumber: { contains: qstr, mode: 'insensitive' } });
    }

    if (dateFrom || dateTo) {
      filters.dateAct = {};
      if (dateFrom) filters.dateAct.gte = new Date(String(dateFrom));
      if (dateTo) filters.dateAct.lte = new Date(String(dateTo));
    }

    let where: any = { ...filters };
    if (whereOr.length) where.OR = whereOr;

    // garantir soft delete filter
    where = addNotDeleted(where);

    const [total, data] = await Promise.all([
      prisma.act.count({ where }),
      prisma.act.findMany({
        where,
        orderBy: [{ year: 'desc' }, { sequentialNumber: 'desc' }],
        skip: (pageNum - 1) * size,
        take: size,
      }),
    ]);

    res.json({ total, page: pageNum, pageSize: size, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar atos' });
  }
});

/**
 * Obter ato (somente não deletados)
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const act = await prisma.act.findFirst({ where: { id, deletedAt: null } });
  if (!act) return res.status(404).json({ error: 'Ato não encontrado' });
  res.json(act);
});

/**
 * Editar ato
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const actExists = await prisma.act.findFirst({ where: { id, deletedAt: null } });
    if (!actExists) return res.status(404).json({ error: 'Ato não encontrado' });

    const updated = await prisma.act.update({
      where: { id },
      data: updateData,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar ato' });
  }
});

/**
 * Soft Delete (marca deletedAt)
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const act = await prisma.act.findFirst({ where: { id, deletedAt: null } });
    if (!act) return res.status(404).json({ error: 'Ato não encontrado' });

    await prisma.act.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir ato' });
  }
});

/**
 * Arquivar / Desarquivar
 */
router.post('/:id/archive', async (req, res) => {
  const { id } = req.params;
  const { archive } = req.body; // true/false
  try {
    const act = await prisma.act.findFirst({ where: { id, deletedAt: null } });
    if (!act) return res.status(404).json({ error: 'Ato não encontrado' });

    const data: any = {};
    if (archive) {
      data.status = 'ARCHIVED';
      data.archivedAt = new Date();
    } else {
      data.status = 'ACTIVE';
      data.archivedAt = null;
    }
    const updated = await prisma.act.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao arquivar/desarquivar' });
  }
});

/**
 * Tornar inutilizado
 */
router.post('/:id/void', async (req, res) => {
  const { id } = req.params;
  const { voided = true } = req.body;
  try {
    const act = await prisma.act.findFirst({ where: { id, deletedAt: null } });
    if (!act) return res.status(404).json({ error: 'Ato não encontrado' });

    const data: any = {};
    if (voided) {
      data.status = 'VOIDED';
      data.voidedAt = new Date();
    } else {
      data.status = 'ACTIVE';
      data.voidedAt = null;
    }
    const updated = await prisma.act.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao marcar como inutilizado' });
  }
});

/**
 * Relatório (retorna dados filtrados; o front pode converter para CSV/PDF/Print)
 * Reusa os mesmos filtros do GET /
 */
router.get('/report/download', async (req, res) => {
  try {
    res.json({ message: 'Use /api/acts com filtros para gerar relatório. Aqui você pode retornar CSV/PDF.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

export default router;
