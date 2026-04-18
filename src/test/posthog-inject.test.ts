import { describe, it, expect } from 'vitest';
import { injectPostHog, shouldInjectPostHog } from '../utils/posthog-inject.js';
import { config } from '../config.js';

describe('PostHog Injection', () => {
  describe('shouldInjectPostHog', () => {
    it('should return false when POSTHOG_KEY is not configured', () => {
      // If no key is configured, should return false
      if (!config.posthogKey) {
        expect(shouldInjectPostHog('text/html')).toBe(false);
      }
    });

    it('should correctly identify HTML content types', () => {
      const htmlTypes = ['text/html', 'text/html; charset=utf-8', 'application/xhtml+xml'];
      const nonHtmlTypes = ['text/plain', 'image/png', 'application/json', 'video/mp4'];
      
      // These return true/false based on whether posthogKey is configured
      for (const type of htmlTypes) {
        const result = shouldInjectPostHog(type);
        if (config.posthogKey) {
          expect(result).toBe(true);
        } else {
          expect(result).toBe(false);
        }
      }
      
      for (const type of nonHtmlTypes) {
        expect(shouldInjectPostHog(type)).toBe(false);
      }
    });
  });

  describe('injectPostHog', () => {
    it('should return original HTML when POSTHOG_KEY is not configured', () => {
      if (!config.posthogKey) {
        const html = '<html><head></head><body>Test</body></html>';
        expect(injectPostHog(html)).toBe(html);
      }
    });

    it('should inject snippet before </head> when configured', () => {
      if (!config.posthogKey) {
        // Skip test if no key configured
        return;
      }
      
      const html = '<html><head><title>Test</title></head><body>Content</body></html>';
      const result = injectPostHog(html);
      
      expect(result).toContain('posthog.init');
      expect(result).toContain(config.posthogKey);
      expect(result).toMatch(/<\/script>\s*<\/head>/i);
    });

    it('should inject after <html> if no <head> tag', () => {
      if (!config.posthogKey) {
        return;
      }
      
      const html = '<html><body>No head tag</body></html>';
      const result = injectPostHog(html);
      
      expect(result).toContain('posthog.init');
      expect(result).toContain(config.posthogKey);
    });

    it('should prepend if no <html> or <head> tag', () => {
      if (!config.posthogKey) {
        return;
      }
      
      const html = '<div>Just content</div>';
      const result = injectPostHog(html);
      
      expect(result).toContain('posthog.init');
      expect(result).toContain(config.posthogKey);
      expect(result.startsWith('<script>')).toBe(true);
    });
  });
});