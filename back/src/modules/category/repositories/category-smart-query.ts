import type { SelectQueryBuilder } from 'typeorm';
import type { Category } from '../../../entities/category.entity';

export const SMART_RECENT_DAYS = 30;
export const SMART_NEGLECTED_DAYS = 14;
export const SMART_MIN_ACTIVITY = 2;

// Use the canonical practice and SRS records, not the mirrored unified history.
const activity = `(
  SELECT a.vocabularyId,
    SUM(CASE WHEN julianday(a.createdAt) >= julianday(:smartNow) - ${SMART_RECENT_DAYS} THEN 1 ELSE 0 END) AS recentCount,
    MAX(julianday(a.createdAt)) AS lastStudy
  FROM (
    SELECT vocabularyId, createdAt FROM practice_histories WHERE userId = :userId
    UNION ALL
    SELECT vocabularyId, createdAt FROM srs_reviews WHERE userId = :userId
  ) a
  WHERE julianday(a.createdAt) <= julianday(:smartNow)
  GROUP BY a.vocabularyId
)`;

const stats = `(
  SELECT vc.categoryId, COUNT(*) AS wordCount,
    COALESCE(SUM(a.recentCount), 0) AS recentCount,
    MAX(a.lastStudy) AS lastStudy,
    MAX(julianday(v.createdAt)) AS newestWord
  FROM vocabulary_categories vc
  INNER JOIN vocabularies v ON v.id = vc.vocabularyId AND v.userId = :userId
  INNER JOIN categories owned ON owned.id = vc.categoryId AND owned.userId = :userId
  LEFT JOIN ${activity} a ON a.vocabularyId = v.id
  GROUP BY vc.categoryId
)`;

export const smartWordCount = 'COALESCE(smart.wordCount, 0)';
export const smartRecentCount = 'COALESCE(smart.recentCount, 0)';
export const smartLastStudy = 'smart.lastStudy';
const reference = 'MAX(COALESCE(julianday(c.createdAt), 0), COALESCE(smart.newestWord, 0), COALESCE(smart.lastStudy, 0))';
export const smartIdleDays = `MAX(0, CAST(julianday(:smartNow) - ${reference} AS INTEGER))`;
export const smartInterested = `(${smartRecentCount} >= ${SMART_MIN_ACTIVITY} AND ${smartIdleDays} < ${SMART_NEGLECTED_DAYS})`;
export const smartNeglected = `(${smartWordCount} > 0 AND ${smartIdleDays} >= ${SMART_NEGLECTED_DAYS})`;

export function joinCategorySmartStats(qb: SelectQueryBuilder<Category>, now: Date) {
  return qb.leftJoin(stats, 'smart', 'smart.categoryId = c.id').setParameter('smartNow', now.toISOString());
}
