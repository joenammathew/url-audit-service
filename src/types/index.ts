// This defines the shape of our data
export interface AuditResult {
  requestId: string;
  url: string;
  status: number;
  responseTimeMs: number;
  contentLength: number;
  title?: string;
  metaDescription?: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  links: {
    internal: string[];
    external: string[];
  };
  cached: boolean;
  timestamp: string;
}