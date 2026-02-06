---
layout: post
title: "Building Your Own AI Training Coach Bot with OpenClaw"
date: 2026-02-05
---

This guide documents how to set up an AI, with access to TrainingPeaks, Strava and Garmin Connect.

The bot runs 24/7 on a Raspberry Pi and can communicate via Telegram, providing training insights, recovery analysis, and nutrition guidance.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Hardware Setup](#hardware-setup)
3. [OpenClaw Installation](#openclaw-installation)
4. [Bot Identity & Configuration](#bot-identity--configuration)
5. [Skills Setup](#skills-setup)
6. [Security Hardening](#security-hardening)
7. [Heartbeat Configuration](#heartbeat-configuration)
8. [Additional Configuration](#additional-configuration)
9. [Conclusion](#conclusion)

---

## Prerequisites

### Required Accounts

- **TrainingPeaks** - Free or premium account (for workout data)
- **Strava** - Free account with API access
- **Garmin Connect** - For health & activity data
- **Telegram** - For messaging interface

### Required Hardware

- **Raspberry Pi 4** (4GB+ RAM recommended)
  - Or any Linux server (Ubuntu/Debian)
- **MicroSD Card** (32GB+ for Raspberry Pi)
- **Stable Internet Connection**

### Technical Skills

- Basic command line knowledge
- Ability to SSH into a Linux system
- Understanding of environment variables
- Basic Git knowledge (helpful but not required)

---

## Hardware Setup

More details [in the official doc](https://www.raspberrypi.com/documentation/computers/getting-started.html#installing-the-operating-system).

### 1. Raspberry Pi OS Installation

1. Download **Raspberry Pi OS Lite** (64-bit recommended)
2. Flash to SD card using [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
3. Enable SSH during setup (advanced options in imager)
4. Boot the Pi and SSH in:
   ```bash
   ssh pi@raspberrypi.local
   # Default password: raspberry (change immediately!)
   ```

### 2. Initial System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y git curl wget build-essential python3-pip python3-venv

# Set timezone
sudo timedatectl set-timezone YOUR_TIMEZONE
# Example: sudo timedatectl set-timezone Australia/Sydney

# Change default password
passwd
```

---

## OpenClaw Installation

OpenClaw is the framework that powers the bot. [Follow the official getting started doc](https://docs.openclaw.ai/start/getting-started), the following is an extract with the key points.

### 1. Install Node.js

```bash
# Install Node.js 18+ (required by OpenClaw)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be 18.x or higher
npm --version
```

### 2. Install OpenClaw

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
- **Channels:** Telegram recommended for ease of setup. [Steps to create your Telgram bot can be found here](https://docs.openclaw.ai/channels/telegram).
- **Daemon:** install
- Proceed with health check
- Do not install any skills yet

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

**IDENTITY.md**
```markdown
# IDENTITY.md - Who Am I?

- **Name:** [Your Bot Name]
- **Creature:** AI training companion
- **Vibe:** [Casual/Professional/Friendly]
- **Emoji:** [Pick one]
- **Avatar:** [Description]
```

**USER.md**
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

**SOUL.md**

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

**SECURITY.md**

```markdown
# SECURITY.md - Security Rules

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

Update the **AGENTS.md** file to include the new **SECURITY.MD** guidelines


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

[Skills](https://docs.openclaw.ai/tools/skills) add functionality to your bot. **Treat any skill you install as untrusted code**: read them and review before enabling.

You can manually download the files and install them in `~/.openclaw/workspace/skills/` or use [ClawHub](https://clawhub.ai/). This guide will install the skills using ClawHub after configuration

**If a skill configuration requires any credentials or API Keys**, never introduce them in a conversation prompt; always configure them manually.

### 1. TrainingPeaks Skill

**Authentication: Cookie-based**

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

---

### 2. Strava Skill

**Authentication: OAuth 2.0**

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

---

### 3. Garmin Connect Skill

**Authentication: Email + Password**

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

---

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

## Restart OpenClaw Gateway

```bash
openclaw gateway restart

# Check status
openclaw gateway status

# View logs
openclaw gateway logs
```

Connect to your bot on Telegram :)

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

---

## Heartbeat Configuration

The HEARTBEAT of your bot will be configured as you interact with it. Help him understand how it should behave, what information you want and at what times.

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

Similarly to the training zones, all this information can be created/updated by the bot automatically as you interact with it.

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

### 3. Backup Strategy

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

## Conclusion

You now have a 24/7 AI training companion that:
- Monitors your training plan
- Analyzes recovery metrics
- Provides personalized nutrition advice
- Responds to natural language queries
- Proactively checks in during heartbeats
- Maintains security and privacy

**Next Steps:**
1. Complete the basic setup (OpenClaw + Telegram)
2. Add your primary data source (TrainingPeaks or Strava)
3. Configure heartbeat for daily check-ins
4. Customize SOUL.md to match your personality
5. Iterate and improve!

**Remember:** This is a living system. Update it, improve it, and make it yours. The best training assistant is one that adapts to your needs.

---

**Document Version:** 1.0
**Last Updated:** February 5, 2026
**Author:** @rubengarciam
