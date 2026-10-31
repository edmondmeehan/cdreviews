# Auth email templates (light theme)

Design source for the account emails. Each file is a complete HTML email using
Supabase auth placeholders:

| File | Auth email | Placeholders |
| --- | --- | --- |
| invite.html | Invite user | `{{ .TokenHash }}` (links go to {{ .SiteURL }}/confirm), `{{ .SiteURL }}` |
| confirm-signup.html | Confirm signup | `{{ .TokenHash }}` (links go to {{ .SiteURL }}/confirm), `{{ .Email }}`, `{{ .SiteURL }}` |
| magic-link.html | Magic link | `{{ .TokenHash }}` (links go to {{ .SiteURL }}/confirm), `{{ .SiteURL }}` |
| reset-password.html | Reset password (recovery) | `{{ .TokenHash }}` (links go to {{ .SiteURL }}/confirm), `{{ .Email }}`, `{{ .SiteURL }}` |
| change-email.html | Change email address | `{{ .TokenHash }}` (links go to {{ .SiteURL }}/confirm), `{{ .Email }}`, `{{ .NewEmail }}`, `{{ .SiteURL }}` |
| reauthentication.html | Reauthentication | `{{ .Token }}`, `{{ .SiteURL }}` |

Subject lines are in SUBJECTS.txt. Colors: #faf9f6 card, #eeede8 page,
#181714 text, #45433d secondary, #6d685e muted, #c73512 accent.
