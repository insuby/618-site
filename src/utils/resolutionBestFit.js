export default function resolutionBestFit(
  resolutions,
  containerWidth = window.innerWidth,
  containerHeight = window.innerHeight,
  adjustForDPI = true,
  lowerQualityForSlowDevices = true,
  gpuBenchmark = null,
) {
  let dpi = window.devicePixelRatio

  if (lowerQualityForSlowDevices) {
    if (gpuBenchmark.tier === 'slow') {
      dpi = 1
      const aspect = containerWidth / containerHeight
      if (aspect > 1) {
        containerWidth = 1366
        containerHeight = 768
      } else {
        containerHeight = 1366
        containerWidth = 768
      }
    }
  }

  containerWidth = adjustForDPI ? containerWidth * dpi : containerWidth
  containerHeight = adjustForDPI ? containerHeight * dpi : containerHeight


  const isContainerLandscape = (containerWidth / containerHeight) > 1

  const variants = resolutions.map((r, index) => ({
    index,
    width: r.width,
    height: r.height,
    isLandscape: (r.width / r.height) > 1,
    difference: Math.abs(containerWidth - r.width) + Math.abs(containerHeight - r.height),
  }))
    .filter(r => r.isLandscape === isContainerLandscape)

  variants.sort((a, b) => a.difference - b.difference)

  for (const variant of variants) {
    if ((variant.width < containerWidth) || (variant.height < containerHeight)) {
      continue
    }
    return resolutions[variant.index]
  }

  return resolutions[variants[variants.length - 1].index]
}
