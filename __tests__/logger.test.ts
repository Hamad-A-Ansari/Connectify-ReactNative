import { LOG_LEVELS, LogLevel } from '../lib/logger';

// We need to test the logger with different __DEV__ values,
// so we re-import the module after mocking __DEV__

describe('logger', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  let logSpy: jest.Mock;
  let warnSpy: jest.Mock;
  let errorSpy: jest.Mock;

  beforeEach(() => {
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    logSpy = jest.fn();
    warnSpy = jest.fn();
    errorSpy = jest.fn();
    console.log = logSpy;
    console.warn = warnSpy;
    console.error = errorSpy;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    jest.resetModules();
  });

  describe('LOG_LEVELS ordering', () => {
    it('debug has the lowest numeric value', () => {
      expect(LOG_LEVELS.debug).toBe(0);
    });

    it('info is above debug', () => {
      expect(LOG_LEVELS.info).toBeGreaterThan(LOG_LEVELS.debug);
    });

    it('warn is above info', () => {
      expect(LOG_LEVELS.warn).toBeGreaterThan(LOG_LEVELS.info);
    });

    it('error is above warn', () => {
      expect(LOG_LEVELS.error).toBeGreaterThan(LOG_LEVELS.warn);
    });
  });

  describe('in development mode (__DEV__ = true)', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('outputs debug messages', () => {
      jest.resetModules();
      const { logger } = require('../lib/logger');
      logger.debug('test debug');
      expect(logSpy).toHaveBeenCalledWith('[DEBUG]', 'test debug');
    });

    it('outputs info messages', () => {
      jest.resetModules();
      const { logger } = require('../lib/logger');
      logger.info('test info');
      expect(logSpy).toHaveBeenCalledWith('[INFO]', 'test info');
    });

    it('outputs warn messages', () => {
      jest.resetModules();
      const { logger } = require('../lib/logger');
      logger.warn('test warn');
      expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'test warn');
    });

    it('outputs error messages', () => {
      jest.resetModules();
      const { logger } = require('../lib/logger');
      logger.error('test error');
      expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'test error');
    });

    it('passes multiple arguments through', () => {
      jest.resetModules();
      const { logger } = require('../lib/logger');
      logger.debug('msg', { key: 'value' }, 42);
      expect(logSpy).toHaveBeenCalledWith('[DEBUG]', 'msg', { key: 'value' }, 42);
    });
  });

  describe('in production mode (__DEV__ = false)', () => {
    beforeEach(() => {
      (global as any).__DEV__ = false;
    });

    it('suppresses debug messages', () => {
      jest.resetModules();
      const { logger } = require('../lib/logger');
      logger.debug('test debug');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('suppresses info messages', () => {
      jest.resetModules();
      const { logger } = require('../lib/logger');
      logger.info('test info');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('outputs warn messages', () => {
      jest.resetModules();
      const { logger } = require('../lib/logger');
      logger.warn('test warn');
      expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'test warn');
    });

    it('outputs error messages', () => {
      jest.resetModules();
      const { logger } = require('../lib/logger');
      logger.error('test error');
      expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'test error');
    });
  });
});
