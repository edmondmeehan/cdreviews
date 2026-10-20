import * as React from 'react'
import { CdrEmail, Para } from './cdr-layout'

interface MagicLinkEmailProps {
  siteName: string
  siteUrl?: string
  confirmationUrl: string
}

// Source: email-templates/magic-link.html
export const MagicLinkEmail = ({ siteUrl = 'https://cdreviews.com', confirmationUrl }: MagicLinkEmailProps) => (
  <CdrEmail
    title="Your cdreviews sign-in link"
    preheader="Your one-time link to sign in."
    kicker="Sign in"
    heading="Your sign-in"
    headingItalic="link."
    body={<Para>Use the button below to sign in to cdreviews. The link works once and expires shortly.</Para>}
    action={{ label: 'Sign in', url: confirmationUrl }}
    note={'Didn\u2019t ask to sign in? You can safely ignore this email.'}
    siteUrl={siteUrl}
  />
)

export default MagicLinkEmail
