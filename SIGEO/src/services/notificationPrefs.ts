export interface NotificationPrefs {
  push_enabled: boolean;
  task_assigned: boolean;
  task_approved: boolean;
  task_rejected: boolean;
  sla_warning: boolean;
  stock_low: boolean;
  checkin_reminder: boolean;
  email_enabled: boolean;
  email_daily_digest: boolean;
}

export const DEFAULT_PREFS: NotificationPrefs = {
  push_enabled: true,
  task_assigned: true,
  task_approved: true,
  task_rejected: true,
  sla_warning: true,
  stock_low: true,
  checkin_reminder: true,
  email_enabled: false,
  email_daily_digest: false,
};

const STORAGE_KEY = "sigeo_notification_prefs";

export function getNotificationPrefs(): NotificationPrefs {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
  } catch {
    // ignore
  }
  return DEFAULT_PREFS;
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

/** Maps push data.type to the corresponding pref key */
const TYPE_TO_PREF: Record<string, keyof NotificationPrefs> = {
  task_assigned: "task_assigned",
  task_approved: "task_approved",
  task_rejected: "task_rejected",
  sla_warning: "sla_warning",
  stock_low: "stock_low",
  checkin_reminder: "checkin_reminder",
};

/** Returns true if the notification type is allowed by user prefs */
export function isNotificationAllowed(type: string | undefined): boolean {
  const prefs = getNotificationPrefs();
  if (!prefs.push_enabled) return false;
  if (!type) return true; // unknown types pass through
  const prefKey = TYPE_TO_PREF[type];
  if (!prefKey) return true; // unmapped types pass through
  return prefs[prefKey] as boolean;
}
