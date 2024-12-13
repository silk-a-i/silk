import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CliRenderer } from './cli.js';

describe('CliRenderer', () => {
  let renderer;
  let mockStdout;

  beforeEach(() => {
    mockStdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (renderer) {
      renderer.cleanup();
    }
  });

  it('should handle action tags correctly', () => {
    renderer = new CliRenderer();
    const content = [
      'Start text\n',
      '<action do="create" file="index.html">\n',
      '<div>Hello</div>\n',
      '</action>\n',
      'Middle text\n',
      '<action do="modify" file="style.css">\n',
      'body { color: red; }\n',
      '</action>\n',
      'End text'
    ];

    content.forEach(chunk => renderer.render(chunk));

    expect(renderer.getStats().actions).toBe(2);
    expect(mockStdout).toHaveBeenCalledWith('Start text\n');
    expect(mockStdout).toHaveBeenCalledWith('Middle text\n');
    expect(mockStdout).toHaveBeenCalledWith('End text');
  });

  it('should handle code blocks correctly', () => {
    renderer = new CliRenderer();
    const content = [
      'Start text\n',
      '```js index.js\n',
      'const x = 42;\n',
      'console.log(x);\n',
      '```\n',
      'Middle text\n',
      '```css styles.css\n',
      'body { color: red; }\n',
      '```\n',
      'End text'
    ];

    content.forEach(chunk => renderer.render(chunk));

    expect(renderer.getStats().codeBlocks).toBe(2);
    expect(mockStdout).toHaveBeenCalledWith('Start text\n');
    expect(mockStdout).toHaveBeenCalledWith('Middle text\n');
    expect(mockStdout).toHaveBeenCalledWith('End text');
  });

  it('should handle raw mode correctly', () => {
    renderer = new CliRenderer({ raw: true });
    const content = [
      'Start text\n',
      '<action do="create" file="index.html">\n',
      '<div>Hello</div>\n',
      '</action>\n',
      'End text'
    ];

    content.forEach(chunk => renderer.render(chunk));

    content.forEach(chunk => {
      expect(mockStdout).toHaveBeenCalledWith(chunk);
    });
  });

  it('should track statistics correctly', () => {
    renderer = new CliRenderer();
    const content = [
      'Text line\n',
      '<action do="create" file="index.html">\n',
      '<div>Hello</div>\n',
      '</action>\n',
      '```js script.js\n',
      'console.log("test");\n',
      '```\n'
    ];

    content.forEach(chunk => renderer.render(chunk));

    const stats = renderer.getStats();
    expect(stats.actions).toBe(1);
    expect(stats.codeBlocks).toBe(1);
    expect(stats.totalBytes).toBeGreaterThan(0);
  });
});
