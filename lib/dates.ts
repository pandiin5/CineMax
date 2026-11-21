export interface ReleaseStatus {
  isOut: boolean;
  isToday: boolean;
  diffDays: number;
  label: string;
  badgeVariant: "out" | "today" | "upcoming";
  formattedDate: string;
}

export function getWeekDateRange(daysBack = 3, daysForward = 7) {
  const now = new Date();
  const todayStr = formatDateISO(now);

  const start = new Date(now);
  start.setDate(now.getDate() - daysBack);
  const startStr = formatDateISO(start);

  const end = new Date(now);
  end.setDate(now.getDate() + daysForward);
  const endStr = formatDateISO(end);

  return { todayStr, startStr, endStr };
}

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;

  const targetDate = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${monthNames[targetDate.getMonth()]} ${targetDate.getDate()}, ${targetDate.getFullYear()}`;
}

export function getReleaseStatus(dateStr?: string | null): ReleaseStatus | null {
  if (!dateStr) return null;

  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const targetDate = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );

  const today = new Date();
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = targetDate.getTime() - todayZero.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const formattedDate = `${monthNames[targetDate.getMonth()]} ${targetDate.getDate()}, ${targetDate.getFullYear()}`;

  if (diffDays < 0) {
    return {
      isOut: true,
      isToday: false,
      diffDays,
      label: "Out Now",
      badgeVariant: "out",
      formattedDate,
    };
  } else if (diffDays === 0) {
    return {
      isOut: true,
      isToday: true,
      diffDays: 0,
      label: "Out Today",
      badgeVariant: "today",
      formattedDate,
    };
  } else if (diffDays === 1) {
    return {
      isOut: false,
      isToday: false,
      diffDays: 1,
      label: "Tomorrow",
      badgeVariant: "upcoming",
      formattedDate,
    };
  } else if (diffDays <= 7) {
    return {
      isOut: false,
      isToday: false,
      diffDays,
      label: `In ${diffDays} Days`,
      badgeVariant: "upcoming",
      formattedDate,
    };
  } else {
    return {
      isOut: false,
      isToday: false,
      diffDays,
      label: `${monthNames[targetDate.getMonth()]} ${targetDate.getDate()}`,
      badgeVariant: "upcoming",
      formattedDate,
    };
  }
}
