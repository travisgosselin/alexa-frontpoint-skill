const frontpoint = require('..')

main('armStay', 'testusername', 'blah-password', true, true);

function main(command, username, password, noEntryDelay, silentArming) {
  let authOpts
  if (!username || !password) {
    console.error(`Error: FrontPoint username and password are required`)
    return process.exit(1)
  }

  console.log('Authenticating...')
  frontpoint
    .login(username, password)
    .then(res => {
      authOpts = res
      return frontpoint.getCurrentState(res.systems[0], authOpts)
    })
    .then(res => {
      if (!res.partitions.length)
        return console.error('No security system partitions found')

      const partition = res.partitions[0]
      if (res.partitions.length > 1)
        console.warn(`Warning: multiple partitions found`)

      const msg =
        command === 'armStay'
          ? 'Arming (stay)'
          : command === 'armAway' ? 'Arming (away)' : 'Disarming'
      console.log(`${msg} ${partition.attributes.description}...`)

      const opts = {
        noEntryDelay: noEntryDelay,
        silentArming: silentArming
      }
      const method = frontpoint[command]

      method(partition.id, authOpts, opts).then(res => {
        console.log('Success')
      })
    })
    .catch(err => {
      console.error(err)
    })
}
