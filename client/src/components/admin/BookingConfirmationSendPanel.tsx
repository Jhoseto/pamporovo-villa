import { useMemo, useState } from "react";
import { Download, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingConfirmationCardPreview } from "@/components/admin/BookingConfirmationCardPreview";
import {
  blobToBase64,
  confirmationCardMessage,
  downloadBlob,
  generateConfirmationCardJpeg,
  viberChatUrl,
  type ConfirmationCardData,
} from "@/lib/confirmationCardImage";
import { confirmationCardFilename } from "@shared/confirmationCardFilename";
import { whatsAppUrl } from "@/lib/adminBooking";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Props = {
  bookingId: number;
  guestPhone?: string | null;
  guestEmail?: string | null;
  cardData: ConfirmationCardData;
};

export function BookingConfirmationSendPanel({ bookingId, guestPhone, guestEmail, cardData }: Props) {
  const [busy, setBusy] = useState(false);
  const sendEmail = trpc.admin.bookings.sendConfirmationCard.useMutation({
    onSuccess: res => {
      toast.success(res.sent ? "Картата е изпратена по имейл" : "Имейлът не е конфигуриран — изтеглете JPG");
    },
    onError: err => toast.error(err.message),
  });

  const filename = useMemo(
    () =>
      confirmationCardFilename({
        guestName: cardData.guestName,
        guestPhone,
        checkInDate: cardData.checkInDate,
      }),
    [cardData.guestName, cardData.checkInDate, guestPhone]
  );

  const generate = async () => generateConfirmationCardJpeg(cardData);

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await generate();
      downloadBlob(blob, filename);
      toast.success("Картата е изтеглена");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Грешка при генериране");
    } finally {
      setBusy(false);
    }
  };

  const handleEmail = async () => {
    if (!guestEmail?.trim()) {
      toast.error("Няма имейл на госта");
      return;
    }
    setBusy(true);
    try {
      const blob = await generate();
      const imageBase64 = await blobToBase64(blob);
      await sendEmail.mutateAsync({ id: bookingId, imageBase64 });
    } catch (err) {
      if (!(err instanceof Error && err.message.includes("mutation"))) {
        toast.error(err instanceof Error ? err.message : "Грешка");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!guestPhone?.trim()) {
      toast.error("Няма телефон на госта");
      return;
    }
    setBusy(true);
    try {
      const blob = await generate();
      downloadBlob(blob, filename);
      const message = confirmationCardMessage(cardData);
      window.open(whatsAppUrl(guestPhone, message), "_blank", "noopener,noreferrer");
      toast.info("Картата е изтеглена — прикачете JPG файла в WhatsApp чата");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Грешка");
    } finally {
      setBusy(false);
    }
  };

  const handleViber = async () => {
    if (!guestPhone?.trim()) {
      toast.error("Няма телефон на госта");
      return;
    }
    setBusy(true);
    try {
      const blob = await generate();
      downloadBlob(blob, filename);
      window.location.href = viberChatUrl(guestPhone);
      toast.info("Картата е изтеглена — прикачете JPG файла във Viber чата");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Грешка");
    } finally {
      setBusy(false);
    }
  };

  const disabled = busy || sendEmail.isPending;

  return (
    <div className="admin-glass-card space-y-4 p-6">
      <div>
        <h2 className="font-serif text-xl font-semibold">Карта за клиента</h2>
        <p className="text-sm text-[var(--admin-muted)]">
          Изпратете карта с данните от резервацията на клиента — като JPG файл.
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <BookingConfirmationCardPreview data={cardData} />
        <div className="flex min-w-[200px] flex-1 flex-col gap-2">
          <Button className="admin-btn-primary justify-start" disabled={disabled} onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Изтегли JPG
          </Button>
          <Button variant="outline" className="admin-glass-btn justify-start" disabled={disabled || !guestEmail} onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" /> Изпрати по имейл
          </Button>
          <Button variant="outline" className="admin-glass-btn justify-start" disabled={disabled || !guestPhone} onClick={handleWhatsApp}>
            <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp (+ JPG)
          </Button>
          <Button variant="outline" className="admin-glass-btn justify-start" disabled={disabled || !guestPhone} onClick={handleViber}>
            <Phone className="mr-2 h-4 w-4" /> Viber (+ JPG)
          </Button>
          {!guestPhone && !guestEmail && (
            <p className="text-xs text-[var(--admin-muted)]">Добавете телефон или имейл за изпращане.</p>
          )}
        </div>
      </div>
    </div>
  );
}
