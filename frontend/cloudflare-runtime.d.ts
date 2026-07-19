declare module "cloudflare:workers" {
  export class DurableObject<Environment = unknown> {
    constructor(ctx: unknown, env: Environment);
  }
}

declare module "*.open-next/worker.js" {
  const handler: {
    fetch: (request: Request, ...args: unknown[]) => Response | Promise<Response>;
  };

  export default handler;
}
