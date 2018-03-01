/*

The idea here is to see how can we actually apply the idea
in some complicated scenario like this one:

Input validation requirement:

- Input validation is applied on blur.
- Input validation is applied on form submit.
- Input validation is applied while typing, but, this validation is only applied after
  blur or after the first submit of the form (with errors). It will be really
  weird for the user to see the errors the first time is typing... right?

*/

import './input-validation.scss'
import { Observable } from 'rxjs'

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload()
  })
}

const selectors = {
  form: '[data-form]',
}

const dom = {
  form: document.querySelector(selectors.form) as HTMLFormElement,
}

const inputsObject = Array.from(dom.form.elements).filter(
  element => element.tagName === 'INPUT',
) as HTMLInputElement[]

const formSubmit$ = Observable.fromEvent<Event>(dom.form, 'submit').do(
  event => {
    event.preventDefault()
  },
)

// Just for now so it doesn't send anything
formSubmit$.subscribe(() => {})

function createInputValidationStream(
  formSubmit$: Observable<Event>,
  inputEl: HTMLInputElement,
): Observable<HTMLInputElement> {
  const blur$ = Observable.fromEvent(inputEl, 'blur')
  const firstBlur$ = blur$.first()
  const firstFormSubmit$ = formSubmit$.first()
  const inputAfterFirstBlur$ = Observable.merge(
    firstBlur$,
    firstFormSubmit$,
  ).switchMap(() => Observable.fromEvent(inputEl, 'input'))

  return Observable.merge(blur$, formSubmit$, inputAfterFirstBlur$).mapTo(
    inputEl,
  )
}

const formInputs$ = Observable.from(inputsObject).flatMap(input =>
  createInputValidationStream(formSubmit$, input),
)

formInputs$.subscribe(input => {
  console.log('Running validation for:', input)
})
