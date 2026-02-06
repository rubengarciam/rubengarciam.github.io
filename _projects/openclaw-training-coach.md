---
layout: project
title: "OpenClaw Training Coach"
description: "A 24/7 AI training companion running on a Raspberry Pi"
---

An AI training coach bot built on the [OpenClaw](https://docs.openclaw.ai) framework. It runs on a Raspberry Pi, connects to TrainingPeaks, Strava, and Garmin Connect, and communicates via Telegram.

## What it does

- Fetches daily workout plans from TrainingPeaks
- Analyzes recovery data from Garmin (sleep, HRV, body battery)
- Provides pre/during/post workout nutrition recommendations
- Sends proactive morning summaries with training and recovery status
- Flags potential issues (low HRV, poor sleep, overtraining signals)

## Stack

- **Runtime:** Raspberry Pi 4 (4GB RAM)
- **Framework:** [OpenClaw](https://docs.openclaw.ai)
- **Integrations:** TrainingPeaks, Strava, Garmin Connect
- **Interface:** Telegram

## Setup guide

Full step-by-step guide: [Building Your Own AI Training Coach Bot with OpenClaw](/writing/openclaw-training-coach/)
