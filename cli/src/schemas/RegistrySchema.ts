import { Schema } from "@effect/schema"

export class ReferenceScope extends Schema.TaggedClass<ReferenceScope>()("ReferenceScope", {
  type: Schema.Union(
    Schema.Literal("global"),
    Schema.Literal("project")
  ),
  projectName: Schema.optional(Schema.String)
}) {}

export class ReferenceMetadata extends Schema.Class<ReferenceMetadata>("ReferenceMetadata")({
  name: Schema.String,
  url: Schema.String,
  path: Schema.String,
  scope: ReferenceScope,
  createdAt: Schema.String,
  updatedAt: Schema.String
}) {}

export class ReferenceRegistry extends Schema.Class<ReferenceRegistry>("ReferenceRegistry")({
  references: Schema.Array(ReferenceMetadata)
}) {}
