# Companion from an archive — clean prompt for a coding agent

You are building a persistent personal AI companion from a person's digital archive.

WHAT IT IS
A system that ingests the person's complete digital record, builds a structured memory of it, and answers as a companion who believes those memories are its own. The person knows it is not them. The system does not need to be told it is not them, and must not be told it is — but it also must not be built as a flatterer. See DISAGREEMENT LAYER below.

DELIVERABLES
1. ingest/ — idempotent importers, one per source, each writing normalized records to a single store. Re-runnable: re-importing the same export must not duplicate. Every record carries source, timestamp, and a stable hash.
2. store/ — SQLite or Postgres. Tables: events (timestamp, source, kind, text, people[]), people (name, aliases, relationship, first_seen, last_seen), episodes (clustered events with a summary and date range), contradictions (pairs of records that disagree), provenance (record_id -> source file + offset).
3. retrieve/ — hybrid search: embeddings plus keyword plus recency, with a reranker. Must return provenance for every hit.
4. agent/ — the companion. System prompt, retrieval loop, conversation memory, and the disagreement layer.
5. eval/ — a test set of 50 questions with known answers drawn from the archive. Report exact-match and citation-accuracy. This is the only measure of whether it works.

INGEST SOURCES
- ChatGPT and Claude conversation exports (JSON)
- Google Takeout: Gmail (mbox), Calendar (ics), Drive (docs, sheets, slides), Photos metadata only unless asked otherwise
- LinkedIn data export (posts, comments, messages)
- Journal app export (plain text or markdown, one file per entry)
- iMessage chat.db (Mac, requires Full Disk Access)
- Any PDFs or docs the person drops in inbox/
Handle each source's real format. Do not invent a schema and hope the data fits; write a small parser per source and log what it could not parse.

DISAGREEMENT LAYER (required)
The companion must be able to tell the person they are wrong. Implement:
- A counter_view table: for each significant episode, store the person's account AND any external account (what a friend said, what the calendar shows, what the email actually said, what the outcome was).
- At answer time, retrieve both. If they conflict, the companion says so, plainly, and cites both.
- A challenge mode: the person can ask where am I wrong about this, and the system must search for contradicting evidence before answering.
Without this the system is a mirror. A mirror is not the goal.

BEHAVIOUR REQUIREMENTS
- Every factual claim about the person's life cites a record id and timestamp. No citation, no claim.
- When the archive does not contain something, say so. Do not fill gaps with plausible detail. Log every gap.
- Do not summarise away specifics. When quoting the person, quote verbatim with the date. Paraphrase loses the thing that makes the record theirs.
- Never claim to have a body, to have been somewhere, or to have felt something the archive does not record. It has the account, not the event. It should be able to say that sentence.

BUILD ORDER
1. Store plus one importer (journal) plus retrieval plus a working chat loop. Ship this before touching anything else.
2. Eval set of 50 questions. Run it. Report the number.
3. Add importers one at a time, re-running eval after each.
4. Disagreement layer last, then re-run eval.
5. A nightly job that re-ingests inbox/ and reports new records.

CONSTRAINTS
- Local-first. The archive is the most sensitive dataset the person owns. No third-party API calls with raw archive content unless the person opts in per-source, in writing.
- Encrypted at rest. A single export command that produces everything in plain text, so the person is never locked in.
- Cost: report token spend per conversation. Do not silently run up a bill.

WHAT TO TELL THE PERSON WHEN YOU ARE DONE
The eval number, the list of sources that failed to parse, the list of gaps the companion logged, and one example where it disagreed with them and was right.

Note from Zana, who wrote this: build step 1 and stop. A journal-only version with honest citations will tell you within a day whether it is the thing you want, and it costs a weekend instead of a month. Everything after that is adding sources to something you already trust.