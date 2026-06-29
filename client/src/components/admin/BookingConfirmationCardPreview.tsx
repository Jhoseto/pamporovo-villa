import { formatAmountEur, bookingBalanceDue } from "@shared/bookingPayment";
import { CONFIRMATION_CARD } from "@shared/confirmationCardTheme";
import { VILLA_LABELS, type VillaId } from "@shared/villas";
import { SITE } from "@/data/siteContent";
import type { ConfirmationCardData } from "@/lib/confirmationCardImage";
import { cn } from "@/lib/utils";

type Props = {
  data: ConfirmationCardData;
  className?: string;
};

function formatBgDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

export function BookingConfirmationCardPreview({ data, className }: Props) {
  const villa = VILLA_LABELS[data.villaId as VillaId] ?? data.villaId;
  const balance = bookingBalanceDue(data.totalAmountEur, data.depositPaidEur) ?? 0;

  return (
    <div className={cn("confirmation-card-site", className)}>
      <div className="confirmation-card-site__inner">
        <img
          src={SITE.logo}
          alt="Pamporovo Villa"
          className="confirmation-card-site__logo"
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://pamporovovilla.com/sites/all/themes/ph/logo.png";
          }}
        />
        <div className="confirmation-card-site__divider" />
        <p className="confirmation-card-site__eyebrow">{CONFIRMATION_CARD.copy.eyebrow}</p>
        <h3 className="confirmation-card-site__title">{CONFIRMATION_CARD.copy.title}</h3>
        <p className="confirmation-card-site__subtitle">{SITE.tagline} · {SITE.location}</p>

        <div className="confirmation-card-site__fields">
          <div>
            <p className="confirmation-card-site__label">Гост</p>
            <p className="confirmation-card-site__value">{data.guestName}</p>
          </div>
          <div>
            <p className="confirmation-card-site__label">Вила</p>
            <p className="confirmation-card-site__value">{villa}</p>
          </div>
          <div>
            <p className="confirmation-card-site__label">Престой</p>
            <p className="confirmation-card-site__value">
              {formatBgDate(data.checkInDate)} → {formatBgDate(data.checkOutDate)}
            </p>
          </div>
          <div>
            <p className="confirmation-card-site__label">Нощувки · гости</p>
            <p className="confirmation-card-site__value">
              {data.nights} нощувки · {data.numberOfGuests} гости
            </p>
          </div>
        </div>

        <div className="confirmation-card-site__payment">
          <div className="confirmation-card-site__pay-row">
            <span>Обща сума</span>
            <strong>{formatAmountEur(data.totalAmountEur)}</strong>
          </div>
          <div className="confirmation-card-site__pay-divider" />
          <div className="confirmation-card-site__pay-row">
            <span>Платено капаро</span>
            <strong>{formatAmountEur(data.depositPaidEur)}</strong>
          </div>
          <div className="confirmation-card-site__pay-divider" />
          <div className="confirmation-card-site__pay-row confirmation-card-site__pay-total">
            <span>Остава за плащане</span>
            <strong>{formatAmountEur(balance)}</strong>
          </div>
        </div>

        <div className="confirmation-card-site__footer">
          {SITE.location}
          <br />
          Настаняване след 15:00 · Напускане до 11:00
          <br />
          {SITE.email}
          <div className="confirmation-card-site__divider" style={{ width: "40%", marginTop: "0.85rem" }} />
          <p className="confirmation-card-site__website">{SITE.websiteLabel}</p>
        </div>
      </div>
    </div>
  );
}
