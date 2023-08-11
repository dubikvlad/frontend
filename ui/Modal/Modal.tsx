import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'
import ReactModal, { Styles } from 'react-modal'
import OutsideClickHandler from 'react-outside-click-handler'

import { useModal, useOpenModal } from '@/contexts'

import styles from './Modal.module.scss'

ReactModal.setAppElement('#__next')

type ModalInitialProps = { children: ReactNode }

export type ModalProps = { isOpen: boolean; closeModal: () => void }

export function Modal({ isOpen, children }: ModalProps & ModalInitialProps) {
  const { asPath } = useRouter()
  const { showScroll, hideScroll } = useModal()
  const { closeModal } = useOpenModal()

  useEffect(() => {
    isOpen ? hideScroll() : showScroll()
  }, [isOpen, showScroll, hideScroll])

  const customStyles: Styles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      overflow: 'hidden auto',
    },
    content: {
      position: 'absolute',
      inset: '0',
      backgroundColor: 'unset',
      border: 'unset',
      display: 'grid',
      justifyItems: 'center',
      alignItems: 'center',
      padding: '20px 0',
    },
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => showScroll(), [])

  // закрывать модальное окно и возвращать скролл окну в случае
  // изменения роута
  useEffect(() => {
    closeModal()
    showScroll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asPath])

  return (
    <ReactModal isOpen={isOpen} style={customStyles}>
      <OutsideClickHandler display="contents" onOutsideClick={closeModal}>
        <div className={styles.wrapper}>{children}</div>
      </OutsideClickHandler>
    </ReactModal>
  )
}
