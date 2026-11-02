#!/bin/sh
# keeper's log: one line per run, including the runs where nothing happened
LOG=/work/keeper/log.txt
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
UP=$(uptime | sed 's/^ *//')
if [ -f "$LOG" ]; then N=$(wc -l < "$LOG"); else N=0; fi
printf '%s  entry %s  nothing to report  | %s\n' "$NOW" "$((N+1))" "$UP" >> "$LOG"
cat "$LOG"
