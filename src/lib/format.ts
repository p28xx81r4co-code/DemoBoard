const dateTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateOnly = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso));
}

// Today's posts show only the time; older ones show the date.
export function formatListDate(iso: string) {
  const date = new Date(iso);
  const today = dateOnly.format(new Date());
  if (dateOnly.format(date) === today) {
    return dateTime.format(date).split(" ").slice(-1)[0];
  }
  return dateOnly.format(date).replace(/\s/g, "").replace(/\.$/, "");
}
