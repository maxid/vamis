const HIDE_CLASS = 'pe-no-print'
const PRESERVE_CLASS = 'pe-preserve-print'
const ANCESTOR_CLASS = 'pe-preserve-ancestor'

function walkSiblings(element: Element, callback: (element: Element) => void) {
  let sibling = element.previousElementSibling
  while (sibling) {
    callback(sibling)
    sibling = sibling.previousElementSibling
  }
  sibling = element.nextElementSibling
  while (sibling) {
    callback(sibling)
    sibling = sibling.nextElementSibling
  }
}

function walkTree(element: Element, callback: (element: Element, start: boolean) => void) {
  let current: Element | null = element
  callback(current, true)
  current = current.parentElement
  while (current && current.nodeName !== 'BODY') {
    callback(current, false)
    current = current.parentElement
  }
}

function attach(element: Element, start: boolean) {
  element.classList.remove(HIDE_CLASS)
  element.classList.add(PRESERVE_CLASS)
  if (!start) element.classList.add(ANCESTOR_CLASS)
  walkSiblings(element, (sibling) => {
    if (!sibling.classList.contains(PRESERVE_CLASS)) sibling.classList.add(HIDE_CLASS)
  })
}

function cleanup(element: Element) {
  element.classList.remove(HIDE_CLASS, PRESERVE_CLASS, ANCESTOR_CLASS)
  walkSiblings(element, (sibling) => sibling.classList.remove(HIDE_CLASS, PRESERVE_CLASS, ANCESTOR_CLASS))
}

export function printElements(elements: Element[]): void {
  if (!elements.length || typeof window === 'undefined') return
  for (const element of elements) walkTree(element, attach)
  try {
    window.print()
  } finally {
    for (const element of elements) walkTree(element, (node) => cleanup(node))
  }
}
