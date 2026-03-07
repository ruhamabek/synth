declare namespace Bun {
  type SQLTemplateTag = <T = unknown>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T>;

  class SQL {
    constructor(connectionString: string, options?: Record<string, unknown>);
    close(): Promise<void>;
    [Symbol.call]?: SQLTemplateTag;
  }

  function password(prompt: string): Promise<string>;

  function serve(options: {
    port: number;
    fetch: (request: Request) => Response | Promise<Response>;
  }): {
    port: number;
    stop: () => void;
  };

  class Glob {
    constructor(pattern: string);
    scanSync(root: string): Iterable<string>;
  }

  function file(path: string): {
    exists(): Promise<boolean>;
  };
}

declare const Bun: {
  SQL: {
    new (connectionString: string, options?: Record<string, unknown>): {
      <T = unknown>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T>;
      close(): Promise<void>;
    };
  };
  password?: (prompt: string) => Promise<string>;
  serve: (options: {
    port: number;
    fetch: (request: Request) => Response | Promise<Response>;
  }) => {
    port: number;
    stop: () => void;
  };
  Glob: new (pattern: string) => {
    scanSync(root: string): Iterable<string>;
  };
  file: (path: string) => {
    exists(): Promise<boolean>;
  };
};
