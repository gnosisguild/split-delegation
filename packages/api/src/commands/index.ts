import { command, run, subcommands } from 'cmd-ts'

import audit from './audit'
import count from './count'
import heal from './heal'
import integrity from './integrity'
import pin from './pin'
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

const countCommand = command({
  name: 'count',
  description: 'Counts events per space',
  args: {},
  handler: async () => {
    await count()
  },
})

const healCommand = command({
  name: 'heal',
  description:
    'Produces a diff between RPC and DB. Fixes integrity by applying a patch',
  args: {},
  handler: async () => {
    await heal()
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

const pinCommand = command({
  name: 'pin',
  description: '',
  args: {},
  handler: async () => {
    await pin()
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
      count: countCommand,
      heal: healCommand,
      integrity: integrityCommand,
      pin: pinCommand,
      sync: syncCommand,
    },
  }),
  process.argv.slice(2)
)
