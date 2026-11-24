const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

const valid = (rect) => rect && rect.width > 12 && rect.height > 12
const centerX = (rect) => rect.left + rect.width / 2
const centerY = (rect) => rect.top + rect.height / 2
const scaleTo = (from, to) => Math.min(to.width / from.width, to.height / from.height)

export function openGarmentFrom(garment, origin) {
  const from = origin?.getBoundingClientRect()
  const to = garment?.getBoundingClientRect()
  if (reducedMotion() || !valid(from) || !valid(to)) return
  garment.animate([
    { translate: `${centerX(from) - centerX(to)}px ${centerY(from) - centerY(to)}px`, scale: scaleTo(to, from), opacity: .35 },
    { translate: '0px 0px', scale: 1, opacity: 1 },
  ], { duration: 460, easing: 'cubic-bezier(.22,1,.36,1)' })
}

export function flyGarment(photo, target, { arc = false } = {}) {
  const from = photo?.getBoundingClientRect()
  const to = target?.getBoundingClientRect()
  if (reducedMotion() || !photo?.complete || !photo.naturalWidth || !valid(from) || !valid(to) ||
    to.bottom < 0 || to.top > innerHeight || to.right < 0 || to.left > innerWidth) return
  const copy = document.createElement('img')
  copy.src = photo.currentSrc
  copy.className = 'garment-flight'
  copy.setAttribute('aria-hidden', 'true')
  Object.assign(copy.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` })
  document.body.append(copy)

  const x = centerX(to) - centerX(from)
  const y = centerY(to) - centerY(from)
  const scale = Math.max(.06, scaleTo(from, to))
  const frames = [
    { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
    ...(arc ? [{ transform: `translate3d(${x * .55}px,${y * .55 - 55}px,0) scale(.55)`, opacity: .9, offset: .56 }] : []),
    { transform: `translate3d(${x}px,${y}px,0) scale(${scale})`, opacity: 0 },
  ]
  const animation = copy.animate(frames, { duration: arc ? 620 : 360, easing: 'cubic-bezier(.38,.06,.32,1)' })
  animation.finished.then(() => {
    copy.remove()
    if (arc) target.animate([{ scale: 1 }, { scale: 1.22, rotate: '-7deg' }, { scale: 1, rotate: '0deg' }], { duration: 340 })
  }, () => copy.remove())
}
