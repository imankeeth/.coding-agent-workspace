import { Effect, Context, Layer } from "effect"
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
import * as os from "node:os"

export interface BootstrapService {
  readonly init: Effect.Effect<void, Error>
}

export const BootstrapService = Context.GenericTag<BootstrapService>("@services/BootstrapService")

export const BootstrapServiceLive = Layer.effect(
  BootstrapService,
  Effect.gen(function* (_) {
    const fs = yield* _(FileSystem.FileSystem)
    const path = yield* _(Path.Path)

    const init = Effect.gen(function* (_) {
      const homeDir = os.homedir()
      const workspaceDir = path.join(homeDir, ".coding-agent-workspace")
      
      const dirs = [
        workspaceDir,
        path.join(workspaceDir, "global", "references"),
        path.join(workspaceDir, "projects"),
        path.join(workspaceDir, "registry"),
        path.join(workspaceDir, "scripts"),
        path.join(workspaceDir, "docs"),
        path.join(workspaceDir, "mcp"),
        path.join(workspaceDir, "sessions")
      ]

      for (const dir of dirs) {
        const exists = yield* _(fs.exists(dir))
        if (!exists) {
          yield* _(fs.makeDirectory(dir, { recursive: true }))
        }
      }

      // Initialize registry files if they don't exist
      const registryFiles = [
        { name: "references.json", content: { references: [] } },
        { name: "tools.json", content: { tools: [] } },
        { name: "projects.json", content: { projects: [] } }
      ]

      for (const file of registryFiles) {
        const filePath = path.join(workspaceDir, "registry", file.name)
        const exists = yield* _(fs.exists(filePath))
        if (!exists) {
          yield* _(fs.writeFileString(filePath, JSON.stringify(file.content, null, 2)))
        }
      }
    })

    return {
      init
    }
  })
)
