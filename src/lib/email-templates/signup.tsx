import * as React from 'react'
import { CdrEmail, Para, Strong } from './cdr-layout'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

// Source: email-templates/confirm-signup.html
export const SignupEmail = ({ siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <CdrEmail
    title="Confirm your cdreviews account"
    preheader="One click to finish setting up your account."
    kicker="New account"
    heading="Confirm your"
    headingItalic="email."
    body={
      <>
        <Para>Thanks for signing up with cdreviews.</Para>
        <Para>Confirm <Strong>{recipient}</Strong> to finish setting up your account.</Para>
      </>
    }
    action={{ label: 'Confirm email', url: confirmationUrl }}
    note={'Didn\u2019t create an account? You can safely ignore this email.'}
    siteUrl={siteUrl}
  />
)

export default SignupEmail
