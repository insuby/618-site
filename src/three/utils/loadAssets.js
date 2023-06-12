export default async function loadAssets(assets) {
  const entries = Object.entries(assets)
  const promises = entries.map(([name, promise]) => promise.then(v => [name, v]))
  return Object.fromEntries(await Promise.all(promises))
}
