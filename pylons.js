const SOUND = `${process.env.HOME}/sounds/YOU_MUST_CONSTRUCT_ADDITIONAL_PYLONS.MP3`

// Match anything that smells like quota / rate limit / context exhaustion
const TOKEN_ERR = /(rate.?limit|429|quota|insufficient|credit|billing|context.?(length|window|overflow)|too many tokens|max.?tokens|token limit|usage limit)/i

let last = 0
const COOLDOWN_MS = 15_000 // don't let retries spam the Protoss advisor

export const Pylons = async ({ $ }) => {
  const play = async () => {
    if (Date.now() - last < COOLDOWN_MS) return
    last = Date.now()
    try {
      if (process.platform === "darwin") await $`afplay ${SOUND}`.quiet()
      else await $`mpg123 -q ${SOUND}`.quiet() // or: ffplay -nodisp -autoexit -loglevel quiet
    } catch {}
  }

  return {
    event: async ({ event }) => {
      if (event.type === "session.error") {
        const blob = JSON.stringify(event.properties ?? {})
        if (TOKEN_ERR.test(blob)) await play()
      }
      if (event.type === "session.compacted") {
        await play() // context window filled up
      }
    },
  }
}