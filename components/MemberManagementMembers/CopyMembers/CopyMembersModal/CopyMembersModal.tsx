import classNames from 'classnames'

import { Cross } from '@/assets/icons'
import { Modal } from '@/features/ui'
import { usePool } from '@/helpers'

import styles from './CopyMembersModal.module.scss'

export function CopyMembersModal({
  modalIsOpen,
  closeModal,
  countMembers,
  poolId,
}: {
  modalIsOpen: boolean
  closeModal: () => void
  countMembers: number
  poolId: number
}) {
  const { poolData } = usePool(Number(poolId))

  return (
    <Modal isOpen={modalIsOpen} closeModal={closeModal}>
      <div className={styles.wrapper}>
        <div onClick={closeModal}>
          <Cross className={styles.cross} />
        </div>
        <p className={styles.notificationText}>Notification</p>

        <p className={styles.title}>Success!</p>

        <div className={styles.textWrapper}>
          <p>
            <span>{countMembers} members were added</span> to this pool (members
            with a duplicate email address were not copied). Your members will
            see
            <span>the new pool membership</span>
            on their existing account when they log in.
          </p>
          {countMembers === 0 && poolId && poolData && (
            <p>
              <span>
                {poolData.users.length} member{poolData.users.length > 1 && 's'}
              </span>{' '}
              you want to import {poolData.users.length > 1 ? 'are ' : 'is '}
              already in your pool
            </p>
          )}
        </div>

        <div className={styles.buttonsWrapper}>
          <div>
            <button
              className={classNames('button button-blue', styles.button)}
              onClick={closeModal}
            >
              Return to Member management page
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
