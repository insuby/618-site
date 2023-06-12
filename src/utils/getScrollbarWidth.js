// Based on https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript
export default function getScrollbarWidth(element) {
  if (element) {
    const borderRightWidth = +getComputedStyle(element)
      .getPropertyValue('border-right-width')
      .slice(0, -2)
    const borderLeftWidth = +getComputedStyle(element)
      .getPropertyValue('border-left-width')
      .slice(0, -2)

    return element.offsetWidth - element.clientWidth - borderLeftWidth - borderRightWidth
  }

  element = document.createElement('div')
  element.style.position = 'absolute'
  element.style.top = '0'
  element.style.visibility = 'hidden'
  element.style.overflow = 'scroll'
  document.body.appendChild(element)

  const scrollbarWidth = element.offsetWidth - element.clientWidth

  element.parentNode.removeChild(element)

  return scrollbarWidth
}
