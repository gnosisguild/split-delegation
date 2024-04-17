import { command, run, subcommands } from 'cmd-ts'

import sync from './sync'

import 'dotenv/config'

const syncCommand = command({
  name: 'sync',
  description: 'Ingests blocks and inserts db rows',
  args: {},
  handler: async () => {
    await sync()
  },
})

run(
  subcommands({
    name: 'entrypoint',
    cmds: {
      sync: syncCommand,
    },
  }),
  process.argv.slice(2)
)
