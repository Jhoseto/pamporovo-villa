import { Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CONTACT } from "@/data/siteContent";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MagneticButton } from "./MagneticButton";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function ContactSection() {
  const [formData, setFormData] = useState({
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    subject: "",
    message: "",
  });

  const inquiryMutation = trpc.inquiry.submit.useMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await inquiryMutation.mutateAsync({
        visitorName: formData.visitorName,
        visitorEmail: formData.visitorEmail,
        visitorPhone: formData.visitorPhone || undefined,
        subject: formData.subject,
        message: formData.message,
      });

      toast.success("Запитването е изпратено успешно! Благодарим ви.");
      setFormData({
        visitorName: "",
        visitorEmail: "",
        visitorPhone: "",
        subject: "",
        message: "",
      });
    } catch {
      toast.error("Възникна грешка при изпращане на запитването.");
    }
  };

  return (
    <SectionShell
      id="contact"
      eyebrow="Контакт"
      title="Свържете се с нас"
      subtitle="Ще отговорим възможно най-бързо на вашето запитване"
      splitTitle
    >
      <div className="grid gap-12 lg:grid-cols-2">
        <ScrollReveal direction="left" className="space-y-6">
          <a
            href={`tel:${CONTACT.phone}`}
            className="floating-card flex gap-4 p-6 transition hover:border-primary/40"
          >
            <Phone className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-bold">Телефон</h3>
              <p className="text-foreground/70">{CONTACT.phoneDisplay}</p>
            </div>
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="floating-card flex gap-4 p-6 transition hover:border-primary/40"
          >
            <Mail className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-bold">Email</h3>
              <p className="text-foreground/70">{CONTACT.email}</p>
            </div>
          </a>
          <div className="floating-card flex gap-4 p-6">
            <MapPin className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-bold">Адрес</h3>
              <p className="text-foreground/70">{CONTACT.address}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={120}>
          <Card className="floating-card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="inquiryName">Име</Label>
                <Input
                  id="inquiryName"
                  value={formData.visitorName}
                  onChange={event => setFormData(prev => ({ ...prev, visitorName: event.target.value }))}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <Label htmlFor="inquiryEmail">Email</Label>
                <Input
                  id="inquiryEmail"
                  type="email"
                  value={formData.visitorEmail}
                  onChange={event => setFormData(prev => ({ ...prev, visitorEmail: event.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="inquiryPhone">Телефон (опционално)</Label>
                <Input
                  id="inquiryPhone"
                  type="tel"
                  value={formData.visitorPhone}
                  onChange={event => setFormData(prev => ({ ...prev, visitorPhone: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="subject">Субект</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={event => setFormData(prev => ({ ...prev, subject: event.target.value }))}
                  required
                  minLength={5}
                />
              </div>
              <div>
                <Label htmlFor="message">Съобщение</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={event => setFormData(prev => ({ ...prev, message: event.target.value }))}
                  required
                  minLength={10}
                />
              </div>
              <MagneticButton
                type="submit"
                className="premium-btn w-full"
                disabled={inquiryMutation.isPending}
              >
                {inquiryMutation.isPending ? "Изпращане..." : "Изпрати запитване"}
              </MagneticButton>
            </form>
          </Card>
        </ScrollReveal>
      </div>
    </SectionShell>
  );
}
