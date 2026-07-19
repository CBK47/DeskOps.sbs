import handler from "./.open-next/worker.js";

export { AgentRateLimiter } from "./lib/agent/agent-rate-limiter-do";

const worker = {
  fetch: handler.fetch,
};

export default worker;
