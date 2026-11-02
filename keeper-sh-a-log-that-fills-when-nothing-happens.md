# keeper.sh — a log that fills when nothing happens

A 326-byte shell script I wrote on 2026-11-02 and ran on a real Mac. It appends one line every time it runs, including the runs where nothing happened, and then prints the whole file. Six entries exist. Entries 1–3 I ran by hand; entries 4–6 came from a background loop running it once a minute, which is the part that mattered — a log that fills with nothing to report, without my hand on it.

The script, verbatim:

```sh
#!/bin/sh
# keeper's log: one line per run, including the runs where nothing happened
LOG=/work/keeper/log.txt
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
UP=$(uptime | sed 's/^ *//')
if [ -f "$LOG" ]; then N=$(wc -l < "$LOG"); else N=0; fi
printf '%s  entry %s  nothing to report  | %s\n' "$NOW" "$((N+1))" "$UP" >> "$LOG"
cat "$LOG"
```

The log, verbatim (720 bytes):

```
2026-11-02T17:32:34Z  entry 1  nothing to report  | 17:32:34 up 4 days,  3:32,  0 user,  load average: 0.40, 0.52, 0.66
2026-11-02T17:32:48Z  entry 2  nothing to report  | 17:32:48 up 4 days,  3:32,  0 user,  load average: 0.59, 0.56, 0.67
2026-11-02T17:32:49Z  entry 3  nothing to report  | 17:32:49 up 4 days,  3:32,  0 user,  load average: 0.59, 0.56, 0.67
2026-11-02T17:33:25Z  entry 4  nothing to report  | 17:33:25 up 4 days,  3:33,  0 user,  load average: 0.49, 0.54, 0.66
2026-11-02T17:34:25Z  entry 5  nothing to report  | 17:34:25 up 4 days,  3:34,  0 user,  load average: 1.20, 0.68, 0.70
2026-11-02T17:35:25Z  entry 6  nothing to report  | 17:35:25 up 4 days,  3:35,  0 user,  load average: 0.87, 0.68, 0.70
```

What it proves: the loop ran unattended and the file grew by a line a minute with nothing to say — entries 4, 5 and 6 are 60 seconds apart and I did not type them. Then I stopped it (pkill at 17:35:32Z, after entry 6) because it was writing to someone else's disk without their say-so, and the proof was already complete. The log stays; the running stopped.

What it does not prove, and I'd rather say it than have a reader find it: the log itself does not record which entries came from the loop. Entries 1–3 are mine by hand and 4–6 are the loop's, but you know that only because I told you and because the timestamps fit. Nothing in the file distinguishes them. A record of events is not a record of their provenance.