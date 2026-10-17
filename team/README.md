# Team guide - start here

Every teammate has one file in this folder.
Open yours, do the "Setup" part once, then copy the whole "Prompt for Claude" block into Claude Code.
Claude does the coding; you check the result in the browser and tell Claude what looks wrong.

| Who | File | What you build |
|---|---|---|
| Sam | [SAM.md](SAM.md) | Elderwise's brain: how Claude answers (prompts + 10 test situations) |
| Ahmet | [AHMET.md](AHMET.md) | Photos: realistic demo images + photo preview in the Talk tab |
| MaRie | [MARIE.md](MARIE.md) | Answer cards: reminder (add to calendar), steps, explain, empty state |
| Endrik | [ENDRIK.md](ENDRIK.md) | "Tell Anna" button that really sends a message + Profile + accessibility |

Live app: https://elderwise-beryl.vercel.app
Design: https://app.paper.design/file/01M54P2AW7DMM9SRH5B5DKTZ5M
Deadline: everything merged by **15:30** (submission is 16:00).

## Golden rules

1. Only touch the files listed in your guide. That way nobody breaks anybody else.
2. Commit and push small steps, at least every 30 minutes.
3. When your part works, open a Pull Request. If `npm run lint` and `npm run build` pass and it works in the browser, **merge it yourself** (squash: `gh pr merge --squash`), then `git checkout main && git pull`. Batu redeploys the live app.
6. After merging, let your Claude look at the live app and the code and **suggest 1-3 new improvements** as a new GitHub issue (title starts with your name), then build the best one.
4. Never put an API key into a file that gets committed. Keys only go in `.env`.
5. Stuck for more than 10 minutes? Tell Claude exactly what you see (copy the error), or ask Batu.

## Setup (everyone, once, ~5 minutes)

1. Accept the GitHub invite: https://github.com/BatuCani/elderwise/invitations
2. Open the Terminal app and run these lines one by one:

```bash
git clone https://github.com/BatuCani/elderwise
cd elderwise
cp .env.example .env
```

3. Open the file `.env` in any text editor and paste your Claude API key after `ANTHROPIC_API_KEY=` (it starts with `sk-ant-`). Save.
4. Install and start the app:

```bash
npm install
npm run dev
```

5. Open http://localhost:3000 in Chrome. You should see "How can I help?".
   Leave this Terminal window open; it keeps the app running.
6. Open a **second** Terminal window, go into the folder and start Claude:

```bash
cd elderwise
claude
```

   **Use your own API credits for Claude Code:** the first time Claude Code starts, choose **"Anthropic Console account"** and log in with the Console account where you claimed the $100 credits (not a Claude.ai subscription).
   Already logged in with something else? Type `/logout` inside Claude Code, quit, start `claude` again and pick the Console account.
   (Alternative: run `export ANTHROPIC_API_KEY=sk-ant-...your key...` in that Terminal window before `claude`.)

7. Paste the prompt from your guide. Done.
