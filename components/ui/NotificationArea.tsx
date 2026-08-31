import { Bell } from "lucide-react";

/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — Navigation Components.
 * A presentational shell only. This product has no real notification data
 * source anywhere today, and building one would be new functionality this
 * sprint explicitly excludes ("Do NOT introduce new functionality") — this
 * component accepts whatever list a future caller supplies and renders an
 * honest empty state otherwise (per the existing Empty States rule,
 * ANGEL_DESIGN_LANGUAGE.md §8), rather than shipping with invented sample
 * notifications. Not wired into any page in this sprint.
 */
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
}

export default function NotificationArea({ notifications = [] }: { notifications?: NotificationItem[] }) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div role="region" aria-label="Notifications" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden w-80 max-w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-gray-400 dark:text-gray-500" />
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
        </div>
        {unreadCount > 0 && (
          <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">You&apos;re all caught up</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Updates about your child&apos;s progress will appear here.</p>
        </div>
      ) : (
        <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.map((n) => (
            <li key={n.id} className={n.read ? "px-4 py-3" : "px-4 py-3 bg-blue-50/50 dark:bg-blue-950/30"}>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
