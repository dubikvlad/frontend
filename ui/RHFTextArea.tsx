import {
  Control,
  FieldPath,
  FieldValues,
  PathValue,
  RegisterOptions,
  useController,
  UseControllerProps,
} from 'react-hook-form'

import { TextArea } from '@/features/ui'
import type { TextAreaProps } from '@/features/ui/TextArea'

type RHFTextAreaProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  name: UseControllerProps['name']
  required?: RegisterOptions['required']
  defaultValue?: PathValue<FieldValues, FieldPath<FieldValues>>
  placeholder?: TextAreaProps['placeholder']
  autoComplete?: TextAreaProps['autoComplete']
  textAlign?: TextAreaProps['textAlign']
  withLabel?: TextAreaProps['withLabel']
  onKeyDown?: TextAreaProps['onKeyDown']
  className?: TextAreaProps['className']
  isDisabled?: TextAreaProps['isDisabled']
  large?: TextAreaProps['large']
  onBlurEvent?: TextAreaProps['onBlurEvent']
}

export function RHFTextArea({
  control,
  name = '',
  required,
  defaultValue = '',
  placeholder,
  autoComplete,
  textAlign,
  withLabel,
  onKeyDown,
  className,
  isDisabled,
  large,
  onBlurEvent,
}: RHFTextAreaProps) {
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({ control, name, defaultValue, rules: { required } })

  return (
    <TextArea
      placeholder={placeholder}
      autoComplete={autoComplete}
      textAlign={textAlign}
      value={value}
      onChange={onChange}
      withLabel={withLabel}
      error={error?.message}
      inputRef={ref}
      onKeyDown={onKeyDown}
      className={className}
      isDisabled={isDisabled}
      large={large}
      onBlurEvent={onBlurEvent}
    />
  )
}
