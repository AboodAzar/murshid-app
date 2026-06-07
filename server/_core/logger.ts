// Structured logging utility for better error tracking and debugging

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  userId?: number;
  userEmail?: string;
  userRole?: string;
  requestId?: string;
  ip?: string;
  procedure?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    const errorStr = error ? ` ${error.name}: ${error.message}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: this.isDevelopment ? error.stack : undefined,
            code: (error as any).code,
          }
        : undefined,
    };
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const entry = this.createEntry(LogLevel.DEBUG, message, context);
      console.debug(this.formatLog(entry));
    }
  }

  info(message: string, context?: LogContext): void {
    const entry = this.createEntry(LogLevel.INFO, message, context);
    console.info(this.formatLog(entry));
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    const entry = this.createEntry(LogLevel.WARN, message, context, error);
    console.warn(this.formatLog(entry));
  }

  error(message: string, context?: LogContext, error?: Error): void {
    const entry = this.createEntry(LogLevel.ERROR, message, context, error);
    console.error(this.formatLog(entry));
  }

  // Convenience method for logging tRPC procedure calls
  procedure(procedure: string, context?: LogContext): void {
    this.info(`Procedure called: ${procedure}`, { ...context, procedure });
  }

  // Convenience method for logging database operations
  database(operation: string, table: string, context?: LogContext): void {
    this.debug(`Database operation: ${operation} on ${table}`, {
      ...context,
      operation,
      table,
    });
  }

  // Convenience method for logging authentication events
  auth(event: string, context?: LogContext, error?: Error): void {
    const level = error ? LogLevel.ERROR : LogLevel.INFO;
    const entry = this.createEntry(
      level,
      `Auth event: ${event}`,
      context,
      error
    );
    console[level](this.formatLog(entry));
  }
}

export const logger = new Logger();

// Error tracking utility (placeholder for integration with services like Sentry)
export class ErrorTracker {
  private isEnabled = process.env.SENTRY_DSN !== undefined;

  captureException(error: Error, context?: LogContext): void {
    if (!this.isEnabled) {
      logger.error("Error captured", context, error);
      return;
    }

    // In production, integrate with Sentry or similar service
    // For now, just log the error
    logger.error("Error captured", context, error);
  }

  captureMessage(
    message: string,
    level: LogLevel = LogLevel.INFO,
    context?: LogContext
  ): void {
    if (!this.isEnabled) {
      logger[level](message, context);
      return;
    }

    // In production, integrate with Sentry or similar service
    // For now, just log the message
    logger[level](message, context);
  }

  setUser(user: { id: number; email: string; role: string }): void {
    if (!this.isEnabled) return;

    // In production, set user context in Sentry
    logger.debug("User context set", {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
    });
  }

  clearUser(): void {
    if (!this.isEnabled) return;

    // In production, clear user context in Sentry
    logger.debug("User context cleared");
  }
}

export const errorTracker = new ErrorTracker();
