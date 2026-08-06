import React from 'react'

function Button({
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  children,
  ...props
}) {
  const variantClass = variant ? `button--${variant}` : ''
  const classes = ['button', variantClass, className].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
