# Smart Spaced Repetition (SRS)

The SRS module keeps its own per-user learning schedule, independent of general
practice-game results. It uses existing vocabulary records, without rewriting
their meanings, practice scores, or previous learning history.

## Endpoints (JWT required)

- `GET /srs/overview`: due/new/learning/mastered counts, review activity,
  and the next future review date.
- `GET /srs/queue?limit=20`: due cards first (oldest due first), then new
  cards (oldest created first). Limit is clamped to 1–50.
- `POST /srs/:vocabularyId/review`, body `{"rating":"good"}`:
  the only valid ratings are `again`, `hard`, `good`, `easy`.
- `GET /srs/upcoming?page=1&limit=6`: all scheduled cards (due/overdue first, then future), sorted by due date. Each row has an `isDue` flag; cards remain listed after their due time.
- `GET /srs/history?page=1&limit=6`: recent review events, newest first.

The upcoming and history endpoints each return `{ data, meta: { page, limit, total, pageCount } }`. Page is at least 1, clamped to the final available page; page size is limited to 1–20. Their pagination state is independent in the frontend.

All four GET endpoints accept an optional `tabId=<existing-vocabulary-tab-uuid>` query parameter. Without `tabId`, they operate on all the user's vocabulary. With `tabId`, they filter by the existing many-to-many `Vocabulary.tabs` relation (a word can appear in several tabs). The overview, due queue, upcoming reviews, and review history use the same membership filter. A tab's selection never resets the saved SRS progress, and the POST review endpoint continues to verify word ownership.

Each endpoint derives the user ID from the validated JWT. The review endpoint
verifies the vocabulary belongs to the user, rejects a second submission before
the due time (HTTP 409), and writes progress + audit history in one transaction.

## Schedule

The server uses a compact SM-2-inspired algorithm, not FSRS.

- Again: reset repetitions, increase lapses, return in 1 minute.
- Hard: reduce ease; return in 10 minutes for unlearned cards, or extend a
  learned card's interval conservatively.
- Good: first successful recall in 1 day, second in 3 days, then increase
  interval based on ease.
- Easy: first recall in 4 days, then increase interval more aggressively.
- Ease is bounded to 1.3–3.0, intervals to 3650 days.
- Cards scheduled at >=21 days count as long-term memory.

Scheduling uses server time. Dates are persisted as SQLite datetimes via
TypeORM. Reviews within the last rolling 24 hours count as recent activity.

## Tables

- `srs_progress`: one row per user and word; next date, interval, ease, lapses,
  repetitions. Unique (userId, vocabularyId), indexed due-time queries.
- `srs_reviews`: immutable review events with rating and scheduled outcome.

The project's TypeORM settings currently use `synchronize: true`, so new
tables appear when the backend starts. For a production environment with
`synchronize: false`, create and run a matching database migration before
starting this module. Avoid disabling synchronization without migrations.

## Tests

`npm test -- --runInBand srs`

Scheduler unit tests and an isolated SQLite in-memory integration suite cover
scheduling, user isolation, audit history and duplicate-review prevention.
They do not modify the application's SQLite database.
