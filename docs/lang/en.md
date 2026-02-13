# auto-diary-creation-system

[日本語](../../README.md) | English

## Overview

This system collects Notion documents created/updated within the last 24 hours, summarizes them with OpenAI, and creates a “diary entry” in a Notion diary database based on what you learned and thought that day.

## Background

I create documents in Notion every day—technical learning notes, diary/TODOs, self-reflection, travel plans, and more. By keeping a diary centered around those documents, I can create the essential “trigger to recall the past” without manually writing a diary entry.

## Main Flow

1. Fetch pages updated in the last 24 hours from Notion
2. Extract page content and summarize it with OpenAI
3. Format the content according to the diary template
   - Template: `docs/diary-format/format.md`
   - Example: `docs/diary-format/format-ex.md`
4. Append the formatted content as a document in the Notion diary database (the system ends here)
5. Send a LINE notification if an error occurs during processing

## Setup

### 1. Prepare Notion

1. Create a Notion Integration
   - Get the Internal Integration Secret
   - Enable the capabilities “Read content” and “Insert content”
   - In the “Access” tab, select the database(s) or a top-level page you want to read  
     (Selecting a top-level page is recommended, since Notion can read databases under it recursively)
2. Prepare your diary database
   - Create it if you haven’t yet
   - Find the column name used for the page title, and set it to `DIARY_TITLE_PROPERTY`  
     (default: `ドキュメント`)

### 2. Set Script Properties

In GAS editor, open Project Settings and add these Script Properties:

- `NOTION_TOKEN`: Internal Integration Secret
- `OPENAI_API_KEY`: OpenAI API key
- `LINE_API`: LINE Messaging API (Channel Access Token)

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
- Update it to the real column name used in your diary database.

### Notion 403: `Insufficient permissions for this endpoint`

- The integration does not have write permissions, or it is not connected to the target DB.
- Verify the integration has “Insert content” enabled, and it is connected to the diary DB.
- Also verify `DIARY_DB_ID` matches the actual diary DB you intended to write to.

### Missing Script Properties

- `Config.js` throws `Script property is not set: <KEY>` during initialization.
- Add the missing key to Script Properties.
