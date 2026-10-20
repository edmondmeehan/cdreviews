import * as React from 'react'
import { CdrEmail, Para, Strong } from './cdr-layout'

interface EmailChangeEmailProps {
  siteName: string
  siteUrl?: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

// Source: email-templates/change-email.html ({{ .Email }} is the current address)
export const EmailChangeEmail = ({
  siteUrl = 'https://cdreviews.com',
  oldEmail,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <CdrEmail
    title="Confirm your new cdreviews email"
    preheader="Confirm the change to your account email."
    kicker="Account"
    heading="Confirm your new"
    headingItalic="email."
    body={
      <>
        <Para>
          You asked to change your cdreviews email from <Strong>{oldEmail || email}</Strong> to{' '}
          <Strong>{newEmail}</Strong>.
        </Para>
        <Para>Confirm the change with the button below.</Para>
      </>
    }
    action={{ label: 'Confirm change', url: confirmationUrl }}
    note={'Didn\u2019t ask for this? Ignore this email and secure your account by resetting your password.'}
    siteUrl={siteUrl}
  />
)

export default EmailChangeEmail
