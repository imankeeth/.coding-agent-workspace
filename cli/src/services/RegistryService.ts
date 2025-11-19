import { Effect, Context, Layer } from "effect"
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
import { ReferenceRegistry, ReferenceMetadata } from "../schemas/RegistrySchema.js"
import { Schema } from "@effect/schema"
import * as os from "node:os"

export interface RegistryService {
  readonly addReference: (ref: ReferenceMetadata) => Effect.Effect<void, Error>
  readonly removeReference: (name: string, scopeType: "global" | "project", projectName?: string) => Effect.Effect<void, Error>
  readonly listReferences: (scopeType?: "global" | "project", projectName?: string) => Effect.Effect<readonly ReferenceMetadata[], Error>
}

export const RegistryService = Context.GenericTag<RegistryService>("@services/RegistryService")

export const RegistryServiceLive = Layer.effect(
  RegistryService,
  Effect.gen(function* (_) {
    const fs = yield* _(FileSystem.FileSystem)
    const path = yield* _(Path.Path)
    
    const homeDir = os.homedir()
    const workspaceDir = path.join(homeDir, ".coding-agent-workspace")
    const registryPath = path.join(workspaceDir, "registry", "references.json")

    const readRegistry = Effect.gen(function* (_) {
      const exists = yield* _(fs.exists(registryPath))
      if (!exists) {
        return new ReferenceRegistry({ references: [] })
      }
      const content = yield* _(fs.readFileString(registryPath))
      try {
        const json = JSON.parse(content)
        return yield* _(Schema.decodeUnknown(ReferenceRegistry)(json))
      } catch (e) {
        return new ReferenceRegistry({ references: [] })
      }
    })

    const writeRegistry = (registry: ReferenceRegistry) => 
      Effect.gen(function* (_) {
        const encoded = Schema.encodeSync(ReferenceRegistry)(registry)
        const content = JSON.stringify(encoded, null, 2)
        yield* _(fs.writeFileString(registryPath, content))
      })

    const addReference = (ref: ReferenceMetadata) =>
      Effect.gen(function* (_) {
        const registry = yield* _(readRegistry)
        // Remove existing if same name and scope
        const filtered = registry.references.filter(r => {
             if (r.name !== ref.name) return true
             if (r.scope.type !== ref.scope.type) return true
             if (ref.scope.type === "project" && r.scope.projectName !== ref.scope.projectName) return true
             return false
        })
        
        const updated = new ReferenceRegistry({
          references: [...filtered, ref]
        })
        yield* _(writeRegistry(updated))
      })

    const removeReference = (name: string, scopeType: "global" | "project", projectName?: string) => 
      Effect.gen(function*(_) {
          const registry = yield* _(readRegistry)
          const filtered = registry.references.filter(r => {
              if (r.name !== name) return true
              if (r.scope.type !== scopeType) return true
              if (scopeType === "project" && r.scope.projectName !== projectName) return true
              return false
          })
          yield* _(writeRegistry(new ReferenceRegistry({ references: filtered })))
      })

    const listReferences = (scopeType?: "global" | "project", projectName?: string) => 
      Effect.gen(function*(_) {
          const registry = yield* _(readRegistry)
          if (!scopeType) return registry.references
          return registry.references.filter(r => {
              if (r.scope.type !== scopeType) return false
              if (scopeType === "project" && r.scope.projectName !== projectName) return false
              return true
          })
      })

    return {
      addReference,
      removeReference,
      listReferences
    }
  })
)
