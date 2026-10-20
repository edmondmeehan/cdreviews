import * as React from 'react'
import { CdrEmail, Para } from './cdr-layout'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

// Source: email-templates/invite.html
export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <CdrEmail
    title={'You\u0027re invited to the cdreviews desk'}
    preheader="Accept your invite and set a password."
    kicker="Editorial desk"
    heading="You're on the"
    headingItalic="masthead."
    body={
      <>
        <Para>{'You\u2019ve been invited to join the cdreviews editorial desk.'}</Para>
        <Para>Accept the invite to set a password and get access.</Para>
      </>
    }
    action={{ label: 'Accept invite', url: confirmationUrl }}
    note={'If you weren\u2019t expecting this, you can safely ignore it \u2014 nothing will change.'}
    siteUrl={siteUrl}
  />
)

export default InviteEmail
