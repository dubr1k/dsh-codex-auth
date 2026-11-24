/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageCreateAction } from '../src/client/ImageCreateAction.tsx'
import { ImageRequestPanel } from '../src/client/ImageRequestPanel.tsx'
import { en } from '../src/client/locales.ts'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'

afterEach(cleanup)
const t = (key: keyof typeof en) => en[key]
const image: ImageAttachmentRef = { attachmentId: 'sha256:cat' as ImageAttachmentRef['attachmentId'], mediaType: 'image/png', bytes: 3, width: 1024, height: 1024 }

describe('image request controls', () => {
  it('opens creation controls from the chat and closes after preparing the message', () => {
    const prepare = vi.fn((_prompt: string) => true)
    render(<ImageCreateAction prepare={prepare} t={t} />)
    fireEvent.click(screen.getByRole('button', { name: 'Create image' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Describe the image'), { target: { value: 'A kitten' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add to message' }))
    expect(prepare).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('prepares a description without adding image parameters', () => {
    const prepare = vi.fn((_prompt: string) => true)
    render(<ImageRequestPanel prepare={prepare} t={t} />)
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.queryByLabelText('Custom size')).toBeNull()
    expect(screen.queryByText('Quality')).toBeNull()
    const add = screen.getByRole('button', { name: 'Add to message' })
    expect((add as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('Describe the image'), { target: { value: 'A kitten' } })
    fireEvent.click(add)
    expect(prepare).toHaveBeenCalledWith('Create an image.\nA kitten')
  })

  it('requests a transparent background for the selected image', () => {
    const prepare = vi.fn((_prompt: string) => true)
    render(<ImageRequestPanel image={image} prepare={prepare} t={t} />)
    fireEvent.change(screen.getByLabelText('Describe the changes'), { target: { value: 'Blue cup' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Transparent background' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add to message' }))
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining('image:sha256:cat'))
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining('Blue cup'))
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining('background="transparent"'))
  })
})
