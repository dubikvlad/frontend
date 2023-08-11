import { PoolData } from '@/api'

import { POOL_MODAL_TYPES, USER_MODAL_TYPES } from './enums'

import type {
  ResetPasswordProps,
  SignInProps,
  CheckYourEmailProps,
  CreateAnAccountProps,
  GolfGroupsTournamentsModalProps,
} from '..'

type ModalType =
  | USER_MODAL_TYPES.CHECK_YOUR_EMAIL
  | USER_MODAL_TYPES.CREATE_AN_ACCOUNT
  | USER_MODAL_TYPES.FORGOT_PASSWORD
  | USER_MODAL_TYPES.INVITE_MEMBERS
  | USER_MODAL_TYPES.JOIN_A_POOL
  | USER_MODAL_TYPES.RESET_PASSWORD
  | POOL_MODAL_TYPES.GOLF_GROUPS_TOURNAMENTS
  | POOL_MODAL_TYPES.MAKE_A_PICK_SUCCESS

type ForgotPasswordModal = {
  type: USER_MODAL_TYPES.FORGOT_PASSWORD
  props?: null
}

type ResetPasswordModal = {
  type: USER_MODAL_TYPES.RESET_PASSWORD
  props: ResetPasswordProps
}

type SignInModal = {
  type: USER_MODAL_TYPES.SIGN_IN
  props?: SignInProps
}

type CheckYourEmailModal = {
  type: USER_MODAL_TYPES.CHECK_YOUR_EMAIL
  props: CheckYourEmailProps
}

type CreateAnAccountModal = {
  type: USER_MODAL_TYPES.CREATE_AN_ACCOUNT
  props?: CreateAnAccountProps
}

type InviteMembersModal = {
  type: USER_MODAL_TYPES.INVITE_MEMBERS
  props?: null
}

type JoinAPoolModal = {
  type: USER_MODAL_TYPES.JOIN_A_POOL
  props?: null
}

type MakePickSuccessNotificationModal = {
  type: POOL_MODAL_TYPES.MAKE_A_PICK_SUCCESS
  props?: null
}

type GolfGroupsTournamentsModal = {
  type: POOL_MODAL_TYPES.GOLF_GROUPS_TOURNAMENTS
  props: GolfGroupsTournamentsModalProps
}

type DashboardMembershipDetailsModal = {
  type: USER_MODAL_TYPES.DASHBOARD_MEMBERSHIP_DETAILS
  props: { pool: PoolData }
}

type ModalWrapperProps =
  | ForgotPasswordModal
  | ResetPasswordModal
  | SignInModal
  | CheckYourEmailModal
  | CreateAnAccountModal
  | GolfGroupsTournamentsModal
  | InviteMembersModal
  | JoinAPoolModal
  | MakePickSuccessNotificationModal
  | DashboardMembershipDetailsModal

export type { ModalType, ModalWrapperProps }
