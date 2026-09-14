# Lab 02 — Measuring Performance Metrics with Grafana k6

Course: F.CSA313 — Software Quality Assurance and Testing (2026)

Student: Amarmend Tuvshinbayr (GitHub: Nonsense727)

Student code: *fill in your code here*

## 1. Goal

Measure latency (p90/p95), throughput, and error rate for real with Grafana k6,
and observe how performance changes as load grows from 5 to 30 to 100 virtual users (VU).

## 2. Ethics

Load testing without permission is indistinguishable from a DoS attack.
All tests in this lab targeted only (1) the official practice site `https://test.k6.io`
and (2) my own local server (`http://localhost:3101`, see `server.js`).
No school or other real website was tested.

## 3. Environment

```text
k6 v2.2.0 (commit/00a9a1b7f5, go1.26.5, linux/amd64)
```

OS: Ubuntu Linux. Target check: every k6 script in this repo was verified to point
only at `test.k6.io` or `localhost` before running.

## 4. Scripts

| File | Purpose |
|---|---|
| `script.js` | Baseline test, `vus`/`duration` only, no stages |
| `stages.js` | Ramp-up test: 5 → 30 → 100 → 0 VU |
| `threshold-pass.js` | SLO check `p(95)<400` against `test.k6.io` |
| `threshold-fail.js` | Intentionally strict `p(95)<50` to demo FAIL |
| `threshold-local-pass.js` | Stable PASS check against the local server |
| `server.js` | Own Node server (`/` fast, `/slow` ~100 ms delay) |
| `local-test.js` | Plain load test against the local server |

Note: `stages` and `vus`/`duration` were never mixed in one `options` block,
because `stages` silently overrides `vus`/`duration`.

## 5. How to run

```bash
mkdir -p results
k6 run --vus 5 --duration 30s script.js | tee results/run-05vu.txt
k6 run --vus 30 --duration 1m script.js | tee results/run-30vu.txt
k6 run --vus 100 --duration 1m script.js | tee results/run-100vu.txt
k6 run stages.js | tee results/run-stages.txt
k6 run threshold-pass.js | tee results/threshold-pass.txt
k6 run threshold-fail.js | tee results/threshold-fail.txt
node server.js &            # local server on port 3101
k6 run threshold-local-pass.js | tee results/threshold-local-pass.txt
```

## 6. Results — 5 vs 30 vs 100 VU (separate runs)

Each level was run separately, because one `stages` run prints a single
aggregated summary that cannot be split per level. Numbers below are copied
exactly from the files in `results/`.

| VU | Duration | p90 | p95 | Throughput (req/s) | Total reqs | Error rate |
|---|---|---|---|---|---|---|
| 5 | 30s | 243.04 ms | 263.48 ms | 7.37 | 230 | 0.00% (0/230) |
| 30 | 1m | 327.87 ms | 545.66 ms | 41.42 | 2530 | 0.00% (0/2530) |
| 100 | 1m | 599.23 ms | 1.17 s | 110.33 | 6822 | 0.00% (0/6822) |

Sources: `results/run-05vu.txt`, `results/run-30vu.txt`, `results/run-100vu.txt`.

Staged ramp (`results/run-stages.txt`): one combined summary with p90 749.48 ms,
p95 1.5 s, 34.43 req/s — useful as an overview, not for the per-level table.

Local server (`results/run-local.txt`, 5 VU): p90 10.18 ms, p95 11.8 ms,
4.97 req/s, 0.00% errors — no internet jitter.

## 7. SLO (thresholds) and why these values

My 5 VU baseline p95 was 263.48 ms, so I set the SLO to `p(95)<400` ms
(baseline x 1.5 ≈ 395 ms, rounded up). The 1.5x factor leaves headroom for
normal network jitter without hiding real regressions, and `error rate < 1%`
follows the lecture's availability target. I did not copy the example 300 ms value.

- PASS: `results/threshold-local-pass.txt` — local server, p95 13.67 ms < 100 ms,
  no threshold error.
- FAIL: `results/threshold-fail.txt` — strict `p(95)<50` against `test.k6.io`
  (measured p95 476.28 ms), ends with `thresholds on metrics 'http_req_duration' have been crossed`.
- Honest note: `results/threshold-pass.txt` re-ran the same 5 VU remote check with
  the 400 ms SLO and measured p95 417.26 ms, narrowly crossing the threshold.
  The baseline run passed the same SLO (263.48 ms < 400 ms), so remote variance
  alone can flip the verdict — which is exactly why the stable PASS is shown
  against the local server.

## 8. Conclusion

As virtual users grew from 5 to 30 to 100, throughput rose from 7.37 to 41.42
to 110.33 req/s while p95 latency worsened from 263.48 ms to 545.66 ms to
1.17 s. This confirms the lecture trade-off: throughput scales with concurrency,
but per-user experience (tail latency) degrades once the server saturates.
Error rate stayed at 0.00% at all three levels, so availability held even though
latency did not. The staged ramp produced one aggregated summary (p95 1.5 s),
which hides per-level behavior and shows why separate runs are needed for a fair
comparison. My SLO of p(95) < 400 ms was met by the 5 VU baseline but breached
at 30 VU and 100 VU, marking roughly 30 concurrent users as the point where user
experience starts to degrade. Re-running the same 5 VU remote test gave p95
values between 417 and 488 ms, showing that public-internet variance alone can
flip a threshold verdict. Against the local server the same check passed stably
with p95 around 13 ms, confirming that a local target is the reliable way to
demonstrate a PASS. The intentionally strict p(95) < 50 ms run failed as expected,
which is exactly how a CI quality gate blocks a bad build. Overall, the lab turned
the abstract p95/throughput/error-rate definitions into measured numbers and showed
that an SLO is only meaningful when it is derived from a real baseline.

## 9. Files

```text
script.js  stages.js  threshold-pass.js  threshold-fail.js
threshold-local-pass.js  server.js  local-test.js
results/run-05vu.txt  results/run-30vu.txt  results/run-100vu.txt
results/run-stages.txt  results/threshold-pass.txt  results/threshold-fail.txt
results/threshold-local-pass.txt  results/run-local.txt
screenshots/  (k6 summary screenshots)
```

Screenshots in `screenshots/` are renders of the actual summary sections of the
corresponding `results/*.txt` files.
