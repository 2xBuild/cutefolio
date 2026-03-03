import type { FieldRequirement } from "@/templates/types";

export const fields: FieldRequirement[] = [
  { field: "heading_bold", type: "text", required: true, description: "Primary heading (e.g. name)" },
  { field: "heading_light", type: "text", required: true, description: "Secondary heading (e.g. tagline)" },
  { field: "desc_1", type: "textarea", required: true, description: "Intro paragraph" },
  { field: "tech_stack", type: "tech_stack", required: true, description: "Array of skill badges with icons" },
  { field: "desc_2", type: "textarea", required: false, description: "Second paragraph" },
  { field: "desc_3", type: "textarea", required: false, description: "Third paragraph" },
  { field: "cta_buttons", type: "cta_buttons", required: true, description: "CTA buttons (primary/secondary)" },
  { field: "social_links", type: "social_links", required: true, description: "Social links in footer" },
  { field: "experience", type: "experience", required: false, description: "Work experience entries" },
  { field: "projects", type: "projects", required: false, description: "Project entries (supports image URL)" },
  { field: "blogs", type: "blogs", required: false, description: "Blog entries" },
  { field: "meeting_link", type: "meeting_link", required: false, description: "Booking link (Calendly, Cal.com, etc.)" },
  { field: "quote", type: "quote", required: false, description: "Closing quote" },
  { field: "theme", type: "theme", required: false, description: "Custom theme colors and fonts" },
];
