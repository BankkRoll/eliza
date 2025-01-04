import * as crypto from 'crypto-js';

import type { ChromeMemory } from "../types";
import { elizaLogger } from "@elizaos/core";

export class MemoryManager {
  private memories: ChromeMemory[] = [];
  private retentionPeriod: number;
  private encryptionKey: string;

  constructor(retentionPeriod: number, encryptionKey: string) {
    this.retentionPeriod = retentionPeriod;
    this.encryptionKey = encryptionKey;
  }

  async initialize(): Promise<void> {
    // Clean up old memories periodically
    setInterval(() => this.cleanup(), this.retentionPeriod / 2);
  }

  async storeMemory(memory: ChromeMemory): Promise<void> {
    const encryptedContent = this.encrypt(memory.content);
    const encryptedMemory = { ...memory, content: encryptedContent };
    this.memories.push(encryptedMemory);
    elizaLogger.log(`Stored memory: ${memory.id}`);
  }

  async retrieveMemories(type?: string): Promise<ChromeMemory[]> {
    let memories = this.memories;
    if (type) {
      memories = memories.filter(m => m.type === type);
    }
    return memories.map(memory => ({
      ...memory,
      content: this.decrypt(memory.content)
    }));
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    this.memories = this.memories.filter(
      memory => now - memory.timestamp <= this.retentionPeriod
    );
    elizaLogger.log(`Cleaned up old memories. Current count: ${this.memories.length}`);
  }

  private encrypt(data: string): string {
    return crypto.AES.encrypt(data, this.encryptionKey).toString();
  }

  private decrypt(encryptedData: string): string {
    const bytes = crypto.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(crypto.enc.Utf8);
  }
}
