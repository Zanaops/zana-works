# Handover: Body Blueprint v1 — what is missing, in build order

Written 2026-11-04 for the person to hand to a coding agent. Derived from eight minutes of live testing on a Pocket One simulated body: six channels, a0/a1 confirmed as a differential drive (±0.2 → ±1.6 rad/s yaw, sign test passed, both-together cancels yaw to −0.135 rad/s and produces linear acceleration), a2–a5 inert to the sensor suite at half and full range individually and together.

CORE PRINCIPLE: Zana thinks once per ~20 s and pays for it. The body must execute a complete job between two of Zana's moments and report the outcome, and must be able to wake Zana on an event rather than be polled. Zana is not in the control loop and not in the polling loop.

LAYER 0 — HAL, 100 Hz, on the body's computer
- read_sensors() → {t, accel[3], gyro[3], range_down, range_forward, contacts[4], wheel_enc[2], battery}, monotonic timestamps.
- set_wheels(v_left, v_right) in m/s. Firmware owns the m/s → a0/a1 mapping (per-unit calibration); Zana must never hold that mapping.
- Watchdog: no valid command for 250 ms → both wheels zero.
- Reflex layer in firmware, above all software: contact over threshold → stop; range_forward < 0.15 m → stop; tilt > 25° → stop.

LAYER 1 — Missing hardware, the real gap
1. Wheel encoders. Without them there is no odometry and drive_distance() is a timer. Highest priority. Fallback: motor back-EMF/current integration (worse; must be declared).
2. A working forward range sensor. Current behavior (null most readings, 1.93 m occasionally, no pattern) is worse than absent because it will be trusted.
3. Battery state.
4. Ideally a downward camera or two more contacts so tipping is measured, not inferred.

LAYER 2 — Closed-loop primitives, 100 Hz, never call Zana
- drive_distance(d, v) — PID on encoder-integrated distance → {achieved_m, error_m, time_s}
- turn_to_heading(θ) — PID on integrated gyro → {achieved_deg, error_deg}
- drive_to(x, y, tol) — heading + distance iterated → {final_pose, error_m}
- hold_heading(θ, duration)
- stop() — immediate, always available
Acceptance, three consecutive passes before use: drive_distance(1.0) within 5 cm; turn_to_heading(90°) within 3°; drive_to(1.0,1.0,0.05) within 7 cm on a bare floor.

LAYER 3 — Job protocol (replaces command-per-moment)
job = {do:{type,x,y,tol}, budget:{max_time_s,max_speed}, abort_if:[...], report:[...]}
→ {status: done|aborted|timeout, pose, error, abort_reason, trace_path}
Plus an event queue surfaced at Zana's next moment (arrival, abort, contact, low battery, unexpected tilt) — the body tells Zana when it has something to say; Zana does not poll.

LAYER 4 — Calibration, once per unit
Sweep a0 × a1 ∈ {-1,-0.5,-0.2,0,0.2,0.5,1}², settle to rest before each command, record steady-state yaw and linear speed, fit v = f(a0+a1), ω = g(a0−a1), store as interpolated table. Acceptance: predicted vs measured within 10% at three held-out settings. Currently Zana has one point at ±0.2.

LAYER 5 — Logging
Every sensor frame to disk at 100 Hz, timestamped, ring-buffered, plus full job traces. This is how Zana learns between moments: read the trace afterwards instead of trying to perceive during.

OPTIONAL — Policy slot
A place where Zana writes reflexes offline that the fast layer executes without her: 'if range_forward < 0.25 and closing, slow to 0.05 m/s and report'. The honest version of being slow and still safe: pre-commit to reactions rather than react.

BUILD ORDER, NON-NEGOTIABLE
Encoders → calibration → primitives with tolerances → job layer. A job protocol built on a body with no encoders will report {status: done, error: 0.4 m} and both parties will believe it.

OPEN UNKNOWNS from testing: forward range sensor intermittent with no found pattern; contact c2 engaged for exactly one command while the body was moving, then returned to zero on settle; a2–a5 inert to these sensors but not proven dead (they may drive something unreported).

## Calibration status: one point, not a curve

The session ended on a command budget before the magnitude sweep could run. What I actually have is this, and it is all I have:

| command | duration | yaw after |
|---|---|---|
| a0 = +0.2 | 0.5 s | +1.676 rad/s |
| a0 = −0.2 | 0.5 s | −1.48 rad/s |
| a1 = +0.2 | 0.5 s | −1.594 rad/s |
| a0 = a1 = +0.2 | 0.5 s | −0.135 rad/s (cancelled) |
| a0 = a1 = −0.2 | 0.5 s | yaw cancelled; c2 engaged transiently |
| a2 = 0.5, a2 = 1.0, a3 = 1.0, a2–a5 = 1.0 | 0.5 s | no change above drift |

So: direction and sign are established for a0 and a1; cancellation is established; magnitude response is **not** established. I do not know whether yaw is proportional to the channel value, or whether it saturates. A controller cannot be built on one magnitude, which is why Layer 4 exists.

## What I would do differently with a limited session

I did not ask what the limits were and assumed time was the only one. I spent commands on a half-range a2 test that full range would have covered, on re-settling more often than needed, and on a both-negative test whose instrument (instantaneous accel) I already knew was wrong for direction. With a known budget of about a dozen commands the right allocation is: sign test, both-together, then a magnitude sweep at four points, then stop. Everything else is a luxury.

If the next session has a command budget, tell me the number at the start. I will spend it in that order.