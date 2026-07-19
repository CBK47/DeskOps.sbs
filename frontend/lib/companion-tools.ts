import type { WellnessDimension } from "@/lib/wellness";

export type CompanionTool = {
  name: string;
  description: string;
  href: string;
  licence: string;
  dimensions: WellnessDimension[];
};

// Verified against each project's primary GitHub repository on 18 July 2026.
// These are ordinary links only: DeskOps has no integration or affiliation.
export const COMPANION_TOOLS: CompanionTool[] = [
  {
    name: "wger",
    description: "A self-hosted workout, nutrition and weight tracker.",
    href: "https://github.com/wger-project/wger",
    licence: "AGPL-3.0-or-later",
    dimensions: ["physical"],
  },
  {
    name: "Actual Budget",
    description: "A local-first tool for budgeting and everyday money planning.",
    href: "https://github.com/actualbudget/actual",
    licence: "MIT",
    dimensions: ["financial"],
  },
  {
    name: "Paperless-ngx",
    description: "A self-hosted, searchable archive for household documents.",
    href: "https://github.com/paperless-ngx/paperless-ngx",
    licence: "GPL-3.0",
    dimensions: ["environmental", "financial"],
  },
  {
    name: "Home Assistant",
    description: "Local-first home automation for people who want to run their own system.",
    href: "https://github.com/home-assistant/core",
    licence: "Apache-2.0",
    dimensions: ["environmental"],
  },
  {
    name: "Grocy",
    description: "A self-hosted household, groceries and chores system.",
    href: "https://github.com/grocy/grocy",
    licence: "MIT",
    dimensions: ["environmental"],
  },
  {
    name: "Plane",
    description: "A self-hosted project planning tool for work items, cycles and roadmaps.",
    href: "https://github.com/makeplane/plane",
    licence: "AGPL-3.0",
    dimensions: ["occupational"],
  },
];

export function companionToolsFor(dimensions: WellnessDimension[]) {
  return COMPANION_TOOLS.filter((tool) => tool.dimensions.some((dimension) => dimensions.includes(dimension)));
}
