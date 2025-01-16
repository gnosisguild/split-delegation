import { command, run, subcommands } from 'cmd-ts'

import audit from './audit'
import heal from './heal'
import integrity from './integrity'
import prune from './prune'
import sync from './sync'

import 'dotenv/config'

const auditCommand = command({
  name: 'audit',
  description: '',
  args: {},
  handler: async () => {
    await audit()
  },
})

const healCommand = command({
  name: 'heal',
  description:
    'Produces a diff between RPC and DB. Fixes integrity by applying a patch',
  args: {},
  handler: async () => {
    await heal({ lookback: 10000 })
  },
})

const integrityCommand = command({
  name: 'integrity',
  description: 'Asserts row data integrity',
  args: {},
  handler: async () => {
    await integrity()
  },
})

const pruneCommand = command({
  name: 'prune',
  description: '',
  args: {},
  handler: async () => {
    await prune()
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
      audit: auditCommand,
      heal: healCommand,
      integrity: integrityCommand,
      prune: pruneCommand,
      sync: syncCommand,
    },
  }),
  process.argv.slice(2)
)
