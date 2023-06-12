export function getTroikaTextCharRect(text, charIndex) {
  if (!text._textRenderInfo) {
    return undefined
  }

  const startIndex = charIndex * 4

  const minX = text._textRenderInfo.glyphBounds[startIndex]
  const minY = text._textRenderInfo.glyphBounds[startIndex + 1]
  const maxX = text._textRenderInfo.glyphBounds[startIndex + 2]
  const maxY = text._textRenderInfo.glyphBounds[startIndex + 3]

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function getTroikaTextSubstringRect(text, substring, worldSpace = false) {
  const textWithoutSpaces = text.text.replace(/\s/g, '')
  const substringWithoutSpaces = substring.replace(/\s/g, '')
  const startIndex = textWithoutSpaces.indexOf(substringWithoutSpaces)
  const endIndex = startIndex + substringWithoutSpaces.length

  let minX = 99999999
  let minY = 99999999
  let maxX = -99999999
  let maxY = -99999999

  for (let i = startIndex; i < endIndex; i++) {
    const rect = getTroikaTextCharRect(text, i)
    if (!rect) {
      return undefined
    }
    minX = Math.min(minX, rect.minX)
    minY = Math.min(minY, rect.minY)
    maxX = Math.max(maxX, rect.maxX)
    maxY = Math.max(maxY, rect.maxY)
  }

  const pos = text.position

  if (worldSpace) {
    text.getWorldPosition(pos)
  }

  minX += pos.x
  minY += pos.y

  maxX += pos.x
  maxY += pos.y

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function getTroikaTextRect(text) {
  if (!text?._textRenderInfo?.blockBounds) {
    return undefined
  }

  const [minX, minY, maxX, maxY] = text._textRenderInfo.blockBounds
  const width = maxX - minX
  const height = maxY - minY

  return {
    width,
    height,
    left: minX,
    right: maxX,
    top: maxY,
    bottom: minY,
  }
}
