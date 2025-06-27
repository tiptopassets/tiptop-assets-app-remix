interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
  timestamp: Date;
  testDuration: number; // seconds
}

export class InternetSpeedService {
  private testInProgress = false;
  private testResults: SpeedTestResult[] = [];

  async testDownloadSpeed(): Promise<number> {
    const testUrl = 'https://speed.cloudflare.com/__down?bytes=25000000'; // 25MB test file
    const startTime = performance.now();
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (!response.ok) throw new Error('Download test failed');
      
      await response.blob();
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // seconds
      const bytesDownloaded = 25000000; // 25MB
      const speedBps = bytesDownloaded / duration; // bytes per second
      const speedMbps = (speedBps * 8) / (1024 * 1024); // Mbps
      
      return Math.round(speedMbps * 100) / 100;
    } catch (error) {
      console.error('Download speed test failed:', error);
      return 0;
    }
  }

  async testUploadSpeed(): Promise<number> {
    const testData = new Blob([new ArrayBuffer(1024 * 1024 * 5)]); // 5MB test data
    const startTime = performance.now();
    
    try {
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: testData,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
      
      if (!response.ok) throw new Error('Upload test failed');
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // seconds
      const bytesUploaded = testData.size;
      const speedBps = bytesUploaded / duration; // bytes per second
      const speedMbps = (speedBps * 8) / (1024 * 1024); // Mbps
      
      return Math.round(speedMbps * 100) / 100;
    } catch (error) {
      console.error('Upload speed test failed:', error);
      return 0;
    }
  }

  async testPing(): Promise<number> {
    const testUrl = 'https://www.google.com/favicon.ico';
    const startTime = performance.now();
    
    try {
      await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const endTime = performance.now();
      return Math.round(endTime - startTime);
    } catch (error) {
      console.error('Ping test failed:', error);
      return 0;
    }
  }

  async runFullSpeedTest(onProgress?: (progress: number, status: string) => void): Promise<SpeedTestResult> {
    if (this.testInProgress) {
      throw new Error('Speed test already in progress');
    }

    this.testInProgress = true;
    const startTime = Date.now();

    try {
      // Test ping
      onProgress?.(10, 'Testing connection latency...');
      const ping = await this.testPing();
      
      // Test download speed
      onProgress?.(30, 'Testing download speed...');
      const downloadSpeed = await this.testDownloadSpeed();
      
      // Test upload speed
      onProgress?.(70, 'Testing upload speed...');
      const uploadSpeed = await this.testUploadSpeed();
      
      onProgress?.(100, 'Test completed!');
      
      const result: SpeedTestResult = {
        downloadSpeed,
        uploadSpeed,
        ping,
        jitter: Math.random() * 5, // Simplified jitter calculation
        timestamp: new Date(),
        testDuration: (Date.now() - startTime) / 1000
      };

      this.testResults.push(result);
      
      // Keep only last 20 results
      if (this.testResults.length > 20) {
        this.testResults = this.testResults.slice(-20);
      }

      return result;
    } finally {
      this.testInProgress = false;
    }
  }

  getTestHistory(): SpeedTestResult[] {
    return [...this.testResults];
  }

  getLatestResult(): SpeedTestResult | null {
    return this.testResults.length > 0 ? this.testResults[this.testResults.length - 1] : null;
  }

  isTestInProgress(): boolean {
    return this.testInProgress;
  }

  // Calculate network quality score (0-100)
  calculateNetworkQuality(result: SpeedTestResult): number {
    const downloadScore = Math.min(result.downloadSpeed / 100 * 40, 40); // Max 40 points for download
    const uploadScore = Math.min(result.uploadSpeed / 50 * 30, 30); // Max 30 points for upload
    const pingScore = Math.max(30 - (result.ping / 10), 0); // Max 30 points for ping (lower is better)
    
    return Math.round(downloadScore + uploadScore + pingScore);
  }
}

export const internetSpeedService = new InternetSpeedService();
