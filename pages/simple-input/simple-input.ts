import { Observable } from 'rxjs'

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload()
  })
}

const selectors = {
  input: '#my-input',
  content: '#my-content',
}

const dom = {
  input: document.querySelector(selectors.input) as HTMLInputElement,
  content: document.querySelector(selectors.content) as HTMLElement,
}

// const input$: Observable<Event> = Observable.create(observer => {
//   dom.input.addEventListener('input', e => observer.next(e))
// })

// Simpler!
const input$ = Observable.fromEvent(dom.input, 'input')

input$.subscribe(e => {
  dom.content.innerText = dom.input.value
})
