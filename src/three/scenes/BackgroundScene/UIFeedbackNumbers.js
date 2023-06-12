import UIRoot from '../../ui/lib/UIRoot'
import UIText from '../../ui/lib/UIText'
import phiNumbers from '../../../../assets/data/phiNumbers'
import font from '../../../../assets/fonts/CoFo-Kak-Regular.woff'

export default class UIFeedbackNumbers extends UIRoot {
  constructor(engine) {
    super(engine)

    this.numbersText = new UIText(phiNumbers, font, 24)
    this.numbersText.troikaText.overflowWrap = 'break-word'
    this.numbersText.troikaText.lineHeight = 0.7
    this.numbersText.setAnchors(0, 1, 0, 1)

    this.add(this.numbersText)
  }

  layout() {
    const width = (this.width + 48) / this.height
    if (this.numbersText.troikaText.maxWidth !== width) {
      this.numbersText.troikaText.maxWidth = width
    }

    super.layout()

    this.numbersText.troikaText.clipRect = [0, (this.numbersText.height - this.height) / this.height, 999, 999]

    this.numbersText.textSize = 24 / this.pixelRatio
  }
}

