#!/usr/bin/env bash

set -euo pipefail

API_BASE="${API_BASE:-http://127.0.0.1:3001}"
email="smoke-$(date +%s)@example.com"

signup=$(curl -s -X POST "$API_BASE/api/auth/signup" -H 'Content-Type: application/json' -d "{\"email\":\"$email\",\"password\":\"secret123\",\"displayName\":\"Smoke Test\"}")
token=$(printf '%s' "$signup" | jq -r '.token')

curl -s -X POST "$API_BASE/api/auth/verify-school-email" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"schoolEmail":"smoke@nyu.edu"}' >/dev/null

activity=$(curl -s -X POST "$API_BASE/api/activities" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"activityType":"study","durationMinutes":60,"notes":"Smoke activity"}')

quest_id=$(printf '%s' "$activity" | jq -r '.progress.quests[] | select(.state == "completed") | .id' | head -n 1)

if [ -n "$quest_id" ] && [ "$quest_id" != "null" ]; then
  curl -s -X POST "$API_BASE/api/quests/$quest_id/claim" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $token" \
    -d '{}' >/dev/null
fi

feed=$(curl -s -X POST "$API_BASE/api/feed/posts" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"body":"Smoke post from automated verification."}')

leaderboard=$(curl -s "$API_BASE/api/leaderboards?window=daily" -H "Authorization: Bearer $token")

printf 'smoke ok\n'
printf 'signup user: %s\n' "$(printf '%s' "$signup" | jq -r '.user.email')"
printf 'activity xp: %s\n' "$(printf '%s' "$activity" | jq -r '.rewardEvent.xpDelta')"
printf 'feed post id: %s\n' "$(printf '%s' "$feed" | jq -r '.post.id')"
printf 'leaderboard top: %s\n' "$(printf '%s' "$leaderboard" | jq -r '.rows[0].displayName')"
