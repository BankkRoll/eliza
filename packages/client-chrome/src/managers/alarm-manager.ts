import { elizaLogger } from "@elizaos/core";

export class AlarmManager {
  createAlarm(name: string, alarmInfo: chrome.alarms.AlarmCreateInfo): Promise<void> {
    return new Promise((resolve) => {
      chrome.alarms.create(name, alarmInfo);
      elizaLogger.log(`Alarm created: ${name}`);
      resolve();
    });
  }

  getAlarm(name: string): Promise<chrome.alarms.Alarm | undefined> {
    return new Promise((resolve) => {
      chrome.alarms.get(name, (alarm) => {
        if (alarm) {
          elizaLogger.log(`Retrieved alarm: ${name}`);
        } else {
          elizaLogger.log(`Alarm not found: ${name}`);
        }
        resolve(alarm);
      });
    });
  }

  getAllAlarms(): Promise<chrome.alarms.Alarm[]> {
    return new Promise((resolve) => {
      chrome.alarms.getAll((alarms) => {
        elizaLogger.log(`Retrieved ${alarms.length} alarms`);
        resolve(alarms);
      });
    });
  }

  clearAlarm(name: string): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.alarms.clear(name, (wasCleared) => {
        if (wasCleared) {
          elizaLogger.log(`Alarm cleared: ${name}`);
        } else {
          elizaLogger.log(`Failed to clear alarm: ${name}`);
        }
        resolve(wasCleared);
      });
    });
  }

  clearAllAlarms(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.alarms.clearAll((wasCleared) => {
        if (wasCleared) {
          elizaLogger.log('All alarms cleared');
        } else {
          elizaLogger.log('Failed to clear all alarms');
        }
        resolve(wasCleared);
      });
    });
  }

  onAlarm(callback: (alarm: chrome.alarms.Alarm) => void): void {
    chrome.alarms.onAlarm.addListener((alarm) => {
      elizaLogger.log(`Alarm triggered: ${alarm.name}`);
      callback(alarm);
    });
  }
}
