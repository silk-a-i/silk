export class LimitChecker {
  constructor(config = {}) {
    this.limits = {
      max_files: 0,
      max_size: 50 * 1024,
      max_file_size: null,
      ...config.limits
    };
    this.stats = {
      fileCount: 0,
      totalSize: 0
    };
  }

  checkFile(path, size = 0) {
    const { limits } = this;
    if (limits.max_file_size && size > limits.max_file_size) {
      throw new Error(`File ${path} exceeds size limit of ${limits.max_file_size} bytes`);
    }

    this.stats.fileCount++;
    this.stats.totalSize += size;

    if (limits.max_files && this.stats.fileCount > limits.max_files) {
      throw new Error(`Exceeded maximum file count of ${limits.max_files}`);
    }

    if (this.stats.totalSize > limits.max_size) {
      throw new Error(`Exceeded maximum total size of ${limits.max_size} bytes`);
    }
  }
}
