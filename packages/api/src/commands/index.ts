import { command, run, subcommands } from 'cmd-ts'

import pin from './pin'
import prune from './prune'

import 'dotenv/config'

const pinCommand = command({
  name: 'pin',
  description: '',
  args: {},
  handler: async () => {
    await pin()
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

run(
  subcommands({
    name: 'entrypoint',
    cmds: {
      pin: pinCommand,
      prune: pruneCommand,
    },
  }),
  process.argv.slice(2)
)
