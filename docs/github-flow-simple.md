# Simple GitHub Flow for This Project

This guide is for day-to-day work on this project.

Goal:
- Your work and your friend's work should stay in sync.
- No confusion about branches.
- Clean pull requests.

## 1) First time each day

Open terminal in project root (PERSONALISED-AI-TUTOR), then run:

git checkout main
git pull origin main

This gives you the latest code.

## 2) Create your working branch

Use a clear branch name format:

svg-feature/topic-name

Examples:
- svg-feature/reflection-angle-hints
- svg-feature/misconception-targeted-teaching
- svg-feature/quiz-feedback-ui

Create and switch:

git checkout -b svg-feature/topic-name

## 3) Do your work normally

While coding, commit in small parts.

Check files:

git status

Add files:

git add .

Commit:

git commit -m "Add targeted teaching flow for reflection misconception"

## 4) Push your branch

git push -u origin svg-feature/topic-name

Now your branch is on GitHub.

## 5) Create Pull Request

In GitHub:
- Base branch: main
- Compare branch: your svg-feature branch
- Add a simple title and short description

Example title:
Add targeted teaching flow after quiz report

## 6) Keep your branch updated while PR is open

If main gets new commits, update your branch:

git checkout main
git pull origin main
git checkout svg-feature/topic-name
git merge main

If there is a conflict, fix it, then:

git add .
git commit

git push

## 7) After PR is merged

Update local main:

git checkout main
git pull origin main

Delete local feature branch:

git branch -d svg-feature/topic-name

Delete remote feature branch:

git push origin --delete svg-feature/topic-name

## 8) Golden rules (very important)

- Never work directly on main.
- Always pull main before starting new work.
- Use one feature branch for one task.
- Commit small and clear.
- Do not commit venv or node_modules.
- If unsure, check branch before coding:

git branch --show-current

## 9) Quick emergency checks

If your app looks different from your friend's app, both of you should run:

git branch --show-current
git rev-parse --short HEAD

If branch name and commit id are the same, code is the same.

## 10) Suggested branch names for your current project

- svg-feature/misconception-targeted-teaching
- svg-feature/reflection-remediation-stage
- svg-feature/quiz-to-remediation-routing
- svg-feature/audio-teaching-sync
