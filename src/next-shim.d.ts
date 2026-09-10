/**
 * Next.js Type Shims for PropertyPro Management Portal
 * Allows Next.js App Router route protection middleware and page code
 * to typecheck seamlessly in this environment.
 */
declare module 'next/server' {
  export interface NextRequest {
    nextUrl: URL;
    url: string;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      set(name: string, value: string): void;
      delete(name: string): void;
      has(name: string): boolean;
    };
  }

  export class NextResponse extends Response {
    static next(): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static json(body: any, init?: ResponseInit): NextResponse;
  }
}
