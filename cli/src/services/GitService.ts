import { Effect, Context, Layer } from "effect"
import * as Command from "@effect/platform/Command"

export interface GitService {
  readonly clone: (url: string, targetPath: string) => Effect.Effect<void, Error>
}

export const GitService = Context.GenericTag<GitService>("@services/GitService")

export const GitServiceLive = Layer.effect(
  GitService,
  Effect.gen(function* (_) {
    const clone = (url: string, targetPath: string) =>
      Effect.gen(function* (_) {
        const cmd = Command.make("git", "clone", "--depth", "1", url, targetPath)
        // We don't need the output, just success
        const exitCode = yield* _(Command.exitCode(cmd))
        if (exitCode !== 0) {
            return yield* _(Effect.fail(new Error(`Git clone failed with exit code ${exitCode}`)))
        }
      })

    return {
      clone
    }
  })
)
