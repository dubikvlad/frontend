import { Cross } from '@/assets/icons'
import { useOpenModal } from '@/contexts'

import { USER_MODAL_TYPES } from '../ModalWrapper'

import styles from './CheckYourEmail.module.scss'

export type CheckYourEmailProps = {
  email: string
}

export function CheckYourEmail({ email }: CheckYourEmailProps) {
  const { openModal, closeModal } = useOpenModal()

  return (
    <div className={styles.wrapper}>
      <div className={styles.crossWrapper} onClick={closeModal}>
        <Cross />
      </div>

      <p className={styles.notificationText}>Notification</p>

      <h3>Check your email</h3>

      <p className={styles.text}>
        We sent you an email to <span>{email}</span> with instructions how to
        reset your password
      </p>

      <p
        className={styles.backToTheSignInText}
        onClick={() => openModal({ type: USER_MODAL_TYPES.SIGN_IN })}
      >
        Back to the sign in
      </p>
    </div>
  )
}
