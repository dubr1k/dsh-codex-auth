/** Image request form shared by creation and editing. */
import { useState } from 'react'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { CodexAuthKey } from './locales.ts'
import classes from './ImageRequestPanel.module.css'

/** Prepare a visible image request in the main composer.
 * @param props Optional source image, draft action and localized copy.
 * @returns Description and transparent-background controls.
 */
export function ImageRequestPanel({ image, prepare, onPrepared, t }: {
  image?: ImageAttachmentRef
  prepare: (prompt: string) => boolean
  onPrepared?: () => void
  t: (key: CodexAuthKey) => string
}) {
  const [description, setDescription] = useState('')
  const [transparent, setTransparent] = useState(false)
  const [failed, setFailed] = useState(false)
  const text = description.trim()
  const submit = (): void => {
    if (text === '') return
    const instruction = image === undefined ? t('createImagePrompt') : t('editImagePrompt') + `image:${String(image.attachmentId)}`
    const prompt = [instruction, text]
    if (transparent) prompt.push(t('imageTransparentPrompt'))
    const accepted = prepare(prompt.join('\n'))
    setFailed(!accepted)
    if (accepted) onPrepared?.()
  }
  return <div className={classes.panel}>
    <label className={classes.field}>{t(image === undefined ? 'imageDescription' : 'imageChanges')}
      <textarea rows={3} placeholder={image === undefined ? t('imageDescriptionExample') : undefined} value={description} onChange={event => { setDescription(event.target.value) }} />
    </label>
    <label className={classes.checkbox}>
      <input type="checkbox" checked={transparent} onChange={event => { setTransparent(event.target.checked) }} />
      {t('imageTransparentBackground')}
    </label>
    {failed && <p role="alert" className={classes.error}>{t('imageDraftFailed')}</p>}
    <button type="button" className={classes.primary} disabled={text === ''} onClick={submit}>
      {t('imageAddToMessage')}
    </button>
  </div>
}
