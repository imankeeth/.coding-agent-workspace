import { Command, Options, Args } from "@effect/cli"
import { Effect, Console, Option } from "effect"
import * as Path from "@effect/platform/Path"
import * as FileSystem from "@effect/platform/FileSystem"
import * as os from "node:os"
import { GitService } from "../services/GitService.js"
import { RegistryService } from "../services/RegistryService.js"
import { ReferenceMetadata, ReferenceScope } from "../schemas/RegistrySchema.js"

const globalOption = Options.boolean("global").pipe(Options.withAlias("g"))
const projectOption = Options.text("project").pipe(Options.withAlias("p"), Options.optional)

const resolveScope = (isGlobal: boolean, project?: string): Effect.Effect<ReferenceScope, Error> => {
  if (isGlobal) {
    return Effect.succeed(new ReferenceScope({ type: "global" }))
  }
  if (project) {
    return Effect.succeed(new ReferenceScope({ type: "project", projectName: project }))
  }
  return Effect.fail(new Error("You must specify either --global or --project <name>"))
}

const getTargetDir = (scope: ReferenceScope, repoName: string) => 
  Effect.gen(function* (_) {
    const path = yield* _(Path.Path)
    const homeDir = os.homedir()
    const workspaceDir = path.join(homeDir, ".coding-agent-workspace")
    
    if (scope.type === "global") {
      return path.join(workspaceDir, "global", "references", repoName)
    } else {
      if (!scope.projectName) return yield* _(Effect.fail(new Error("Project name missing")))
      return path.join(workspaceDir, "projects", scope.projectName, "references", repoName)
    }
  })

// Args
const urlArg = Args.text({ name: "url" })
const nameArg = Args.text({ name: "name" })

const cloneCommand = Command.make("clone", {
  url: urlArg,
  global: globalOption,
  project: projectOption
}, ({ url, global, project }) => 
  Effect.gen(function* (_) {
    const git = yield* _(GitService)
    const registry = yield* _(RegistryService)
    const path = yield* _(Path.Path)
    const fs = yield* _(FileSystem.FileSystem)

    const projectStr = Option.getOrUndefined(project)
    const scope = yield* _(resolveScope(global, projectStr))
    
    // Extract repo name from URL
    const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url
    const baseName = cleanUrl.split("/").pop()?.replace(/\.git$/, "")
    if (!baseName) {
      return yield* _(Effect.fail(new Error("Could not determine repository name from URL")))
    }

    const targetPath = yield* _(getTargetDir(scope, baseName))
    const exists = yield* _(fs.exists(targetPath))
    
    if (exists) {
      yield* _(Console.log(`Repository already exists at ${targetPath}`))
      // Optionally update? For now just skip or fail? 
      // Let's just update metadata if needed or do nothing.
    } else {
      yield* _(Console.log(`Cloning ${url} to ${targetPath}...`))
      // Ensure parent dir exists
      const parentDir = path.dirname(targetPath)
      yield* _(fs.makeDirectory(parentDir, { recursive: true }))
      yield* _(git.clone(url, targetPath))
      yield* _(Console.log("Clone complete."))
    }

    // Register
    const metadata = new ReferenceMetadata({
      name: baseName,
      url: url,
      path: targetPath,
      scope: scope,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    yield* _(registry.addReference(metadata))
    yield* _(Console.log(`Registered reference ${baseName}.`))
  })
)

const listCommand = Command.make("list", {
  global: globalOption,
  project: projectOption
}, ({ global, project }) => 
  Effect.gen(function* (_) {
    const registry = yield* _(RegistryService)
    
    const projectStr = Option.getOrUndefined(project)
    
    let scopeType: "global" | "project" | undefined
    if (global) scopeType = "global"
    else if (projectStr) scopeType = "project"
    
    const refs = yield* _(registry.listReferences(scopeType, projectStr))
    
    if (refs.length === 0) {
      return
    }

    yield* _(Console.log("References:"))
    for (const ref of refs) {
      const scopeStr = ref.scope.type === "global" ? "global" : `project:${ref.scope.projectName}`
      yield* _(Console.log(`- ${ref.name} (${scopeStr})`))
      yield* _(Console.log(`  URL: ${ref.url}`))
      yield* _(Console.log(`  Path: ${ref.path}`))
    }
  })
)

const removeCommand = Command.make("remove", {
  name: nameArg,
  global: globalOption,
  project: projectOption
}, ({ name, global, project }) => 
  Effect.gen(function* (_) {
    const registry = yield* _(RegistryService)
    const fs = yield* _(FileSystem.FileSystem)
    
    const projectStr = Option.getOrUndefined(project)
    const scope = yield* _(resolveScope(global, projectStr))
    const targetPath = yield* _(getTargetDir(scope, name))

    yield* _(Console.log(`Removing reference ${name}...`))
    
    // Remove from registry
    yield* _(registry.removeReference(name, scope.type as any, scope.projectName))
    
    // Remove files
    const exists = yield* _(fs.exists(targetPath))
    if (exists) {
        yield* _(fs.remove(targetPath, { recursive: true }))
        yield* _(Console.log(`Deleted files at ${targetPath}`))
    } else {
        yield* _(Console.log(`Files not found at ${targetPath}, removed from registry only.`))
    }
  })
)

export const referenceCommand = Command.make("reference")
  .pipe(Command.withSubcommands([cloneCommand, listCommand, removeCommand]))
