export const icons = {}

export function registerIcon(icon) {
  for (const [name, value] of Object.entries(icon)) {
    icons[name] = value
    value.data = value.data.replace(/_fill/g, 'fill').replace(/_stroke/g, 'stroke')
  }
}
