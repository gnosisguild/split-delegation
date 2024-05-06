import { command, run, subcommands } from 'cmd-ts'

import count from './count'
import sync from './sync'
import trim from './trim'

import 'dotenv/config'

const countCommand = command({
  name: 'count',
  description: 'Counts events per space',
  args: {},
  handler: async () => {
    await count()
  },
})

const trimCommand = command({
  name: 'trim',
  description: 'Produces slim down version of Safe allocations',
  args: {},
  handler: async () => {
    await trim()
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
      trim: trimCommand,
      sync: syncCommand,
    },
  }),
  process.argv.slice(2)
)
