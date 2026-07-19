import { listStreams } from "@/lib/db/streams";
import { AgentAccessGuide } from "@/components/agent/AgentAccessGuide";

export default async function AgentsPage() {
  const streams = (await listStreams())
    .filter((stream) => !stream.archived)
    .map((stream) => ({ id: stream.id, name: stream.name }));

  return <AgentAccessGuide streams={streams} />;
}
