import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionProcessor } from './action.js';
import path from 'path';

describe('ActionProcessor', () => {
  let processor;
  let mockFs;
  
  beforeEach(() => {
    mockFs = {
      mkdir: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
      unlink: vi.fn().mockResolvedValue(undefined)
    };
    
    processor = new ActionProcessor({
      outputDir: 'test-output',
      fs: mockFs
    });
  });

  it('should process create action', async () => {
    const content = '<action do="create" file="index.html"><div>Hello</div></action>';
    const eventSpy = vi.fn();
    processor.on('file-created', eventSpy);
    
    await processor.process(content);
    
    expect(mockFs.mkdir).toHaveBeenCalledWith(
      path.dirname(path.join('test-output', 'index.html')),
      { recursive: true }
    );
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      path.join('test-output', 'index.html'),
      '<div>Hello</div>'
    );
    expect(eventSpy).toHaveBeenCalledWith({
      filepath: path.join('test-output', 'index.html'),
      content: '<div>Hello</div>'
    });
  });

  it('should process modify action', async () => {
    const content = '<action do="modify" file="style.css">body { color: red; }</action>';
    const eventSpy = vi.fn();
    processor.on('file-modified', eventSpy);
    
    await processor.process(content);
    
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      path.join('test-output', 'style.css'),
      'body { color: red; }'
    );
    expect(eventSpy).toHaveBeenCalledWith({
      filepath: path.join('test-output', 'style.css'),
      content: 'body { color: red; }'
    });
  });

  it('should process delete action', async () => {
    const content = '<action do="delete" file="old.js"></action>';
    const eventSpy = vi.fn();
    processor.on('file-deleted', eventSpy);
    
    await processor.process(content);
    
    expect(mockFs.unlink).toHaveBeenCalledWith(
      path.join('test-output', 'old.js')
    );
    expect(eventSpy).toHaveBeenCalledWith({
      filepath: path.join('test-output', 'old.js')
    });
  });

  it('should handle multiple actions', async () => {
    const content = `
      <action do="create" file="index.html"><div>Hello</div></action>
      Some other content
      <action do="modify" file="style.css">body { color: blue; }</action>
    `;
    
    await processor.process(content);
    
    expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
  });

  it('should handle invalid actions', async () => {
    const content = '<action do="invalid" file="test.txt">content</action>';
    const errorSpy = vi.fn();
    processor.on('error', errorSpy);
    
    await processor.process(content);
    
    expect(errorSpy).toHaveBeenCalled();
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });

  it('should keep unprocessed content in buffer', async () => {
    const content = 'Start<action do="create" file="test.txt">content</action>End';
    await processor.process(content);
    
    expect(processor.getBuffer()).toBe('End');
  });
});
