import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'

import { api } from '@/api'
import { Cross } from '@/assets/icons'
import { mastercard, visa, americanExpress } from '@/assets/img'
import {
  leadToMonetaryDivision,
  ReplenishParamsType,
  routes,
  PayPoolFeeParamsType,
} from '@/config/constants'
import { Input, Modal } from '@/features/ui'
import { ModalProps } from '@/features/ui/Modal'
import { useGetUserInfo, useMessage, usePool } from '@/helpers'

import styles from './ReplenishPage.module.scss'

export function ReplenishPage() {
  const { query } = useRouter()

  const { page, poolId, quantity, price } = query as ReplenishParamsType &
    Partial<PayPoolFeeParamsType>

  const { userInfoData, userInfoMutate } = useGetUserInfo()
  const { poolData } = usePool(poolId ? Number(poolId) : undefined)

  const isCommissioner =
    userInfoData && poolData ? userInfoData.id === poolData.user_id : false

  const [amount, setAmount] = useState('')
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    if (price && userInfoData) {
      const balance = userInfoData.wallets.reduce(
        (sum, item) => (sum += item.amount),
        0,
      )
      if (Number(price) > balance) setTotal(Number(price) - balance)
    }
  }, [price, userInfoData])

  const [cardNumber, setCardNumber] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [securityCode, setSecurityCode] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [paymentError, setPaymentError] = useMessage()

  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false)

  if (!userInfoData) return null

  function calculateQuantity(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTotal(Number(amount))
    setAmount('')
  }

  const isSubmitPayment =
    !!total &&
    cardNumber.replace(/\s/g, '').length === 16 &&
    expirationDate.length === 5 &&
    securityCode.length >= 3

  async function submitPayment() {
    try {
      if (!userInfoData) return

      const [expMonth, expYear] = expirationDate.split('/')
      if (!expMonth || !expYear) return

      setIsLoading(true)

      const res = await api.pools.walletReplenishment({
        first_name: userInfoData.first_name,
        last_name: userInfoData.last_name,
        email: userInfoData.email,
        // todo: исправить на актуальные данные
        phone: 'test', // !
        address: 'test', // !
        card_num: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        card_code: securityCode,
        amount: String(total),
      })

      if (res.error) {
        if ('message' in res.error) {
          setPaymentError(res.error.message)
        }

        if ('messages' in res.error) {
          setPaymentError(res.error.getFirstMessage())
        }

        setIsLoading(false)
        return
      }

      setSuccessModalIsOpen(true)
      setIsLoading(false)
      userInfoMutate()
    } catch (err) {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <h1>Replenish the balance</h1>

      <div className={styles.replenishWrapper}>
        <div className={styles.paymentInformationWrapper}>
          <p className={styles.paymentInformationTitle}>Payment Information</p>

          <div className={styles.paymentInformationText}>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&apos;s standard dummy
              text ever since the 1500s, when an unknown printer took a galley
              of type and scrambled it to make a type specimen book.
            </p>

            <p>
              It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged
            </p>
          </div>
        </div>

        <div>
          <div className={styles.accountInfoAndTotalWrapper}>
            <div className={styles.accountInfoWrapper}>
              <p>Account ID</p>
              <p>{userInfoData.id}</p>
              <p>Name</p>
              <p>
                {userInfoData.first_name} {userInfoData.last_name}
              </p>
              <p>Description</p>
              <p>Replenishment of balance</p>
            </div>

            <div className={styles.accountTotalWrapper}>
              <form
                className={styles.quantityWrapper}
                onSubmit={calculateQuantity}
              >
                <Input
                  type="money"
                  placeholder="Amount"
                  value={amount}
                  onChange={setAmount}
                />

                <button
                  className={classNames(
                    'button button-blue-light',
                    styles.applyBtn,
                    { disabled: !amount.trim() || /^\d+\.$/.test(amount) },
                  )}
                >
                  Apply
                </button>
              </form>

              <div className={styles.quantityInfo}>
                <p>Amount</p>
                <p>${leadToMonetaryDivision(total)}</p>
                <p>Tax</p>
                <p>$0.00</p>
              </div>

              <div className={styles.totalInfo}>
                <p>Total</p>
                <p>${leadToMonetaryDivision(total)}</p>
              </div>
            </div>
          </div>

          <div className={styles.creditCardInformationWrapper}>
            <div className={styles.creditCardInformation}>
              <p className={styles.creditCardInformationTitle}>
                Credit Card Information
              </p>

              {!!paymentError && (
                <div className="alert alert-danger">{paymentError}</div>
              )}

              <Input
                type="card-number"
                value={cardNumber}
                onChange={setCardNumber}
                placeholder="Card Number *"
                withLabel
              />

              <div className={styles.expirationDateAndSecurityCode}>
                <Input
                  type="expiration-date"
                  value={expirationDate}
                  onChange={setExpirationDate}
                  placeholder="Expiration Date *"
                  withLabel
                />

                <Input
                  type="number"
                  value={securityCode}
                  onChange={(value) =>
                    value.length <= 4 && setSecurityCode(value)
                  }
                  placeholder="Security Code *"
                  withLabel
                />
              </div>
            </div>

            <div className={styles.cardsListAndDescription}>
              <div className={styles.cardsList}>
                <Image
                  src={mastercard.src}
                  width={mastercard.width}
                  height={mastercard.height}
                  alt="mastercard"
                />

                <Image
                  src={visa.src}
                  width={visa.width}
                  height={visa.height}
                  alt="visa"
                />

                <Image
                  src={americanExpress.src}
                  width={americanExpress.width}
                  height={americanExpress.height}
                  alt="americanExpress"
                />
              </div>

              <div className={styles.creditCardDescription}>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry.
                </p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        className={classNames('button button-blue-light', styles.submitBtn, {
          disabled: !isSubmitPayment || isLoading,
        })}
        onClick={submitPayment}
      >
        Submit payment
      </button>

      <SuccessModal
        isOpen={successModalIsOpen}
        closeModal={() => setSuccessModalIsOpen(false)}
        page={page}
        poolId={poolId}
        quantity={quantity}
        price={price}
        isCommissioner={isCommissioner}
      />
    </div>
  )
}

type SuccessModalProps = ModalProps &
  (ReplenishParamsType & Partial<PayPoolFeeParamsType>) & {
    isCommissioner: boolean
  }

function SuccessModal({
  isOpen,
  closeModal,
  page,
  poolId,
  quantity,
  price,
  isCommissioner = false,
}: SuccessModalProps) {
  function processingInfo() {
    if (
      page === 'pay-pool-fee' &&
      poolId &&
      quantity &&
      price &&
      isCommissioner
    ) {
      return {
        text: 'Your balance <span>was successfully replenished</span>, you can return to Pay pool fee',
        link: routes.account.commish.payPoolFee(Number(poolId), {
          quantity,
          price,
        }),
        linkText: 'Go to Pay pool fee',
      }
    }

    if (page === 'payment' && poolId && isCommissioner) {
      return {
        text: 'Your balance <span>was successfully replenished</span>, you can return to Payment page',
        link: routes.account.commish.payment(Number(poolId)),
        linkText: 'Go to Payment',
      }
    }

    return {
      text: 'Payment <span>was successful</span>, you can continue to enjoy the pools',
      link: routes.account.dashboard,
      linkText: 'Go to Dashboard',
    }
  }

  const { text, link, linkText } = processingInfo()

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className={styles.modalWrapper}>
        <div className={styles.crossWrapper} onClick={closeModal}>
          <Cross />
        </div>
        <p className={styles.notificationText}>Notification</p>

        <p className={styles.modalTitle}>Success!</p>
        <p
          className={styles.modalText}
          dangerouslySetInnerHTML={{ __html: text }}
        />

        <Link href={link} className={styles.modalBtn}>
          <button className="button button-blue-light">{linkText}</button>
        </Link>
      </div>
    </Modal>
  )
}
