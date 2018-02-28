import { Observable } from 'rxjs'

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload()
  })
}

const selectors = {}

const dom = {}
