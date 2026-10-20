import * as React from 'react'
import { CdrEmail, Para } from './cdr-layout'

interface ReauthenticationEmailProps {
  token: string
  siteUrl?: string
}

// Source: email-templates/reauthentication.html
export const ReauthenticationEmail = ({ token, siteUrl = 'https://cdreviews.com' }: ReauthenticationEmailProps) => (
  <CdrEmail
    title="Your cdreviews verification code"
    preheader="Your one-time verification code."
    kicker="Verification"
    heading="Your verification"
    headingItalic="code."
    body={<Para>{'Enter this code to confirm it\u2019s you:'}</Para>}
    code={token}
    note={'The code expires shortly. Didn\u2019t ask for it? You can safely ignore this email.'}
    siteUrl={siteUrl}
  />
)

export default ReauthenticationEmail
