import * as React from 'react'
import { CdrEmail, Para, Strong } from './cdr-layout'

interface RecoveryEmailProps {
  siteName: string
  siteUrl?: string
  recipient?: string
  confirmationUrl: string
}

// Source: email-templates/reset-password.html
export const RecoveryEmail = ({ siteUrl = 'https://cdreviews.com', recipient = '', confirmationUrl }: RecoveryEmailProps) => (
  <CdrEmail
    title="Reset your cdreviews password"
    preheader="Set a new password for your account."
    kicker="Password"
    heading="Reset your"
    headingItalic="password."
    body={
      <>
        <Para>We got a request to reset the password for <Strong>{recipient}</Strong>.</Para>
        <Para>Choose a new one with the button below.</Para>
      </>
    }
    action={{ label: 'Set a new password', url: confirmationUrl }}
    note={'Didn\u2019t ask for this? Ignore this email and your password stays the same.'}
    siteUrl={siteUrl}
  />
)

export default RecoveryEmail
