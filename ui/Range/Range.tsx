import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'

import styles from './Range.module.scss'

type RangeProps = {
  min: number
  max: number
  onChange: (minValue: number, maxValue: number) => void
  maxWidth?: number | string
  className?: string
  labelTextMin?: (minValue: number) => string
  labelTextMax?: (maxValue: number) => string
}

export function Range({
  min = 1,
  max = 10,
  onChange,
  maxWidth,
  className,
  labelTextMin,
  labelTextMax,
}: RangeProps) {
  const leftRangeValueRef = useRef<HTMLParagraphElement>(null)
  const rightRangeValueRef = useRef<HTMLParagraphElement>(null)

  const [leftRangeValue, setLeftRangeValue] = useState<number>(min)
  const [rightRangeValue, setRightRangeValue] = useState<number>(max)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onChange) onChange(leftRangeValue, rightRangeValue)
    }, 2000)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftRangeValue, rightRangeValue])

  useEffect(() => {
    setLeftRangeValue(min)
    setRightRangeValue(max)
  }, [min, max])

  const [isShiftText, setIsShiftText] = useState<boolean>(false)

  useEffect(() => {
    if (leftRangeValueRef.current && rightRangeValueRef.current) {
      const l = leftRangeValueRef.current
      const r = rightRangeValueRef.current

      setIsShiftText(l.offsetLeft + l.offsetWidth >= r.offsetLeft)
    }
  }, [leftRangeValueRef, rightRangeValueRef, leftRangeValue, rightRangeValue])

  const leftBackgroundValue = (
    ((leftRangeValue - min) * 100) /
    (max - min)
  ).toFixed(2)

  const rightBackgroundValue = (
    ((rightRangeValue - min) * 100) /
    (max - min)
  ).toFixed(2)

  const isLeftTextShifts = leftRangeValue >= max / 2
  const isRightTextShifts = rightRangeValue <= max / 2

  if (max <= min) {
    return (
      <p>
        Error: the maximum value cannot be less than or equal to the minimum
        value
      </p>
    )
  }

  const labelMin = labelTextMin ? labelTextMin(leftRangeValue) : undefined
  const labelMax = labelTextMax ? labelTextMax(rightRangeValue) : undefined

  return (
    <div
      className={classNames(styles.multiRange, className)}
      style={{
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
      }}
    >
      <p
        ref={leftRangeValueRef}
        className={styles.leftRangeValueText}
        style={{
          left: `calc(${leftBackgroundValue}% + 6.5px)`,
          transform:
            (isLeftTextShifts && isShiftText) || isShiftText
              ? `translateX(-100%)`
              : undefined,
        }}
      >
        {labelMin ?? leftRangeValue}
      </p>

      <p
        ref={rightRangeValueRef}
        className={styles.rightRangeValueText}
        style={{
          right: `calc(100% - ${rightBackgroundValue}%)`,
          transform:
            (isRightTextShifts && isShiftText) || isShiftText
              ? 'translateX(100%)'
              : undefined,
        }}
      >
        {labelMax ?? rightRangeValue}
      </p>

      <input
        type="range"
        min={min}
        max={max}
        value={leftRangeValue}
        onChange={(event) =>
          Number(event.target.value) < rightRangeValue &&
          setLeftRangeValue(Number(event.target.value))
        }
        className={classNames(styles.input, styles.leftInput)}
      />

      <input
        type="range"
        min={min}
        max={max}
        value={rightRangeValue}
        onChange={(event) =>
          Number(event.target.value) > leftRangeValue &&
          setRightRangeValue(Number(event.target.value))
        }
        className={classNames(styles.input, styles.rightInput)}
        style={{
          background: `linear-gradient(to right, #eaeaea ${leftBackgroundValue}%, #222222 ${leftBackgroundValue}% ${rightBackgroundValue}%, #eaeaea ${rightBackgroundValue}%)`,
        }}
      />
    </div>
  )
}
