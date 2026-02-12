# auto-diary-creation-system

[日本語](../../README.md) | English

## Overview

This Google Apps Script (GAS) project collects recently updated Notion pages, summarizes them with OpenAI, and creates a daily summary page in a Notion diary database.

Main flow:

1. Fetch pages updated in the last 24 hours from Notion
2. Extract page content and summarize it with OpenAI
3. Create one daily summary page in the Notion diary database
4. Send a LINE notification if an error occurs

## Setup

### 1. Prepare Notion

1. Create a Notion Internal Integration and get the token
2. Connect the integration to your target diary database (Share / Add connections)
3. Confirm the title property name in the target DB (must match `DIARY_TITLE_PROPERTY`)

### 2. Set Script Properties

In GAS editor, open Project Settings and add these Script Properties:

- `NOTION_TOKEN`
- `OPENAI_API_KEY`
- `LINE_API`

### 3. Review constants in `Config.js`

Adjust these values for your environment:

- `DIARY_DB_ID`: Target Notion diary database ID
- `DIARY_TITLE_PROPERTY`: Title property name in that database
- `OPENAI_SUMMARY_SYSTEM_PROMPT`: Prompt used for summarization
- `DIARY_TIMEZONE`: Timezone for date formatting
- `DIARY_DATE_FORMAT`: Date format for diary page title

### 4. Deploy with clasp (optional)

```bash
clasp push
```

## How to Run

### Manual run

Run `main()` in `_main.js` from the GAS editor.

### Scheduled run

Create a time-driven trigger for `main` (for example, once per day).

## Logging and Notifications

- Each step writes logs via `Logger.log`
- On failure, `_main.js` catches the error and calls `send2Line()`
- If LINE notification itself fails, it is also logged

## Common Errors

### Notion 400: `Name is not a property that exists`

- `DIARY_TITLE_PROPERTY` does not match the actual title property name in your Notion DB.

### Notion 403: `Insufficient permissions for this endpoint`

- The integration does not have write permissions, or it is not connected to the target DB.

### Missing Script Properties

- `Config.js` throws `Script property is not set: <KEY>` during initialization.
- Add the missing key to Script Properties.
