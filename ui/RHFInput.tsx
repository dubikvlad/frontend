import {
  Control,
  FieldPath,
  FieldValues,
  PathValue,
  RegisterOptions,
  useController,
  UseControllerProps,
} from 'react-hook-form'

import { emailRegexp } from '@/config/constants'
import { Input } from '@/features/ui'
import type { InputProps } from '@/features/ui/Input'

type RHFInputProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  name: UseControllerProps['name']
  required?: RegisterOptions['required']
  defaultValue?: PathValue<FieldValues, FieldPath<FieldValues>>
  type?: InputProps['type']
  placeholder?: InputProps['placeholder']
  autoComplete?: InputProps['autoComplete']
  textAlign?: InputProps['textAlign']
  validationType?: InputProps['validationType']
  withLabel?: InputProps['withLabel']
  passwordLength?: InputProps['passwordLength']
  onKeyDown?: InputProps['onKeyDown']
  className?: InputProps['className']
  inputWrapper2ClassName?: InputProps['inputWrapper2ClassName']
  inputClassName?: InputProps['inputClassName']
  isDisabled?: InputProps['isDisabled']
  small?: InputProps['small']
  readOnly?: InputProps['readOnly']
  onBlurEvent?: InputProps['onBlurEvent']
  showPasswordComplexity?: InputProps['showPasswordComplexity']
  tooltipTitle?: InputProps['tooltipTitle']
  tooltipContent?: InputProps['tooltipContent']
  isValueBold?: InputProps['isValueBold']
}

export function RHFInput({
  control,
  name = '',
  required,
  defaultValue = '',
  type,
  placeholder,
  autoComplete,
  textAlign,
  validationType,
  withLabel,
  passwordLength,
  onKeyDown,
  className,
  inputWrapper2ClassName,
  inputClassName,
  isDisabled,
  small,
  readOnly,
  onBlurEvent,
  showPasswordComplexity,
  tooltipTitle,
  tooltipContent,
  isValueBold,
}: RHFInputProps) {
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({
    control,
    name,
    defaultValue,
    rules: {
      required,
      ...(type === 'email'
        ? { validate: (value) => emailRegexp.test(value) || 'Invalid email' }
        : undefined),
    },
  })

  return (
    <Input
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      textAlign={textAlign}
      validationType={validationType}
      value={value}
      onChange={onChange}
      withLabel={withLabel}
      error={error?.message}
      inputRef={ref}
      passwordLength={passwordLength}
      onKeyDown={onKeyDown}
      className={className}
      inputWrapper2ClassName={inputWrapper2ClassName}
      inputClassName={inputClassName}
      isDisabled={isDisabled}
      small={small}
      readOnly={readOnly}
      onBlurEvent={onBlurEvent}
      showPasswordComplexity={showPasswordComplexity}
      tooltipTitle={tooltipTitle}
      tooltipContent={tooltipContent}
      isValueBold={isValueBold}
      name={name}
    />
  )
}
