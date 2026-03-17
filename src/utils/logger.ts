export const logger = {
  info: (message: string, meta?: unknown) => {
    if (meta) {
      console.log(`[INFO] ${message}`, meta);
    } else {
      console.log(`[INFO] ${message}`);
    }
  },
  error: (message: string, meta?: unknown) => {
    if (meta) {
      console.error(`[ERROR] ${message}`, meta);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }
};
