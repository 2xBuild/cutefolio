import type { FieldRequirement } from "@/templates/types";

export const fields: FieldRequirement[] = [
  { field: "img", type: "image_url", required: true, description: "Avatar image URL" },
  { field: "img_alt", type: "text", required: true, description: "Alt text for the avatar image" },
  { field: "heading_bold", type: "text", required: true, description: "Display name (shown prominently)" },
  { field: "heading_light", type: "text", required: false, description: "Optional subtitle shown next to the name" },
  { field: "desc_1", type: "textarea", required: true, description: "Short bio / description below the name" },
  { field: "social_links", type: "social_links", required: true, description: "Links rendered as full-width buttons with icon + label" },
  { field: "theme", type: "theme", required: false, description: "Custom theme colors and fonts" },
];
