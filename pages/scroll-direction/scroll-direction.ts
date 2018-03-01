import { Observable } from 'rxjs'

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload()
  })
}

// Basic behavior
const scroll$ = Observable.fromEvent(window, 'scroll')
const improvedScroll$ = Observable.merge(
  scroll$.throttleTime(80),
  scroll$.debounceTime(80),
)

// Useful for infinite scroll functionality
const scrollHitsBottom$ = improvedScroll$.filter(() => {
  const { scrollHeight, clientHeight } = document.documentElement
  return scrollHeight <= clientHeight + window.scrollY
})

scrollHitsBottom$.subscribe(() => {
  console.log('scroll hits bottom')
})

// Scroll direction logic
interface ScrollState {
  lastValue: number
  currentValue: number
}

const scrollState$ = improvedScroll$.map(() => window.scrollY).scan(
  (acc: ScrollState, next: number) => ({
    lastValue: acc.currentValue,
    currentValue: next,
  }),
  { lastValue: 0, currentValue: 0 } as ScrollState,
)

// scrollState$.subscribe(value => console.log(value))

// Scroll up
const scrollUp$ = scrollState$.filter(
  state => state.lastValue > state.currentValue,
)

scrollUp$.subscribe(value => console.log('Scrolling up'))

// Scroll down
const scrollDown$ = scrollState$.filter(
  state => state.lastValue < state.currentValue,
)

scrollDown$.subscribe(value => console.log('Scrolling down'))
