import type { FieldRequirement } from "@/templates/types";

export const fields: FieldRequirement[] = [
  { field: "img", type: "image_url", required: true, description: "Avatar image URL" },
  { field: "img_alt", type: "text", required: true, description: "Alt text for the avatar image" },
  { field: "heading_bold", type: "text", required: true, description: "Primary heading (e.g. full name)" },
  { field: "heading_light", type: "text", required: true, description: "Secondary heading (e.g. role / tagline)" },
  { field: "desc_1", type: "textarea", required: true, description: "Intro line before tech stack badges" },
  { field: "tech_stack", type: "tech_stack", required: true, description: "Array of skills shown as icon badges" },
  { field: "desc_2", type: "textarea", required: false, description: "Second paragraph below tech stack" },
  { field: "desc_3", type: "textarea", required: false, description: "Third paragraph below divider" },
  { field: "cta_buttons", type: "cta_buttons", required: true, description: "Call-to-action buttons (primary/secondary with label, href, optional icon)" },
  { field: "social_links", type: "social_links", required: true, description: "Social link icons at the bottom" },
  { field: "theme", type: "theme", required: false, description: "Custom theme colors and fonts" },
];
