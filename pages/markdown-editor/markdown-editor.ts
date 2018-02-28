// Exercise:
// Make the observable more efficient by adding a debounce and throttle.

import './markdown-editor.css'
import { Observable } from 'rxjs'
import * as marked from 'marked'

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload()
  })
}

const selectors = {
  parent: '[data-markdown-editor]',
  editor: '[data-editor]',
  result: '[data-result]',
}

const domParent = document.querySelector(selectors.parent)

const dom = {
  parent: domParent,
  editor: domParent.querySelector(selectors.editor),
  result: domParent.querySelector(selectors.result),
}

const editorChange$ = Observable.fromEvent(dom.editor, 'input').map(
  (e: any) => e.target.value,
)

const efficientMarkdown$ = Observable.merge(
  editorChange$.throttleTime(400),
  editorChange$.debounceTime(400),
).map(markdownText => marked(markdownText) as string)

efficientMarkdown$.subscribe(value => (dom.result.innerHTML = value))
