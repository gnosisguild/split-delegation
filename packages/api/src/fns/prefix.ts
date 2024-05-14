export default function prefix(venue: 'Audit' | 'Sync' | 'Heal' | 'Integrity') {
  function ts() {
    const date = new Date(Date.now())
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

    // Format the output to show minutes, seconds, and milliseconds
    return `${hours}:${minutes}:${seconds}.${milliseconds}`
  }

  return `[${ts()} ${venue}]`
}
