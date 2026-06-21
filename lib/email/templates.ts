import { ADDRESS_SHORT } from "@/lib/constants";

const FOOTER = `
  <tr>
    <td style="background:#f9f6f0;padding:20px 48px;border-top:1px solid #ede8df;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Táto správa bola automaticky vygenerovaná systémom rezervácií.</p>
    </td>
  </tr>`;

const WRAPPER_OPEN = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">`;

const WRAPPER_CLOSE = `
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

function header(gradient: string, label: string, title: string) {
  return `
  <tr>
    <td style="background:${gradient};padding:40px 48px 36px;">
      <p style="margin:0 0 6px 0;color:#a8d5b5;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">${label}</p>
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;">${title}</h1>
    </td>
  </tr>`;
}

function meetLinkBlock(meetLink: string) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td align="center">
        <a href="${meetLink}" style="display:inline-block;background:#2d5a3d;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
          🎥 Pripojiť sa na Google Meet
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding-top:10px;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">Odkaz na sedenie: <a href="${meetLink}" style="color:#2d5a3d;">${meetLink}</a></p>
      </td>
    </tr>
  </table>`;
}

export function therapistNotificationHtml({
  clientName,
  clientEmail,
  dateStr,
  endTimeStr,
}: {
  clientName: string;
  clientEmail?: string;
  dateStr: string;
  endTimeStr: string;
}) {
  return `${WRAPPER_OPEN}
    ${header("linear-gradient(135deg,#2d5a3d 0%,#3d7a52 100%)", "Nová rezervácia", "Žiadosť o sedenie")}
    <tr>
      <td style="padding:40px 48px;">
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#374151;">Klient <strong>${clientName}</strong> si zarezervoval sedenie. Žiadosť čaká na vaše potvrdenie v administrácii.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f9f6f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Detail sedenia</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:7px 0;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Klient</span>
                    <span style="font-size:14px;font-weight:600;color:#1f2937;">${clientName}</span>
                  </td>
                </tr>
                ${clientEmail ? `
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Email</span>
                    <a href="mailto:${clientEmail}" style="font-size:14px;font-weight:600;color:#2d5a3d;text-decoration:none;">${clientEmail}</a>
                  </td>
                </tr>` : ""}
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Termín</span>
                    <span style="font-size:14px;font-weight:600;color:#1f2937;">${dateStr} – ${endTimeStr}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Stav</span>
                    <span style="display:inline-block;font-size:12px;font-weight:600;color:#92400e;background:#fef3c7;padding:3px 10px;border-radius:20px;">Čaká na potvrdenie</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${FOOTER}
  ${WRAPPER_CLOSE}`;
}

export function therapistCancellationHtml({
  clientName,
  clientEmail,
  dateStr,
  endTimeStr,
  fromEmail,
}: {
  clientName: string;
  clientEmail: string;
  dateStr: string;
  endTimeStr: string;
  fromEmail: string;
}) {
  return `${WRAPPER_OPEN}
    ${header("linear-gradient(135deg,#7f1d1d 0%,#b91c1c 100%)", "Zrušenie rezervácie", "Klient zrušil sedenie")}
    <tr>
      <td style="padding:40px 48px;">
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#374151;">Dobrý deň, informujeme vás, že klient ${clientName} zrušil sedenie.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f9f6f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Zrušené sedenie</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:7px 0;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Termín</span>
                    <span style="font-size:14px;font-weight:600;color:#1f2937;">${dateStr} – ${endTimeStr}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Stav</span>
                    <span style="display:inline-block;font-size:12px;font-weight:600;color:#991b1b;background:#fee2e2;padding:3px 10px;border-radius:20px;">Zrušené</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 28px 0;font-size:14px;line-height:1.6;color:#6b7280;">Klienta je možné kontaktovať na emailovej adrese ${clientEmail}.</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="mailto:${fromEmail}" style="display:inline-block;background:#2d5a3d;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:8px;">Kontaktovať terapeuta</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${FOOTER}
  ${WRAPPER_CLOSE}`;
}

export function clientConfirmationHtml({
  clientName,
  dateStr,
  endTimeStr,
  meetLink,
  locationType,
}: {
  clientName: string;
  dateStr: string;
  endTimeStr: string;
  meetLink?: string;
  locationType?: string;
}) {
  return `${WRAPPER_OPEN}
    ${header("linear-gradient(135deg,#2d5a3d 0%,#3d7a52 100%)", "Potvrdenie rezervácie", "Vaše sedenie je potvrdené")}
    <tr>
      <td style="padding:40px 48px;">
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#374151;">Dobrý deň, <strong>${clientName}</strong>,<br/>vaše terapeutické sedenie bolo úspešne potvrdené. Tešíme sa na vás!</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f9f6f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Detail sedenia</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:7px 0;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Termín</span>
                    <span style="font-size:14px;font-weight:600;color:#1f2937;">${dateStr} – ${endTimeStr}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Stav</span>
                    <span style="display:inline-block;font-size:12px;font-weight:600;color:#166534;background:#dcfce7;padding:3px 10px;border-radius:20px;">Potvrdené</span>
                  </td>
                </tr>
                ${locationType === "onsite" ? `
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Adresa</span>
                    <span style="font-size:14px;font-weight:600;color:#1f2937;">${ADDRESS_SHORT}</span>
                  </td>
                </tr>` : ""}
              </table>
            </td>
          </tr>
        </table>
        ${locationType === "online" && meetLink ? meetLinkBlock(meetLink) : ""}
        <div style="background:#f0fdf4;border-left:3px solid #3d7a52;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">📅 V prílohe nájdete <strong>pozvánku do kalendára</strong> (súbor .ics), ktorú môžete pridať do Google Calendar, Apple Calendar alebo Outlooku.</p>
        </div>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">V prípade otázok alebo potreby zmeny termínu nás prosím kontaktujte čo najskôr.</p>
      </td>
    </tr>
    ${FOOTER}
  ${WRAPPER_CLOSE}`;
}

export function clientCancellationHtml({
  clientName,
  dateStr,
  endTimeStr,
  fromEmail,
}: {
  clientName: string;
  dateStr: string;
  endTimeStr: string;
  fromEmail: string;
}) {
  return `${WRAPPER_OPEN}
    ${header("linear-gradient(135deg,#7f1d1d 0%,#b91c1c 100%)", "Zrušenie rezervácie", "Vaše sedenie bolo zrušené")}
    <tr>
      <td style="padding:40px 48px;">
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#374151;">Dobrý deň, <strong>${clientName}</strong>,<br/>informujeme vás, že vaše terapeutické sedenie bolo zrušené.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f9f6f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Zrušené sedenie</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:7px 0;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Termín</span>
                    <span style="font-size:14px;font-weight:600;color:#1f2937;">${dateStr} – ${endTimeStr}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Stav</span>
                    <span style="display:inline-block;font-size:12px;font-weight:600;color:#991b1b;background:#fee2e2;padding:3px 10px;border-radius:20px;">Zrušené</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 28px 0;font-size:14px;line-height:1.6;color:#6b7280;">V prípade otázok alebo ak si želáte dohodnúť nový termín, neváhajte nás kontaktovať.</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="mailto:${fromEmail}" style="display:inline-block;background:#2d5a3d;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:8px;">Kontaktovať terapeuta</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${FOOTER}
  ${WRAPPER_CLOSE}`;
}

export function clientRescheduledHtml({
  clientName,
  oldDateStr,
  newDateStr,
  newEndTimeStr,
  meetLink,
  locationType,
}: {
  clientName: string;
  oldDateStr: string;
  newDateStr: string;
  newEndTimeStr: string;
  meetLink?: string;
  locationType?: string;
}) {
  return `${WRAPPER_OPEN}
    ${header("linear-gradient(135deg,#78350f 0%,#d97706 100%)", "Zmena termínu", "Čas vášho sedenia bol zmenený")}
    <tr>
      <td style="padding:40px 48px;">
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#374151;">Dobrý deň, <strong>${clientName}</strong>,<br/>váš terapeutický termín bol presunutý na nový čas. V prílohe nájdete aktualizovanú pozvánku do kalendára.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f9f6f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Zmena termínu</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:7px 0;">
                    <span style="font-size:13px;color:#6b7280;min-width:120px;display:inline-block;">Pôvodný termín</span>
                    <span style="font-size:14px;color:#9ca3af;text-decoration:line-through;">${oldDateStr}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:120px;display:inline-block;">Nový termín</span>
                    <span style="font-size:14px;font-weight:600;color:#1f2937;">${newDateStr} – ${newEndTimeStr}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:120px;display:inline-block;">Stav</span>
                    <span style="display:inline-block;font-size:12px;font-weight:600;color:#92400e;background:#fef3c7;padding:3px 10px;border-radius:20px;">Presunuté</span>
                  </td>
                </tr>
                ${locationType === "onsite" ? `
                <tr>
                  <td style="padding:7px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:120px;display:inline-block;">Adresa</span>
                    <span style="font-size:14px;font-weight:600;color:#1f2937;">${ADDRESS_SHORT}</span>
                  </td>
                </tr>` : ""}
              </table>
            </td>
          </tr>
        </table>
        ${locationType === "online" && meetLink ? meetLinkBlock(meetLink) : ""}
        <div style="background:#fffbeb;border-left:3px solid #d97706;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">📅 V prílohe nájdete <strong>aktualizovanú pozvánku do kalendára</strong>, ktorou môžete nahradiť pôvodný záznam.</p>
        </div>
      </td>
    </tr>
    ${FOOTER}
  ${WRAPPER_CLOSE}`;
}

export function contactFormHtml({
  name,
  email,
  serviceLabel,
  message,
}: {
  name: string;
  email: string;
  serviceLabel: string;
  message: string;
}) {
  return `${WRAPPER_OPEN}
    ${header("linear-gradient(135deg,#2d5a3d 0%,#3d7a52 100%)", "Kontaktný formulár", "Nová správa od klienta")}
    <tr>
      <td style="padding:40px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f9f6f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Odosielateľ</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Meno</span>
                    <span style="font-size:14px;font-weight:600;color:#1f2937;">${name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Email</span>
                    <a href="mailto:${email}" style="font-size:14px;font-weight:600;color:#2d5a3d;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-top:1px solid #ede8df;">
                    <span style="font-size:13px;color:#6b7280;min-width:80px;display:inline-block;">Služba</span>
                    <span style="display:inline-block;font-size:12px;font-weight:600;color:#2d5a3d;background:#e6f4ec;padding:3px 10px;border-radius:20px;">${serviceLabel}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Správa</p>
        <div style="background:#f9f6f0;border-left:3px solid #3d7a52;border-radius:0 8px 8px 0;padding:20px 24px;">
          <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;white-space:pre-wrap;">${message}</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
          <tr>
            <td align="center">
              <a href="mailto:${email}?subject=Re: Vaša správa" style="display:inline-block;background:#2d5a3d;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:8px;">Odpovedať klientovi</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#f9f6f0;padding:20px 48px;border-top:1px solid #ede8df;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Táto správa bola odoslaná cez kontaktný formulár na vašom webe.</p>
      </td>
    </tr>
  ${WRAPPER_CLOSE}`;
}
