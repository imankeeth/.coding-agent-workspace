import { Command } from "@effect/cli"
import { Effect } from "effect"
import { NodeContext } from "@effect/platform-node"
import { referenceCommand } from "./commands/reference.js"
import { GitServiceLive } from "./services/GitService.js"
import { RegistryServiceLive } from "./services/RegistryService.js"
import { BootstrapService, BootstrapServiceLive } from "./services/BootstrapService.js"

const command = Command.make("caw")
  .pipe(Command.withSubcommands([referenceCommand]))

const cli = Command.run(command, {
  name: "Coding Agent Workspace CLI",
  version: "0.1.0"
})

const program = Effect.gen(function* (_) {
  const bootstrap = yield* _(BootstrapService)
  yield* _(bootstrap.init)
  return yield* _(cli(process.argv))
})

const main = program.pipe(
  Effect.provide(GitServiceLive),
  Effect.provide(RegistryServiceLive),
  Effect.provide(BootstrapServiceLive),
  Effect.provide(NodeContext.layer)
)

Effect.runPromise(main).catch(console.error)
