export default function parseScssMap(text) {
  return Object.fromEntries(text.replace(/\(|\)|\s/g, '').split(',').map(v => {
    const [quotedName, value] = v.split(':')
    return [quotedName.replace(/"/g, ''), value]
  }))
}
