import './ajax-example.scss'
import { Observable } from 'rxjs'

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload()
  })
}

interface BookFound {
  state: 'found'
  data: any
}

interface BookNotFound {
  state: 'not-found'
}

interface BookLoading {
  state: 'loading'
}

type BookResponse = BookNotFound | BookFound | BookLoading

const restfulUrls = {
  search: title => `http://openlibrary.org/search.json?q=${title}`,
  cover: (idType, id) =>
    `http://covers.openlibrary.org/b/${idType}/${id}-M.jpg`,
}

const selectors = {
  input: '[data-input]',
  result: '[data-result]',
}

const dom = {
  input: document.querySelector(selectors.input),
  result: document.querySelector(selectors.result) as HTMLElement,
}

const input$ = Observable.fromEvent(dom.input, 'input')
  .map((event: any) => event.target.value as string)
  .map(value => value.trim())

const betterInput$ = Observable.merge(
  input$.throttleTime(300),
  input$.debounceTime(300),
)

const bookRequest$ = betterInput$.switchMap(value =>
  Observable.ajax({ url: restfulUrls.search(value), crossDomain: true })
    .map(({ response }) => response)
    .map<any, BookResponse>(response => {
      if (response.numFound === 0) {
        return {
          state: 'not-found',
        }
      }

      return {
        state: 'found',
        data: response,
      }
    })
    .startWith<BookResponse>({ state: 'loading' }),
)

bookRequest$.subscribe(response => {
  switch (response.state) {
    case 'found':
      const doc = response.data.docs[0]
      dom.result.innerText = JSON.stringify(doc, null, 2)
      break

    case 'loading':
      dom.result.innerText = 'Loading...'
      break

    case 'not-found':
      dom.result.innerText = 'No results found'
      break
  }
})
