/**
 * Special thanks to @jberivera for this great buffer example.
 */
import './buffer-combo.scss'
import { Observable } from 'rxjs'

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload()
  })
}

const pageKeyUp$ = Observable.fromEvent(window, 'keyup')
const pageKeyDown$ = Observable.fromEvent(window, 'keydown')

const animationGif = document.querySelector('.animation') as HTMLImageElement
const messageBox = document.querySelector('.message')

const shoryukenSrc =
  'http://gifimage.net/wp-content/uploads/2017/08/shoryuken-gif-5.gif'
const hadoukenSrc = 'http://i.imgur.com/XdPcgXi.gif'

const timing$ = pageKeyDown$.switchMap(() => Observable.interval(500).first())

const pageKeyDownRecord$ = pageKeyDown$
  .buffer(pageKeyUp$)
  .switchMap(events =>
    Observable.of(
      events
        .sort((code1: any, code2: any) => code2.keyCode - code1.keyCode)
        .map((event: any) => event.code)
        .join(''),
    ),
  )
  .filter((code: any) => code)

const bufferCombo$ = pageKeyDownRecord$.buffer(timing$)

const keyData = {
  '←': {
    code: 'ArrowLeft',
    symbol: '&#8592;',
  },
  '↑': {
    code: 'ArrowUp',
    symbol: '&#8593;',
  },
  '→': {
    code: 'ArrowRight',
    symbol: '&#8594;',
  },
  '↓': {
    code: 'ArrowDown',
    symbol: '&#8595;',
  },
  '↘': {
    code: 'ArrowDownArrowRight',
    symbol: '&#8600;',
  },
  A: {
    code: 'KeyA',
    symbol: 'A',
  },
  B: {
    code: 'KeyB',
    symbol: 'B',
  },
}

// ← ↑ → ↓ ↘
const ryu = {
  shoryuken: {
    combo: '→ ↓ ↘ A',
    src: shoryukenSrc,
    duration: 1300,
  },
  'quote-1': {
    combo: '→ ↓ ↘ →',
    message: 'Damn it!',
  },
  hadouken: {
    combo: '↓ ↘ → A',
    src: hadoukenSrc,
    duration: 1700,
  },
  'quote-2': {
    combo: '↓ ↘ → →',
    message: 'Noob!',
  },
  'quote-3': {
    combo: '↓ ↘ → B',
    message: 'En la jeta perro!',
  },
}

function createCombo(strCombo) {
  const codeCombo = strCombo
    .split(/\s/g)
    .map(key => keyData[key].code)
    .join('-')

  return bufferCombo$.filter(combo => combo.join('-') === codeCombo)
}

Object.keys(ryu).forEach(comboName => {
  const { combo, src, duration = 1000, message } = ryu[comboName]
  const combo$ = createCombo(combo)

  combo$.subscribe(combo => {
    console.log(`${comboName}!!!!!!!!`, combo)

    if (src) {
      animationGif.src = src
      animationGif.classList.add('show', comboName)
    } else {
      messageBox.classList.add('show')
      messageBox.innerHTML = `${message}!!!!!!`
    }
  })

  const comboEnd$ = combo$.switchMap(() =>
    Observable.interval(duration).first(),
  )

  comboEnd$.subscribe(() => {
    if (src) {
      animationGif.src = ''
      animationGif.classList.remove('show', comboName)
    } else {
      messageBox.classList.remove('show')
      messageBox.innerHTML = ''
    }
  })
})

/**
  This is for the UI Combo Tracker purpuses only (.combo-tracker)
**/
const combosTracker = document.querySelector('.combo-tracker')

Object.keys(ryu).forEach(comboName => {
  const { combo } = ryu[comboName]
  const symbols = combo.split(/\s/g)

  const comboDom = document.createElement('div')
  comboDom.className = `combo ${comboName}-combo`

  comboDom.innerHTML = createComboHTML({ comboName, symbols })

  combosTracker.appendChild(comboDom)

  const styles = createComboTrackerStyles({ comboName, symbols })
  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = styles

  document.head.appendChild(style)
})

function createComboHTML({ comboName, symbols }) {
  return `
    <h2 class="h2">${comboName}</h2>

      <div class="combo-container">
        <div class="combo-symbols">
          ${symbols
            .map((symbol, i) => {
              const key = keyData[symbol]

              return `
                <div
                  class="combo-symbol ${key.code.toLowerCase()} order-${i + 1}"
                >
                  ${key.symbol}
                </div>
              `
            })
            .join('')}
        </div>
      </div>
    </div>
  `
}

function createComboTrackerStyles({ comboName, symbols }) {
  const symbolClasses = symbols.map((symbol, i) => {
    const key = keyData[symbol]
    const symbolClass = key.code.toLowerCase()
    const orderClass = `order-${i + 1}`

    return `.${symbolClass}.${orderClass}`
  })

  return symbolClasses.reduce((style, symbolClass, i, array) => {
    return `
        ${style}

        .${comboName}-combo ${array.slice(0, i + 1).join('.active + ')}.active {
          color: tomato;
        }
      `
  }, '')
}

const keyRecordCount$ = pageKeyDownRecord$
  .merge(timing$.map(() => 'reset'))
  .scan((acc, code) => (code === 'reset' ? 0 : acc + 1), 0)
  .filter(i => i !== 0)

pageKeyDownRecord$.zip(keyRecordCount$).subscribe(([code, i]) => {
  document
    .querySelectorAll(`.${code.toLowerCase()}.order-${i}`)
    .forEach(symbol => {
      symbol.classList.add('active')
    })
})

timing$.subscribe(code => {
  document.querySelectorAll('.active').forEach(symbol => {
    symbol.classList.remove('active')
  })
})
