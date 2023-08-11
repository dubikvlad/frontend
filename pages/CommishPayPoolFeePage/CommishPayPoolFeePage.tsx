import classNames from 'classnames'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { api } from '@/api'
import { Cross, StepArrow } from '@/assets/icons'
import {
  leadToMonetaryDivision,
  localStorageKeys,
  routes,
} from '@/config/constants'
import { Input, Modal, RHFInput, RHFSelect } from '@/features/ui'
import { ModalProps } from '@/features/ui/Modal'
import { useGetUserInfo, useMessage, usePool } from '@/helpers'

import styles from './CommishPayPoolFeePage.module.scss'

const countryOptions = [
  { title: 'United States', name: 'united-states' },
  { title: 'Canada', name: 'canada' },
  { title: 'Other', name: 'other' },
]

type FormValues = {
  firstName: string
  lastName: string
  emailAdress: string
  country: string
  adress: string
  city: string
  stateProvince: string
  zipPostalCode: string
  phone: string
}

type CommishPayPoolFeePageProps = {
  quantity: string
  poolId: string
  price: string
}

export function CommishPayPoolFeePage({
  quantity,
  poolId,
  price,
}: CommishPayPoolFeePageProps) {
  const { userInfoData, userInfoMutate } = useGetUserInfo()
  const { poolData, poolMutate } = usePool(Number(poolId))

  const [step, setStep] = useState<1 | 2>(1)

  const [isLoading, setIsLoading] = useState(false)
  const [paymentError, setPaymentError] = useMessage()

  const { control, handleSubmit, getValues, setValue } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      emailAdress: '',
      country: countryOptions[0].name,
      adress: '',
      city: '',
      stateProvince: '',
      zipPostalCode: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (window !== undefined) {
      const country = localStorage.getItem(localStorageKeys.country)
      const findItemCountry = countryOptions.find(
        (item) => item.name === country,
      )

      if (findItemCountry) {
        setValue('country', findItemCountry.name)
      }

      const arr: (keyof FormValues)[] = [
        'firstName',
        'lastName',
        'emailAdress',
        'adress',
        'city',
        'stateProvince',
        'zipPostalCode',
        'phone',
      ]

      const formValues = getValues()

      arr.forEach((item) => {
        const localStorageValue = localStorageKeys?.[item]
          ? localStorage.getItem(localStorageKeys[item])
          : null

        if (localStorageValue && item in formValues) {
          setValue(item, localStorageValue)
        }
      })
    }
  }, [setValue, getValues])

  useEffect(() => {
    const { firstName, lastName, emailAdress } = getValues()

    if (userInfoData) {
      if (!firstName) setValue('firstName', userInfoData.first_name)
      if (!lastName) setValue('lastName', userInfoData.last_name)
      if (!emailAdress) setValue('emailAdress', userInfoData.email)
    }
  }, [userInfoData, getValues, setValue])

  const nextStep = () => {
    if (window !== undefined) {
      const formValues = getValues()

      Object.entries(formValues).forEach(([key, value]) => {
        if (key in localStorageKeys && !!value) {
          const item = localStorage.getItem(key)
          if (typeof item === 'string' && item.trim() !== value.trim()) {
            localStorage.setItem(key, value.trim())
          }
        }
      })
    }

    setStep(2)
  }

  const [couponCode, setCouponCode] = useState('')

  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false)

  if (!poolData || !userInfoData) return null

  const actualBalance = userInfoData.wallets.reduce(
    (acc, item) => (acc += item.amount),
    0,
  )

  async function confirmPayment() {
    try {
      setIsLoading(true)

      const res = await api.pools.payment(Number(poolId), {
        amount: Number(price),
        entities_count: Number(quantity),
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

      await Promise.all([poolMutate(), userInfoMutate()])

      setSuccessModalIsOpen(true)
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <h1>Pay pool fee</h1>

      <div className={styles.payPoolFeeWrapper}>
        <div className={styles.stepsWrapper}>
          <div className={styles.steps}>
            <p
              className={classNames({ [styles.stepActive]: step === 1 })}
              onClick={() => step !== 1 && setStep(1)}
            >
              Step 1
            </p>
            <StepArrow />
            <p
              className={classNames({ [styles.stepActive]: step === 2 })}
              onClick={() => step !== 2 && setStep(2)}
            >
              Step 2
            </p>
          </div>

          <p className={styles.title}>
            {step === 1 ? 'Billing Information' : 'Payment Information'}
          </p>

          <div className={styles.description}>
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
          <div
            className={classNames(styles.step1Wrapper, {
              [styles.step1WrapperVisible]: step === 1,
            })}
          >
            <div className={styles.twoColumns}>
              <RHFInput
                control={control}
                name="firstName"
                placeholder="First Name *"
                withLabel
                required
              />

              <RHFInput
                control={control}
                name="lastName"
                placeholder="Last Name *"
                withLabel
                required
              />
            </div>

            <RHFInput
              type="email"
              control={control}
              name="emailAdress"
              placeholder="Email Address *"
              withLabel
              required
            />

            <RHFSelect
              control={control}
              name="country"
              options={countryOptions}
              placeholder="Country *"
              withLabel
              required
            />

            <RHFInput
              control={control}
              name="adress"
              placeholder="Address *"
              withLabel
              required
            />

            <div className={styles.twoColumns}>
              <RHFInput
                control={control}
                name="city"
                placeholder="City *"
                withLabel
                required
              />

              <RHFInput
                control={control}
                name="stateProvince"
                placeholder="State/Province *"
                withLabel
                required
              />
            </div>

            <div className={styles.twoColumns}>
              <RHFInput
                control={control}
                name="zipPostalCode"
                placeholder="ZIP/Postal Code *"
                withLabel
                required
              />

              <RHFInput
                control={control}
                name="phone"
                placeholder="Phone *"
                withLabel
                required
              />
            </div>

            <button
              className={classNames(
                'button button-blue-light',
                styles.nextButton,
              )}
              onClick={handleSubmit(nextStep)}
            >
              Next
            </button>
          </div>

          <div
            className={classNames(styles.step2Wrapper, {
              [styles.step2WrapperVisible]: step === 2,
            })}
          >
            <div className={styles.paymentInformationWrapper}>
              <div className={styles.poolInfoAndTotalInfoWrapper}>
                <div className={styles.poolInfoWrapper}>
                  <p>Pool ID</p>
                  <p>{poolId}</p>
                  <p>Description</p>
                  <p>{poolData.name}</p>
                  <p>Quantity</p>
                  <p>{quantity}</p>
                </div>

                <div className={styles.totalInfoWrapper}>
                  <div className={styles.actualBalanceWrapper}>
                    <p>Actual Balance</p>
                    <p className={styles.actualBalance}>
                      ${leadToMonetaryDivision(actualBalance)}
                    </p>
                  </div>

                  <div className={styles.couponCode}>
                    <Input
                      value={couponCode}
                      onChange={setCouponCode}
                      placeholder="Coupon code"
                    />
                    <button className="button button-blue-light">Apply</button>
                  </div>

                  <div className={styles.totalInfo}>
                    <p>Price</p>
                    <p>${leadToMonetaryDivision(Number(price))}</p>
                    <p>Tax</p>
                    <p>$0.00</p>
                    <p>Discount</p>
                    <p>$0.00</p>
                  </div>

                  <div className={styles.totalPrice}>
                    <p>To Pay</p>
                    <p>${leadToMonetaryDivision(Number(price))}</p>
                  </div>

                  {paymentError && (
                    <div
                      className={classNames('alert alert-danger', styles.alert)}
                    >
                      {paymentError}
                    </div>
                  )}

                  {actualBalance >= Number(price) ? (
                    <button
                      className={classNames(
                        'button button-blue-light',
                        styles.confirmPayment,
                        { disabled: isLoading },
                      )}
                      onClick={handleSubmit(confirmPayment, () => setStep(1))}
                    >
                      Сonfirm payment
                    </button>
                  ) : (
                    <Link
                      href={routes.account.replenish({
                        page: 'pay-pool-fee',
                        poolId,
                        quantity,
                        price,
                      })}
                    >
                      <button
                        className={classNames(
                          'button button-blue-light',
                          styles.replenishButton,
                        )}
                      >
                        Replenish
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={successModalIsOpen}
        closeModal={() => setSuccessModalIsOpen(false)}
      />
    </div>
  )
}

function SuccessModal({ isOpen, closeModal }: ModalProps) {
  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className={styles.modalWrapper}>
        <div className={styles.crossWrapper} onClick={closeModal}>
          <Cross />
        </div>
        <p className={styles.notificationText}>Notification</p>

        <p className={styles.modalTitle}>Success!</p>
        <p className={styles.modalText}>
          Payment <span>was successful</span>, you can continue to enjoy the
          pools
        </p>

        <Link href={routes.account.dashboard} className={styles.modalBtn}>
          <button className="button button-blue-light">Go to Dashboard</button>
        </Link>
      </div>
    </Modal>
  )
}
