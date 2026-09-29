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

{% include changelogs/kai.md %}
