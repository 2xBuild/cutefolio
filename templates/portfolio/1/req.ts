import type { FieldRequirement } from "@/templates/types";

export const fields: FieldRequirement[] = [
  { field: "heading_bold", type: "text", required: true, description: "Name (main heading)" },
  { field: "title", type: "text", required: true, description: "Title (e.g. Frontend Developer) shown under the name" },
  { field: "desc_1", type: "textarea", required: true, description: "Intro paragraph" },
  { field: "tech_stack", type: "tech_stack", required: true, description: "Array of skill badges with icons" },
  { field: "desc_2", type: "textarea", required: false, description: "Second paragraph" },
  { field: "desc_3", type: "textarea", required: false, description: "Third paragraph" },
  { field: "cta_buttons", type: "cta_buttons", required: true, description: "CTA buttons (primary/secondary)" },
  { field: "social_links", type: "social_links", required: true, description: "Social links in footer" },
  { field: "experience", type: "experience", required: false, description: "Work experience entries" },
  { field: "projects", type: "projects", required: false, description: "Project entries (supports image URL)" },
  { field: "blogs", type: "blogs", required: false, description: "Blog entries" },
  { field: "theme", type: "theme", required: false, description: "Custom theme colors and fonts" },
];
