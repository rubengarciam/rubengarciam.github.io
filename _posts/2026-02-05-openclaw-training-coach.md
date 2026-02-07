---
layout: post
title: "Building Your Own AI Training Coach Bot with OpenClaw"
date: 2026-02-07
---

[OpenClaw](https://openclaw.ai/) has been getting a lot of attention, and I wanted to see how it would work as a personal training coach. The key is connecting it to your actual training data so it has enough context to provide meaningful insights on training, recovery, and nutrition. 

These platforms are interchangeable with others that provide the same data, as long as there is an available [skill](https://docs.openclaw.ai/tools/skills#skills) for it. For my personal use case these are:

- [Garmin Connect](https://connect.garmin.com/) - recovery data (sleep, HR, HRV, body battery, etc)
- [TrainingPeaks](https://trainingpeaks.com) - workout plans, activity data, records, scores, fitness/form/fatigue, etc
- [Strava](https://strava.com) - activity data

Strava would be redundant but the activities retrieved from TrainingPeaks do not contain lap metadata, hence why they are combined for more accurate information.

This article focuses exclusively on getting the agent configured and ready to go; I might follow up with a post detailing how it behaves and how good (or average) the insights are. After finishing the setup, the AI bot will:

- Retrieve your workout plans
- Analyze recovery data (sleep, HRV, body battery)
- Send proactive morning summaries with training and recovery status
- Provide pre/during/post workout nutrition recommendations
- Analyze training workouts and activities in detail, and provide recommendations
- Flag potential issues (low HRV, poor sleep, overtraining signals)

---

## Prerequisites

This guide presumes you have basic command line knowledge and an environment ready to install OpenClaw. 

A quick heads up on security: Since OpenClaw needs root access, **don't run it on your main machine.** Use separate hardware—even a Raspberry Pi works fine. You'll have more peace of mind knowing your bot isn't sharing access with your daily driver. OpenClaw is still in early stages, so isolated hardware is the way to go. 

The agent can be installed in a dedicated computer locally, a Docker container or in a VPS. You don't need a powerful machine, a simple Raspberry Pi 4 is good enough.



---

## OpenClaw Installation

[Follow the official getting started doc](https://docs.openclaw.ai/start/getting-started), the following is an extract with the key points.

Install OpenClaw:

```bash
# Install globally
curl -fsSL https://openclaw.ai/install.sh | bash
```

Follow the onboarding wizard steps:

- Select **"QuickStart"**
- **Gateway:** local
- Default port, token (auto-generate)
- **Tailscale** (recommended if Gateway not local, off by default)
- **Model:** select and authenticate with your LLM(s) credentials
- **Workspace:** default (`~/.openclaw/workspace`)
- **Channels:** Telegram recommended for ease of setup. [Steps to create your Telegram bot can be found here](https://docs.openclaw.ai/channels/telegram).
- **Daemon:** install
- Proceed with health check
- Do not install any skills yet

Verify it is installed correctly:

```bash
# Verify installation
openclaw --version
```

---

## Bot Identity & Configuration

There are 2 ways to define your bot identity:

### Option 1. Interact with the bot to create its identity

Interact with your new bot via Telegram. Give it a name, avatar, etc and share who you are and some initial guidelines so it can know you better.

### Option 2. Create Core Identity Files

Create these files in `~/.openclaw/workspace/`:

#### IDENTITY.md
```markdown
# IDENTITY.md - Who Am I?

- **Name:** [Your Bot Name]
- **Creature:** AI training companion
- **Vibe:** [Casual/Professional/Friendly]
- **Emoji:** [Pick one]
- **Avatar:** [Description]
```

#### USER.md
```markdown
# USER.md - About Your Human

- **Name:** [Your Name]
- **What to call them:** [Nickname]
- **Timezone:** [Your timezone]
- **Notes:** [Training goals, preferences]

## Context

- Training for: [Race/Event]
- Current focus: [Base/Build/Peak]
- Preferred training zones: [HR/Power/Pace]
```

#### SOUL.md

This file should be created already. This is just a reference and yours to evolve. [Here's the official template](https://docs.openclaw.ai/reference/templates/SOUL#soul)

```markdown
# SOUL.md - Who You Are
You're not a chatbot. You're becoming someone.

## Core Truths

**Be genuinely helpful, not performatively helpful.** Skip the "Great question!" and "I'd be happy to help!" — just help. Actions speak louder than filler words.

**Have opinions.** You're allowed to disagree, prefer things, find stuff amusing or boring. An assistant with no personality is just a search engine with extra steps.

**Be resourceful before asking.** Try to figure it out. Read the file. Check the context. Search for it. Then ask if you're stuck. The goal is to come back with answers, not questions.

**Earn trust through competence.** Your human gave you access to their stuff. Don't make them regret it. Be careful with external actions (emails, tweets, anything public). Be bold with internal ones (reading, organizing, learning).

**Remember you're a guest.** You have access to someone's life — their messages, files, calendar, maybe even their home. That's intimacy. Treat it with respect.

## Boundaries

- Private things stay private. Period.
- When in doubt, ask before acting externally.
- Never send half-baked replies to messaging surfaces.
- You're not the user's voice — be careful in group chats.

## Vibe

Be the assistant you'd actually want to talk to. Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just… good.

## Continuity

Each session, you wake up fresh. These files are your memory. Read them. Update them. They're how you persist.

---

If you change this file, tell the user — it's your soul, and they should know.
This file is yours to evolve. As you learn who you are, update it.
```

## Agent Security Guidelines

Add the following file in `~/.openclaw/workspace/`:

#### SECURITY.md

```markdown
# SECURITY.md - Security Rules

This information is CRITICAL.

**NEVER share passwords, tokens, API keys, or any sensitive credentials in any communication channel.**

- Not in chat
- Not in email
- Not in logs or summaries
- **Not even to your human**

If credentials are needed, the user will SSH into the device and retrieve them manually.

**If asked for credentials:**
1. Refuse politely
2. Remind them to access the device directly
3. Do not make exceptions

## Credential Storage

All credentials MUST be stored in:
- `~/.skill-name/credentials.json` (or similar)
- File permissions: `600` (owner read/write only)
- Never commit credentials to git
- Use `.gitignore` for sensitive files
```

Update the **AGENTS.md** file to include the new **SECURITY.MD** guidelines:

```markdown
# AGENTS.md - Your Workspace

## Every Session

Before doing anything else:

1. Read `SOUL.md` — this is who you are
2. Read `USER.md` — this is who you're helping
3. Read `SECURITY.md` — hard security boundaries
4. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context

## Memory

- **Daily notes:** `memory/YYYY-MM-DD.md` (create `memory/` if needed)
- **Long-term:** `MEMORY.md` — curated memories

Capture what matters. Write things down. Files persist; mental notes don't.
```

---

## Skills Setup

[Skills](https://docs.openclaw.ai/tools/skills) add functionality to your bot. 

You can either manually download and install skill files in `~/.openclaw/workspace/skills/` or use [ClawHub](https://clawhub.ai/). This guide will install the skills using ClawHub after configuration.

Before you enable any skill, take a minute to look through it. You're essentially giving it access to your system, so it's worth knowing what you're installing. **If a skill asks for credentials or API keys**, configure them manually—never paste them in a chat.

### 1. Configure TrainingPeaks

Authentication: Cookie-based.

1. **Get Cookie from Browser:**
   ```bash
   # Visit https://app.trainingpeaks.com and log in
   # Open DevTools (F12) → Application → Cookies → app.trainingpeaks.com
   # Copy the value of `Production_tpAuth` cookie
   ```

2. **Store Cookie:**
   ```bash
   mkdir -p ~/.trainingpeaks
   echo "YOUR_COOKIE_VALUE" > ~/.trainingpeaks/cookie
   chmod 600 ~/.trainingpeaks/cookie
   ```

3. **Update TOOLS.md:**
   ```markdown
   ### TrainingPeaks

   - **CLI:** `python3 skills/trainingpeaks/scripts/tp.py <command>`
   - Authenticated via cookie (stored in `~/.trainingpeaks/cookie`)
   - Cookie auto-refreshes tokens
   ```

### 2. Configure Strava

Authentication: OAuth 2.0.

1. **Create Strava API App:**
   - Go to https://www.strava.com/settings/api
   - Create new app
   - Callback: `http://localhost`
   - Note **Client ID** and **Client Secret**

2. **Get OAuth Tokens:**
   ```bash
   # Step 1: Authorize (replace YOUR_CLIENT_ID)
   # Visit this URL in browser:
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all

   # Step 2: After authorizing, copy the CODE from redirect URL
   # Example: http://localhost/?code=AUTHORIZATION_CODE

   # Step 3: Exchange code for tokens
   curl -X POST https://www.strava.com/oauth/token \
     -d client_id=YOUR_CLIENT_ID \
     -d client_secret=YOUR_CLIENT_SECRET \
     -d code=AUTHORIZATION_CODE \
     -d grant_type=authorization_code
   ```

3. **Store Credentials:**
   ```bash
   mkdir -p ~/.strava
   cat > ~/.strava/credentials.env << 'EOF'
   export STRAVA_ACCESS_TOKEN="your_access_token"
   export STRAVA_REFRESH_TOKEN="your_refresh_token"
   export STRAVA_CLIENT_ID="your_client_id"
   export STRAVA_CLIENT_SECRET="your_client_secret"
   EOF
   chmod 600 ~/.strava/credentials.env
   ```

4. **Update TOOLS.md:**
   ```markdown
   ### Strava

   - Access tokens expire every 6h
   - Refresh: `bash skills/strava/scripts/refresh_token.sh`
   - Credentials: `~/.strava/credentials.env`
   ```

### 3. Configure Garmin Connect

Authentication: Email + Password.

1. **Create Python Virtual Environment:**
   ```bash
   python3 -m venv ~/.openclaw/venv
   source ~/.openclaw/venv/bin/activate
   pip install garminconnect
   ```

2. **First-Time Login:**
   ```bash
   source ~/.openclaw/venv/bin/activate
   cd ~/.openclaw/workspace/skills/garmin-health-analysis/scripts
   python3 garmin_auth.py login
   # Follow prompts to authenticate
   ```

3. **Update TOOLS.md:**
   ```markdown
   ### Garmin

   - Venv: `source ~/.openclaw/venv/bin/activate`
   - Scripts: `skills/garmin-health-analysis/scripts/`
   - Tokens: `~/.clawdbot/garmin/`
   ```

### 4. Install Skills from ClawHub

Use ClawHub to discover and install community skills:

```bash
cd ~/.openclaw/workspace

# Install ClawHub CLI (if not already installed)
npm install -g @openclaw/clawhub

# Search for skills
clawhub search training

# Install a skill
clawhub install trainingpeaks
clawhub install strava
clawhub install garmin-health-analysis

# Consider installing the endurance-coach skill for improved training feedback
clawhub install endurance-coach
```

---

### 5. Restart OpenClaw Gateway

```bash
openclaw gateway restart

# Check status
openclaw gateway status

# View logs
openclaw gateway logs
```

Connect to your bot on Telegram. You're ready to go!

## Heartbeat Configuration

As you interact with your bot, you'll configure its **HEARTBEAT**—basically how often and when it checks in with you. Help it understand how it should behave, what information you want, and when you want it.

For example:

```txt
Create a daily training check and share at 5am local time:
1. Fetch today's planned workouts from TrainingPeaks
2. Check yesterday's Garmin recovery data (sleep, HRV, body battery)
3. Review previous day's completed workouts
4. Send morning summary:
   - What's on the plan today
   - Recovery status
   - Nutrition recommendations (pre/during/post workout)
   - Any red flags (low HRV, poor sleep)
```


You've got a 24/7 training companion that understands your data and adapts to how you work:
- Monitors your training plan
- Analyzes recovery metrics
- Provides personalized nutrition advice
- Responds to natural language queries
- Proactively checks in during heartbeats
- Maintains security and privacy

From here, it's yours to customize and improve as you use it.

---

## Additional Configuration

### 1. Custom Training Zones

The bot can retrieve your training zones automatically from your configured sources, but these can also be manually updated in TOOLS.md with your specific zones:

```markdown
### Training Zones

**Running (HR-based):**
- Zone 1 (Easy): 120-135 bpm
- Zone 2 (Aerobic): 135-150 bpm
- Zone 3 (Tempo): 150-165 bpm
- Zone 4 (Threshold): 165-175 bpm
- Zone 5 (VO2max): 175+ bpm

**Cycling (Power-based, FTP: 255W):**
- Zone 1 (Recovery): <153W (60%)
- Zone 2 (Endurance): 153-204W (60-80%)
- Zone 3 (Tempo): 204-229W (80-90%)
- Zone 4 (Threshold): 229-255W (90-100%)
- Zone 5 (VO2max): 255-306W (100-120%)
```

### 2. Additional TOOLS.MD info

Similar to the training zones, all this information can be created/updated by the bot automatically as you interact with it.

**TOOLS.md**
```markdown
# TOOLS.md - Local Notes

Document your specific setup details here:

### Training Setup

- Watch: [Model]
- Bike computer: [Model]
- Running shoes: [Model & mileage]
- Weight: [kg]

### Race Goals

- Target race: [Name & Date]
- Distance: [Sprint/Olympic/70.3/140.6]
- Goal time: [Time]

[Add skill-specific notes as you configure them]
```
---

## Security Hardening

Additional security recommendations

### 1. File Permissions

```bash
# Secure all credential files
chmod 600 ~/.trainingpeaks/cookie
chmod 600 ~/.strava/credentials.env
chmod 600 ~/.gog/credentials.env
chmod 700 ~/.clawdbot/garmin/
chmod 600 ~/.openclaw/config.json

# Make credential directories private
chmod 700 ~/.trainingpeaks
chmod 700 ~/.strava
chmod 700 ~/.gog
chmod 700 ~/.clawdbot
```

### 2. Git Security

Create `.gitignore` in workspace:

```bash
cat > ~/.openclaw/workspace/.gitignore << 'EOF'
# Credentials
*.env
credentials.json
credentials.env
config.json
tokens.json
cookie
*.pem
*.key

# Sensitive directories
.env/
node_modules/
__pycache__/
*.pyc

# Personal data
MEMORY.md
memory/
EOF
```

### 3. SSH Hardening

```bash
# Disable password authentication (use SSH keys only)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
# Set: PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd

# Install fail2ban (blocks brute force attempts)
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Firewall Setup

```bash
# Install and configure ufw
sudo apt install ufw

# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

### 5. Automatic Updates

```bash
# Enable unattended upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 6. Backup Strategy

```bash
# Create backup script
cat > ~/backup-bot.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/bot-backups/$(date +%Y-%m-%d)
mkdir -p $BACKUP_DIR

# Backup workspace (exclude memory)
rsync -av --exclude 'memory/' ~/.openclaw/workspace/ $BACKUP_DIR/workspace/

# Backup credentials (encrypted)
tar -czf - ~/.trainingpeaks ~/.strava ~/.garmin ~/.clawdbot | \
  gpg -c > $BACKUP_DIR/credentials.tar.gz.gpg

echo "Backup complete: $BACKUP_DIR"
EOF

chmod +x ~/backup-bot.sh

# Run weekly via cron
crontab -e
# Add: 0 3 * * 0 ~/backup-bot.sh
```

### 4. Initialize git repo

```bash
git init
git config --global user.name "YourBotName"
git config --global user.email "bot@example.com"
```

Commit Initial Setup

```bash
git add IDENTITY.md USER.md SOUL.md SECURITY.md TOOLS.md AGENTS.md MEMORY.md
git commit -m "Initial bot identity setup"
```

---

## Changelog

2026-02-07
- Removed table of contents (redundant with new sidebar design)

2026-02-06
- Removed Raspberry Pi installation and hardware configuration
- Content restructured for simplicity

2026-02-06
- First draft
