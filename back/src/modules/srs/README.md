# Smart Spaced Repetition (SRS)

The SRS module keeps its own per-user learning schedule, independent of general
practice-game results. It uses existing vocabulary records, without rewriting
their meanings, practice scores, or previous learning history.

## Endpoints (JWT required)

- `GET /srs/overview`: due/new/learning/mastered counts, review activity,
  and the next future review date.
- `GET /srs/queue?limit=20`: normal mode selects due cards first, then new
  cards, and shuffles their presentation order. With `includeScheduled=true`
  (used by the frontend's practice session), it randomly samples from ALL owned
  vocabulary in the chosen tab **before** applying the session limit, including
  new, due, and future-scheduled cards. Only future-scheduled cards are marked
  `isPracticeOnly` to prevent an early review from changing their SRS schedule.
  Limit is clamped to 1–50.
- `POST /srs/:vocabularyId/review`, body `{"rating":"good"}`:
  the primary review endpoint for all sessions. It determines due status on
  the server: due/new cards update the official SRS schedule; future-scheduled
  cards only update the latest difficulty rating, keeping their due date unchanged
  (response includes `isPracticeOnly: true`). Both append a timestamped event
  to the review history so repeated practice appears at the top.
- `POST /srs/:vocabularyId/practice`: retained for compatibility with clients
  already using this endpoint. Only accepts future-scheduled owned cards, logs
  each practice attempt, and preserves the official due date.
  Ratings: `again`, `hard`, `good`, `easy`.
- `GET /srs/upcoming?page=1&limit=6`: attention list showing only words most
  recently rated `again` or `hard`, ordered by due date. The most recent
  saved rating also includes extra practice; for pre-migration records it falls
  back to the latest official review. Good/easy cards remain scheduled but are
  hidden from this list. Each row has an `isDue` flag.
- `GET /srs/history?page=1&limit=6`: recent review events, newest first.

The upcoming and history endpoints each return `{ data, meta: { page, limit, total, pageCount } }`. Page is at least 1, clamped to the final available page; page size is limited to 1–20. Their pagination state is independent in the frontend.

All four GET endpoints accept an optional `tabId=<existing-vocabulary-tab-uuid>` query parameter. Without `tabId`, they operate on all the user's vocabulary. With `tabId`, they filter by the existing many-to-many `Vocabulary.tabs` relation (a word can appear in several tabs). The overview, due queue, upcoming reviews, and review history use the same membership filter. A tab's selection never resets the saved SRS progress, and the POST review endpoint continues to verify word ownership.

Each endpoint derives the user ID from the validated JWT. The review endpoint
verifies vocabulary ownership. Regular reviews write progress and history in
one transaction; early self-practice changes only the last difficulty rating.

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
  repetitions, latest difficulty rating (including extra practice).
  Unique (userId, vocabularyId), indexed due-time queries.
- `srs_reviews`: append-only review and practice events with rating, timestamp,
  scheduled outcome and `isPracticeOnly` flag (false for existing historical rows).

In development, TypeORM synchronizes the nullable `lastRating` column.
Production uses additive `AddSrsLastRating1795600000000` and
`AddSrsPracticeHistory1795700000000` migrations.
Legacy saved progress is handled without resetting the review schedule.

## Tests

`npm test -- --runInBand srs`

Scheduler unit tests and an isolated SQLite in-memory integration suite cover
scheduling, user isolation, audit history and duplicate-review prevention.
They do not modify the application's SQLite database.
