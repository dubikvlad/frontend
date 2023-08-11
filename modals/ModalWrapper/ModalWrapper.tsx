import { Modal } from '@/features/ui'
import { useAdaptiveBreakpoints } from '@/helpers'

import {
  CheckYourEmail,
  CreateAnAccount,
  ForgotPassword,
  GolfGroupsTournamentsModal,
  InviteMembers,
  JoinAPool,
  MakePickSuccessNotification,
  ResetPassword,
  SignIn,
  DashboardMembershipDetails,
} from '..'

import { POOL_MODAL_TYPES, USER_MODAL_TYPES } from './enums'

import type { ModalWrapperProps } from './types'

export const ModalWrapper = ({
  modal,
  closeModal,
}: {
  modal: ModalWrapperProps | null
  closeModal: () => void
}) => {
  const { breakpoint } = useAdaptiveBreakpoints(['md'])

  const renderContent = () => {
    if (modal) {
      switch (modal.type) {
        case USER_MODAL_TYPES.FORGOT_PASSWORD:
          return <ForgotPassword />
        case USER_MODAL_TYPES.RESET_PASSWORD:
          return <ResetPassword {...modal.props} />
        case USER_MODAL_TYPES.CHECK_YOUR_EMAIL:
          return <CheckYourEmail {...modal.props} />
        case USER_MODAL_TYPES.SIGN_IN:
          return <SignIn {...modal.props} breakpoint={breakpoint} />
        case USER_MODAL_TYPES.CREATE_AN_ACCOUNT:
          return <CreateAnAccount {...modal.props} breakpoint={breakpoint} />
        case USER_MODAL_TYPES.INVITE_MEMBERS:
          return <InviteMembers />
        case USER_MODAL_TYPES.JOIN_A_POOL:
          return <JoinAPool />
        case POOL_MODAL_TYPES.GOLF_GROUPS_TOURNAMENTS:
          return <GolfGroupsTournamentsModal {...modal?.props} />
        case POOL_MODAL_TYPES.MAKE_A_PICK_SUCCESS:
          return <MakePickSuccessNotification />
        case USER_MODAL_TYPES.DASHBOARD_MEMBERSHIP_DETAILS:
          return <DashboardMembershipDetails {...modal.props} />
        default:
          return null
      }
    }
  }

  return (
    <Modal isOpen={!!modal} closeModal={closeModal}>
      {renderContent()}
    </Modal>
  )
}
