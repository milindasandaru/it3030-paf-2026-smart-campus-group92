import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const rootDirectory = dirname(dirname(currentFile))
const backendDirectory = join(rootDirectory, 'backend')
const mavenArguments = process.argv.slice(2)

if (mavenArguments.length === 0) {
  console.error('Provide at least one Maven goal or argument.')
  process.exit(1)
}

const command = process.platform === 'win32' ? 'cmd.exe' : './mvnw'
const args =
  process.platform === 'win32'
    ? ['/c', 'mvnw.cmd', ...mavenArguments]
    : mavenArguments

const childProcess = spawn(command, args, {
  cwd: backendDirectory,
  stdio: 'inherit',
})

childProcess.on('exit', (code) => {
  process.exit(code ?? 1)
})

childProcess.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
