import type { FieldRequirement } from "@/templates/types";

export const fields: FieldRequirement[] = [
  { field: "img", type: "image_url", required: true, description: "Avatar image URL" },
  { field: "img_alt", type: "text", required: true, description: "Avatar image alt text" },
  { field: "heading_bold", type: "text", required: true, description: "Primary heading" },
  { field: "heading_light", type: "text", required: true, description: "Secondary heading" },
  { field: "desc_1", type: "textarea", required: true, description: "Main intro paragraph" },
  { field: "desc_2", type: "textarea", required: false, description: "Secondary paragraph" },
  { field: "desc_3", type: "textarea", required: false, description: "Tertiary paragraph" },
  { field: "tech_stack", type: "tech_stack", required: true, description: "Skills list" },
  { field: "cta_buttons", type: "cta_buttons", required: true, description: "Primary links" },
  { field: "social_links", type: "social_links", required: true, description: "Social profile links" },
  { field: "experience", type: "experience", required: false, description: "Experience entries" },
  { field: "projects", type: "projects", required: false, description: "Project entries" },
  { field: "blogs", type: "blogs", required: false, description: "Blog entries" }
];
