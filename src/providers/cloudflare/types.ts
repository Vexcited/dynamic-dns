export type CloudflareInstanceOptions = {
    // API Token
    token?: string;

    // API Key
    authEmail?: string;
    authKey?: string;
}

export type CloudflareError = {
  code: number;
  message: string;
}

export type CloudflareUpdateDnsRecordProps = {
  zone_identifier: string;
  identifier: string;

  type: "A" | "AAAA"; // "A"
  name: string; // "example.com"
  content: string; // 127.0.0.1
  ttl?: number; // Default: 3600
  proxied?: boolean;
}

export type CloudflareListZonesProps = {
  name?: string; // A domain name to search.
  page?: number; // Default: 1 ; Current page.
  per_page?: number; // Default: 20 ; Number of zones per page.
}

export type CloudflareListZonesResponse = {
  success: boolean;
  errors: CloudflareError[];
  result: {
    id: string;
    name: string;
    status: string;
    paused: boolean;
    type: string;
    development_mode: number;
    name_servers: string[];
    modified_on: string;
    created_on: string;
    activated_on: string;
  }[];
  result_info?: {
    page: number;
    per_page: number;
    total_pages: number;
    count: number;
    total_count: number;
  }
}