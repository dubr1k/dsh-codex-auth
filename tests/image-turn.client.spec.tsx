/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { CodexTurnImages, generatedImageDefinition } from '../src/client/CodexTurnImages.tsx'
import { en } from '../src/client/locales.ts'

const image: ImageAttachmentRef = { attachmentId: 'sha256:cat' as ImageAttachmentRef['attachmentId'], mediaType: 'image/png', bytes: 3, width: 1024, height: 1024, name: 'cat.png' }
afterEach(cleanup)

describe('generated image turn artifacts', () => {
  it('shows the image outside process details and prepares an edit for that exact image', async () => {
    const edit = vi.fn(() => true)
    render(<CodexTurnImages images={[image]} loadImage={async () => 'blob:cat'} editImage={edit} t={key => en[key]} />)
    expect(await screen.findByRole('img', { name: 'cat.png' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Edit image' }))
    expect(edit).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Describe the changes'), { target: { value: 'Blue cup' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add to message' }))
    expect(edit).toHaveBeenCalledWith(image, expect.stringContaining('image:sha256:cat'))
    expect(edit).toHaveBeenCalledWith(image, expect.stringContaining('Blue cup'))
  })

  it('opens the stock image menu for the same original from the thumbnail and preview', async () => {
    const openMenu = vi.fn()
    const getTriggerProps = (target: object | undefined) => ({
      onContextMenu: () => { if (target !== undefined) openMenu(target) },
    })
    render(<CodexTurnImages images={[image]} loadImage={async () => 'blob:cat'} editImage={() => false}
      getTriggerProps={getTriggerProps} t={key => en[key]} />)
    const thumbnail = await screen.findByRole('img', { name: 'cat.png' })
    const target = { kind: 'image', value: { url: 'blob:cat', name: 'cat.png', mediaType: 'image/png' } }

    fireEvent.contextMenu(thumbnail)
    expect(openMenu).toHaveBeenNthCalledWith(1, target)

    fireEvent.click(screen.getByRole('button', { name: 'Open original image: cat.png' }))
    const preview = screen.getByRole('dialog', { name: 'Original image preview' })
    fireEvent.contextMenu(within(preview).getByRole('img', { name: 'cat.png' }))
    expect(openMenu).toHaveBeenNthCalledWith(2, target)
  })

  it('reports refusal to prepare a draft', () => {
    render(<CodexTurnImages images={[image]} loadImage={async () => 'blob:cat'} editImage={() => false} t={key => en[key]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit image' }))
    fireEvent.change(screen.getByLabelText('Describe the changes'), { target: { value: 'Blue cup' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add to message' }))
    expect(screen.getByRole('alert').textContent).toContain('draft')
  })

  it('accumulates successful generation results but excludes failed calls and reference images', () => {
    const start = generatedImageDefinition.start({} as never, { event: { type: 'turn/start', data: { turn: 1 } } } as never, {} as never)
    const publication = generatedImageDefinition.buildLocationData?.({ state: start } as never, 'turn', null)
    expect(publication?.key).toBe(generatedImageDefinition.kind)
    const called = generatedImageDefinition.update({ state: start } as never, { event: { type: 'tool/call', data: { name: 'generate_image', callId: 'call' } } } as never)
    const event = { type: 'tool/result', data: { message: { source: { callId: 'call' }, isError: false }, meta: { images: [{ attachment: image }], references: [{ attachment: { ...image, name: 'reference.png' } }] } } }
    const done = generatedImageDefinition.update({ state: called } as never, { event } as never)
    expect(done.images).toEqual([image])
    expect(generatedImageDefinition.update({ state: called } as never, { event: { ...event, data: { ...event.data, message: { ...event.data.message, isError: true } } } } as never).images).toEqual([])
  })
})
