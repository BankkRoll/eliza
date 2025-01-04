# @elizaos/client-chrome

## Description

@elizaos/client-chrome is a powerful Chrome extension client that provides a robust interface for managing Chrome tabs, windows, and extension-related memories, enabling seamless integration between ElizaOS and Chrome extensions.

## Installation

To install the package, run:

```bash
pnpm add @elizaos/client-chrome
```

## Configuration

The Chrome client requires the following configuration parameters:

- `EXTENSION_ID`: The ID of your Chrome extension (required)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (default: "*")
- `MAX_TABS`: Maximum number of tabs to manage (default: 10)
- `MEMORY_RETENTION`: Duration in milliseconds to retain memories (default: 24 hours)

Set these in your ElizaOS runtime settings.

## Usage

Here's a basic example of how to use the Chrome client:

```typescript
import { ChromeClientInterface } from '@elizaos/client-chrome';
import { AgentRuntime } from '@elizaos/core';

const runtime = new AgentRuntime(/* ... */);
const chromeClient = await ChromeClientInterface.start(runtime);
```

## Features

1. **Tab Management**: Track and manage Chrome tabs across multiple windows.
2. **Window Management**: Monitor and control Chrome windows.
3. **Memory Management**: Store and retrieve extension-related memories with customizable retention periods.
4. **Message Handling**: Process various types of messages from the Chrome extension.
5. **State Management**: Maintain and provide access to the current state of tabs and windows.

## Functions

- `initialize()`: Set up the Chrome client, including tab and memory managers.
- `handleMessage(message: ChromeMessage)`: Process incoming messages from the Chrome extension.
- `storeMemory(memory: ChromeMemory)`: Store a new memory.
- `retrieveMemories(type?: string)`: Retrieve stored memories, optionally filtered by type.
- `getState()`: Get the current state of tabs and windows.

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build the project: `pnpm build`
4. Run tests: `pnpm test`

For development with watch mode: `pnpm dev`

## Notes

- This client is designed to work with Chrome extensions and requires the Chrome runtime to be available.
- Ensure that your Chrome extension has the necessary permissions to interact with tabs and windows.
- The client uses Zod for runtime type checking and validation of configuration and messages.
