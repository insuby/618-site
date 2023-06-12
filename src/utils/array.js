export function getPreviousBy(array, currentPredicate, loop = true) {
  const currentIndex = array.findIndex(currentPredicate)
  let previousIndex = currentIndex - 1

  if (loop && currentIndex === 0) {
    previousIndex = array.length - 1
  }

  return array[previousIndex]
}

export function getNextBy(array, currentPredicate, loop = true) {
  const currentIndex = array.findIndex(currentPredicate)
  let nextIndex = currentIndex + 1

  if (loop && currentIndex === array.length - 1) {
    nextIndex = 0
  }

  return array[nextIndex]
}

export function getPreviousIndex(index, length, loop = true) {
  const currentIndex = index
  let previousIndex = currentIndex - 1

  if (loop && currentIndex === 0) {
    previousIndex = length - 1
  }

  return previousIndex
}

export function getNextIndex(index, length, loop = true) {
  const currentIndex = index
  let nextIndex = currentIndex + 1

  if (loop && currentIndex === length - 1) {
    nextIndex = 0
  }

  return nextIndex
}

export function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }

  return sorted[middle]
}

export function removeOutliers(arr, percentage = 2.5) {
  const sorted = [...arr].sort((a, b) => a - b)
  const l = sorted.length
  const low = Math.round(l * percentage / 100)
  const high = l - low
  return {
    removedElementsCount: low * 2,
    result: sorted.slice(low, high),
  }
}
