import { command, run, subcommands } from 'cmd-ts'

import count from './count'
import sync from './sync'

import 'dotenv/config'

const countCommand = command({
  name: 'count',
  description: 'Counts events per space',
  args: {},
  handler: async () => {
    await count()
  },
})

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
      count: countCommand,
      sync: syncCommand,
    },
  }),
  process.argv.slice(2)
)
