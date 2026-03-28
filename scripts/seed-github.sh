#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SEED_FILE="$ROOT_DIR/.github/issue-seed.json"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated"
  exit 1
fi

repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"

echo "Seeding labels into $repo"
jq -c '.labels[]' "$SEED_FILE" | while read -r label; do
  name="$(printf '%s' "$label" | jq -r '.name')"
  color="$(printf '%s' "$label" | jq -r '.color')"
  description="$(printf '%s' "$label" | jq -r '.description')"

  if gh label list --limit 200 --json name --jq '.[].name' | grep -Fxq "$name"; then
    gh label edit "$name" --color "$color" --description "$description" >/dev/null
  else
    gh label create "$name" --color "$color" --description "$description" >/dev/null
  fi
done

echo "Seeding milestones into $repo"
jq -c '.milestones[]' "$SEED_FILE" | while read -r milestone; do
  title="$(printf '%s' "$milestone" | jq -r '.title')"
  description="$(printf '%s' "$milestone" | jq -r '.description')"

  if gh api repos/"$repo"/milestones --paginate --jq '.[].title' | grep -Fxq "$title"; then
    echo "Milestone exists: $title"
  else
    gh api repos/"$repo"/milestones -f title="$title" -f description="$description" >/dev/null
  fi
done

create_issue() {
  local issue_json="$1"
  local title body labels milestone milestone_number

  title="$(printf '%s' "$issue_json" | jq -r '.title')"
  body="$(printf '%s' "$issue_json" | jq -r '.body')"
  labels="$(printf '%s' "$issue_json" | jq -r '.labels | join(",")')"
  milestone="$(printf '%s' "$issue_json" | jq -r '.milestone // empty')"

  if gh issue list --limit 500 --search "$title in:title" --json title --jq '.[].title' | grep -Fxq "$title"; then
    echo "Issue exists: $title"
    return
  fi

  if [ -n "$milestone" ]; then
    milestone_number="$(gh api repos/"$repo"/milestones --paginate --jq ".[] | select(.title == \"$milestone\") | .number")"
    gh issue create --title "$title" --body "$body" --label "$labels" --milestone "$milestone_number" >/dev/null
  else
    gh issue create --title "$title" --body "$body" --label "$labels" >/dev/null
  fi

  echo "Created: $title"
}

echo "Seeding epic issues into $repo"
jq -c '.epics[]' "$SEED_FILE" | while read -r issue; do
  create_issue "$issue"
done

echo "Seeding story issues into $repo"
jq -c '.stories[]' "$SEED_FILE" | while read -r issue; do
  create_issue "$issue"
done

echo "GitHub seeding complete"
