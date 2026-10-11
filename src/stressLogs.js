const STRESS_LOGS_STORAGE_KEY = 'projectUntangle.stressLogs';

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const readStressLogs = () => {
  try {
    const logs = JSON.parse(localStorage.getItem(STRESS_LOGS_STORAGE_KEY) || '{}');
    if (!logs || typeof logs !== 'object' || Array.isArray(logs)) return {};

    return Object.fromEntries(Object.entries(logs).map(([date, entries]) => {
      if (Array.isArray(entries)) return [date, entries];
      if (!entries || typeof entries !== 'object' || entries.scale == null) return [date, []];

      return [date, [{
        id: entries.id || `legacy-${date}`,
        scale: Number(entries.scale),
        symptoms: Array.isArray(entries.symptoms) ? entries.symptoms : [],
        loggedAt: entries.loggedAt || `${date}T12:00:00.000Z`,
      }]];
    }));
  } catch {
    return {};
  }
};

export const saveStressLog = (date, scale, symptoms = [], editId = null) => {
  const logs = readStressLogs();
  const entry = {
    id: editId || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    scale: Number(scale),
    symptoms,
    loggedAt: new Date().toISOString(),
  };
  const dayEntries = logs[date] || [];
  const editIndex = editId ? dayEntries.findIndex((item) => item.id === editId) : -1;
  if (editIndex !== -1) {
    entry.loggedAt = dayEntries[editIndex].loggedAt;
  }

  if (editIndex === -1) {
    logs[date] = [...dayEntries, entry];
  } else {
    logs[date] = dayEntries.map((item, index) => index === editIndex ? entry : item);
  }

  localStorage.setItem(STRESS_LOGS_STORAGE_KEY, JSON.stringify(logs));
  return logs;
};

export const deleteStressLog = (date, logId) => {
  const logs = readStressLogs();
  const remainingLogs = (logs[date] || []).filter((entry) => entry.id !== logId);

  if (remainingLogs.length > 0) {
    logs[date] = remainingLogs;
  } else {
    delete logs[date];
  }

  localStorage.setItem(STRESS_LOGS_STORAGE_KEY, JSON.stringify(logs));
  return logs;
};