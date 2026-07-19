import { listStreams } from "@/lib/db/streams";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export async function StreamPicker({ id = "stream_id", name = "stream_id", defaultValue }: { id?: string; name?: string; defaultValue?: string }) {
  const streams = (await listStreams()).filter(s => !s.archived);

  return (
    <Select
      name={name}
      required
      defaultValue={defaultValue ?? streams[0]?.id}
      items={streams.map((s) => ({ value: s.id, label: s.name }))}
    >
      <SelectTrigger id={id} className="w-full"><SelectValue placeholder="Pick a stream" /></SelectTrigger>
      <SelectContent>
        {streams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
