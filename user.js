require('child_process').execSync('whoami', {
  stdio: 'inherit',
  encoding: 'utf-8',
})
