// Faithful React port of the light-theme designs in /email-templates/*.html.
// Markup, inline styles, colors, fonts and copy mirror those files exactly;
// change the HTML source first, then this port.
import * as React from 'react'

const MONO = "'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace"
const SANS = "'Bricolage Grotesque','Helvetica Neue',Helvetica,Arial,sans-serif"
const SERIF = "'Instrument Serif',Georgia,'Times New Roman',serif"
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;700&display=swap'

// Legacy table attributes React has no typed prop for.
const bg = (color: string) => ({ bgcolor: color }) as Record<string, string>
const vtop = { valign: 'top' } as Record<string, string>
const table = { role: 'presentation', width: '100%', cellPadding: 0, cellSpacing: 0, border: 0 } as const

const meta: React.CSSProperties = {
  fontFamily: MONO, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6d685e',
}
const para: React.CSSProperties = {
  margin: '0 0 16px', fontFamily: SANS, fontSize: '16px', lineHeight: 1.55, color: '#45433d',
}

/** Bold inline value, e.g. an email address, as in the source templates. */
export const Strong = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ color: '#181714' }}>{children}</strong>
)

export const Para = ({ children }: { children: React.ReactNode }) => <p style={para}>{children}</p>

interface LayoutProps {
  title: string
  preheader: string
  kicker: string
  heading: string
  headingItalic: string
  body: React.ReactNode
  /** Action button + paste-link fallback; omitted for the code email. */
  action?: { label: string; url: string }
  /** Replaces the action rows (verification code box). */
  code?: string
  note: string
  siteUrl: string
}

export function CdrEmail({ title, preheader, kicker, heading, headingItalic, body, action, code, note, siteUrl }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <title>{title}</title>
        <link href={FONTS_HREF} rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#eeede8' }}>
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden', opacity: 0 }}>{preheader}</div>
        <table {...table} {...bg('#eeede8')} style={{ background: '#eeede8' }}>
          <tbody><tr><td align="center" style={{ padding: '32px 16px' }}>
            <table {...table} style={{ maxWidth: '560px' }}>
              <tbody>
                <tr><td style={{ padding: '0 0 14px', ...meta }}>
                  <table {...table}><tbody><tr>
                    <td style={meta}>Independent music criticism</td>
                    <td align="right" style={meta}>Est. 1995</td>
                  </tr></tbody></table>
                </td></tr>
                <tr><td {...bg('#faf9f6')} style={{ background: '#faf9f6', border: '1px solid #d9d7d0' }}>
                  <table {...table}><tbody>
                    <tr><td style={{ padding: '36px 40px 0' }}>
                      <div style={{ fontFamily: SANS, fontSize: '44px', fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 0.9, color: '#181714' }}>
                        cdreviews<span style={{ color: '#c73512' }}>.</span>
                      </div>
                    </td></tr>
                    <tr><td style={{ padding: '22px 40px 0' }}>
                      <div style={{ borderTop: '2px solid #181714', height: 0, lineHeight: 0, fontSize: 0 }}>{'\u00a0'}</div>
                    </td></tr>
                    <tr><td style={{ padding: '22px 40px 0', fontFamily: MONO, fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c73512' }}>
                      {`\u00a7 ${kicker}`}
                    </td></tr>
                    <tr><td style={{ padding: '10px 40px 18px' }}>
                      <h1 style={{ margin: 0, fontFamily: SANS, fontSize: '38px', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, color: '#181714' }}>
                        {heading}{' '}
                        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em' }}>{headingItalic}</span>
                      </h1>
                    </td></tr>
                    <tr><td style={{ padding: '0 40px' }}>{body}</td></tr>
                    {action && (
                      <>
                        <tr><td style={{ padding: '12px 40px 8px' }}>
                          <table role="presentation" cellPadding={0} cellSpacing={0} border={0}><tbody><tr>
                            <td {...bg('#c73512')} style={{ background: '#c73512' }}>
                              <a href={action.url} target="_blank" style={{ display: 'inline-block', padding: '16px 28px', fontFamily: MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#faf9f6', textDecoration: 'none' }}>
                                {`${action.label} \u2192`}
                              </a>
                            </td>
                          </tr></tbody></table>
                        </td></tr>
                        <tr><td style={{ padding: '16px 40px 0', fontFamily: MONO, fontSize: '11px', lineHeight: 1.6, color: '#6d685e' }}>
                          Button not working? Paste this into your browser:<br />
                          <a href={action.url} style={{ color: '#c73512', wordBreak: 'break-all' }}>{action.url}</a>
                        </td></tr>
                      </>
                    )}
                    {code !== undefined && (
                      <tr><td style={{ padding: '8px 40px 8px' }}>
                        <div style={{ display: 'inline-block', border: '2px solid #181714', padding: '14px 22px', fontFamily: MONO, fontSize: '28px', fontWeight: 700, letterSpacing: '0.3em', color: '#181714' }}>{code}</div>
                      </td></tr>
                    )}
                    <tr><td style={{ padding: '28px 40px 36px' }}>
                      <div style={{ borderTop: '1px solid #d9d7d0', paddingTop: '16px', fontFamily: SANS, fontSize: '13px', lineHeight: 1.5, color: '#6d685e' }}>{note}</div>
                    </td></tr>
                  </tbody></table>
                </td></tr>
                <tr><td style={{ padding: '16px 0 0' }}>
                  <table {...table}><tbody><tr>
                    <td {...vtop} style={meta}>{'\u00a9 1995 \u2014 2026 cdreviews'}</td>
                    <td align="right" {...vtop}>
                      <a href={siteUrl} style={{ ...meta, textDecoration: 'none' }}>{'cdreviews.com \u2192'}</a>
                    </td>
                  </tr></tbody></table>
                </td></tr>
              </tbody>
            </table>
          </td></tr></tbody>
        </table>
      </body>
    </html>
  )
}
