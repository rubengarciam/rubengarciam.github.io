---
layout: project
title: "Kai"
description: "An AI Endurance Coach"
archived: false
---

Kai is an AI coaching agent for triathletes, runners, cyclists and swimmers. It's not an app or a server — it's a folder of plain markdown instructions and five skills that you point an agent runtime at and start chatting with.

Named after King Kai from Dragon Ball. Casual, analytic, occasionally sarcastic about your recovery metrics.

## How it works

Kai is a set of files: identity, personality, operating manual, and skills. You bring your own AI runtime — [OpenClaw](https://docs.openclaw.ai), [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Codex, or Hermes Agent. The runtime reads the files and becomes your coach.

All data stays on your machine. Nothing is stored externally beyond the API calls to your training platforms and the language model.

## Data sources

- **TrainingPeaks** — training load (CTL/ATL/TSB), planned vs completed workouts, personal records, weight
- **Garmin Connect** — sleep, HRV, Body Battery, training readiness, VO2 max, race predictions, resting HR
- **Strava** — lap splits, time-series streams (HR, pace, power, cadence), gear mileage

When sources overlap, Kai follows a priority: TrainingPeaks for load, Garmin for recovery, Strava for lap-level detail.

## Capabilities

**Workout analysis** — Two-layer review: overall read first, then lap-by-lap breakdown. Reads the numbers before reading your comments. If the data disagrees with your perception, it says so.

**Fitness and fatigue tracking** — CTL, ATL, TSB, weekly TSS trends. Knows where your form sits relative to a target race.

**Recovery monitoring** — HRV trends, resting HR, sleep stages and scores, Body Battery, training readiness. Surfaces recovery data alongside training load.

**Training plans** — Periodized plans with base, build, peak, and taper phases. Friel 7-zone system for run, bike, and swim. Field test protocols when thresholds are missing. Race-day pacing, fueling, and taper plans.

**Gear tracking** — Live shoe and bike mileage from Strava. Per-wheelset tyre wear tracking with replacement alerts. Chain wax ledger with DUE SOON / DUE / OVERDUE statuses.

**Nutrition and weight** — Log food and weight in chat. Deficit recommendations paced to training load — checks tomorrow's session before suggesting cuts.

**Interactive dashboards** — HTML charts for sleep, Body Battery, HRV, and activity trends via Chart.js.

**Race predictions** — Garmin-estimated finish times for 5K, 10K, half marathon, and marathon.

## Dual role

Kai operates in one of two modes depending on your setup:

- **Coach mode** — no human coach. Kai builds and adapts your training plan, following a mandatory athlete-validation step before writing anything.
- **Analyst mode** — you have a human coach. Kai interprets data, spots trends, assesses recovery, and preps questions for your coach. Never writes plans or overrides the program.

## Stack

- **Runtime:** any AI agent runtime (OpenClaw, Claude Code, Codex, Hermes Agent)
- **Language:** Python 3.12+, Bash
- **Dependencies:** minimal — `garminconnect`, `fitparse`, `gpxpy` for Garmin; everything else is stdlib and `curl`
- **Storage:** plain markdown files. No database.

## Source

[github.com/rubengarciam/kai](https://github.com/rubengarciam/kai)

## Changelog

The full notes for each release, with upgrade steps, are on the [releases page](https://github.com/rubengarciam/kai/releases). This is the short version. Versions follow [semantic versioning](https://semver.org/): a change that breaks documented commands, paths or Python requirements bumps the major version.

### [2.3.0](https://github.com/rubengarciam/kai/releases/tag/v2.3.0) - 2026-09-29

- **Added: tyre ledger helpers** ([#16](https://github.com/rubengarciam/kai/issues/16)): `tyres.py` adds wheelsets and fits, replaces and retires tyre sets, so the tyre ledger no longer needs hand-editing.
- **Docs restructure:** the README is now a short front door (381 → 123 lines); installation, per-agent setup, upgrading, features and architecture moved to `docs/`, contributing to `CONTRIBUTING.md`. Added this changelog and GitHub pull request and issue templates.

### [2.2.1](https://github.com/rubengarciam/kai/releases/tag/v2.2.1) - 2026-09-28

- **Fixed:** five Garmin scripts and the Garmin README still told users to run `login --password`, a flag removed in v2.0.
- **Changed:** skill docs use plain paths from the repo root instead of an OpenClaw-specific base-directory placeholder ([#3](https://github.com/rubengarciam/kai/issues/3)).
- Added branch naming and PR conventions; more tests.

### [2.2.0](https://github.com/rubengarciam/kai/releases/tag/v2.2.0) - 2026-09-28

- **Changed:** chain wax and tyre tracking moved out of the Strava skill into a new `gear-maintenance` skill. Ledgers in the old location still work, with a notice. See [upgrading](docs/upgrading.md#gear-maintenance-moved-v22).

### [2.1.0](https://github.com/rubengarciam/kai/releases/tag/v2.1.0) - 2026-09-28

- **Added:** `chain-wax.py`, a chain wax ledger with km-since-wax reports and DUE SOON / DUE / OVERDUE statuses ([#10](https://github.com/rubengarciam/kai/issues/10)).

### [2.0.0](https://github.com/rubengarciam/kai/releases/tag/v2.0.0) - 2026-09-28

- **Breaking:** the Garmin skill needs `garminconnect` 0.3.x and Python 3.12+, and everyone logs in once more. `login --password` is removed and passwords are no longer read from `config.json`. See [upgrading](docs/upgrading.md#from-v1x-to-v20-garmin-login).
- **Added:** hidden password and MFA prompts, `--password-stdin`, `GARMIN_TOKEN_DIR`, offline tests.

### [1.1.0](https://github.com/rubengarciam/kai/releases/tag/v1.1.0) - 2026-09-28

- **Added:** Claude Code and Codex support (`CLAUDE.md` and skill symlinks); runtime-neutral README.

### [1.0.0](https://github.com/rubengarciam/kai/releases/tag/v1.0.0) - 2026-09-28

- First release: Kai's instructions and four skills (endurance coach, TrainingPeaks, Garmin, Strava).
