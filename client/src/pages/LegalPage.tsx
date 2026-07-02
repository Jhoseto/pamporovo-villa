import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CONTACT, SITE } from "@/data/siteContent";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

type Tab = "privacy" | "terms" | "cookies";

const TABS: { id: Tab; label: string }[] = [
  { id: "privacy", label: "Политика за поверителност" },
  { id: "terms", label: "Общи условия" },
  { id: "cookies", label: "Политика за бисквитки" },
];

const LAST_UPDATED = "01.07.2026";
const CONTROLLER_NAME = "Pamporovo Villa";
const CONTROLLER_ADDRESS = "к.к. Пампорово, местност Райковски ливади, обл. Смолян, България";
const CONTROLLER_EMAIL = CONTACT.email;
const CONTROLLER_PHONE = CONTACT.phoneDisplay;
const KDPZ_ADDRESS =
  "Комисия за защита на личните данни (КЗЛД), бул. Проф. Цветан Лазаров \u2116 2, 1592 София";
const KDPZ_EMAIL = "kzld@cpdp.bg";
const KDPZ_URL = "https://www.cpdp.bg";
const SITE_URL = SITE.website;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 font-serif text-2xl font-bold text-[oklch(0.22_0.02_55)] md:text-2xl">
        {title}
      </h2>
      <div className="space-y-4 text-[0.9375rem] leading-relaxed text-[oklch(0.38_0.02_55)]">
        {children}
      </div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-base font-semibold text-[oklch(0.28_0.02_55)]">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="ml-1 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── Privacy Policy ─────────────────────────────────── */
function PrivacyPolicy() {
  return (
    <article>
      <p className="mb-8 text-sm text-[oklch(0.52_0.02_65)]">
        Последна актуализация: {LAST_UPDATED}
      </p>

      <Section title="1. Кой е администраторът на лични данни?">
        <P>
          {CONTROLLER_NAME} (по-долу „Ние", „нас" или „администратора") е администратор на лични
          данни по смисъла на чл. 4, т. 7 от Регламент (ЕС) 2016/679 (GDPR).
        </P>
        <UL
          items={[
            `Наименование: ${CONTROLLER_NAME}`,
            `Адрес: ${CONTROLLER_ADDRESS}`,
            `Електронна поща: ${CONTROLLER_EMAIL}`,
            `Телефон: ${CONTROLLER_PHONE}`,
            `Уебсайт: ${SITE_URL}`,
          ]}
        />
        <P>
          Обработваме личните ви данни в съответствие с Регламент (ЕС) 2016/679 (GDPR) и Закона за
          защита на личните данни (ЗЗЛД).
        </P>
      </Section>

      <Section title="2. Какви лични данни събираме и защо?">
        <Sub title="2.1 Заявки за резервация">
          <P>
            Когато подавате заявка за наем на вила, обработваме следните данни: три имена, имейл
            адрес, телефонен номер, избрана вила, дати на настаняване и напускане, брой гости,
            допълнителни бележки.
          </P>
          <P>
            <strong>Правно основание:</strong> чл. 6, пар. 1, б. „б" GDPR — изпълнение на договор
            (преддоговорни отношения).
          </P>
          <P>
            <strong>Срок на съхранение:</strong> 5 години от последния контакт (задължение по
            Закона за счетоводството и Закона за туризма).
          </P>
        </Sub>

        <Sub title="2.2 Форма за контакт">
          <P>
            Когато ни изпращате съобщение, обработваме: три имена, имейл адрес, телефон (ако е
            посочен) и текст на запитването.
          </P>
          <P>
            <strong>Правно основание:</strong> чл. 6, пар. 1, б. „е" GDPR — легитимен интерес (да
            отговорим на вашето запитване).
          </P>
          <P>
            <strong>Срок на съхранение:</strong> до 1 година от последния контакт или до оттегляне
            на съгласието — в зависимост от кое настъпи по-рано.
          </P>
        </Sub>

        <Sub title="2.3 Гостови отзиви">
          <P>
            При публикуване на отзив обработваме: имe (или псевдоним), имейл адрес (не се показва
            публично), звездна оценка, текст на отзива, вила и период на престой.
          </P>
          <P>
            <strong>Правно основание:</strong> чл. 6, пар. 1, б. „а" GDPR — ваше изрично съгласие
            при подаване на отзива.
          </P>
          <P>
            <strong>Срок на съхранение:</strong> до оттегляне на съгласието. Публично показваното
            съдържание (текст, оценка, псевдоним) остава видимо, докато поискате заличаване.
          </P>
        </Sub>

        <Sub title="2.4 Технически данни (бисквитки и журнали)">
          <P>
            Уебсайтът ни може да обработва IP адрес, вид браузър, операционна система и страниците,
            които сте посетили — за целите на сигурността и правилното функциониране на сайта.
            Подробности вижте в Политиката за бисквитки.
          </P>
          <P>
            <strong>Правно основание:</strong> чл. 6, пар. 1, б. „е" GDPR — легитимен интерес
            (сигурност и функционалност).
          </P>
          <P>
            <strong>Срок на съхранение:</strong> до 12 месеца.
          </P>
        </Sub>

        <Sub title="2.5 Видеонаблюдение на терена">
          <P>
            На прилежащия терен на вилите е монтирано видеонаблюдение за целите на физическата
            сигурност. Записите съдържат образ (видео) на лица, намиращи се на терена.
          </P>
          <P>
            <strong>Правно основание:</strong> чл. 6, пар. 1, б. „е" GDPR — легитимен интерес
            (защита на имущество и сигурност на гостите). Поставен е видим предупредителен знак.
          </P>
          <P>
            <strong>Срок на съхранение:</strong> до 30 дни, след което записите се изтриват
            автоматично, освен ако не е необходимо запазването им за разследване на инцидент.
          </P>
        </Sub>
      </Section>

      <Section title="3. На кого предаваме данните?">
        <P>
          Не продаваме и не отдаваме лични данни на трети страни за търговски цели. Данните ви
          могат да бъдат предадени само в следните случаи:
        </P>
        <UL
          items={[
            "Доставчици на имейл услуги (за изпращане на потвърждения и кореспонденция) — действат като обработватели на данни на основата на договор за обработване.",
            "Хостинг доставчик на сървъра — съхранява данните в рамките на ЕС.",
            "Компетентни органи — при законово задължение (напр. полиция, НАП, КЗЛД) само по надлежен ред.",
            "Счетоводни/правни консултанти — при необходимост и само до степен, изисквана за изпълнение на законово задължение.",
          ]}
        />
        <P>
          Не извършваме трансфер на лични данни извън Европейското икономическо пространство (ЕИП).
        </P>
      </Section>

      <Section title="4. Вашите права">
        <P>
          Като субект на данни имате следните права съгласно GDPR и ЗЗЛД, упражними по всяко
          време:
        </P>
        <UL
          items={[
            "Право на достъп (чл. 15 GDPR) — да получите потвърждение дали и какви данни обработваме за вас, и копие от тях.",
            "Право на коригиране (чл. 16 GDPR) — да поискате коригиране на неточни или непълни данни.",
            "Право на изтриване (право да бъдеш забравен) (чл. 17 GDPR) \u2014 при наличие на основание (напр. данните вече не са необходими за целта).",
            "Право на ограничаване на обработването (чл. 18 GDPR) — при оспорване на точността или законността на обработването.",
            "Право на преносимост (чл. 20 GDPR) — за данните, обработвани автоматично на основание договор или съгласие.",
            "Право на възражение (чл. 21 GDPR) — срещу обработване на основание легитимен интерес или за директен маркетинг.",
            "Право на оттегляне на съгласие — по всяко време, без да засяга законосъобразността на обработването преди оттеглянето.",
          ]}
        />
        <P>
          Исканията можете да отправите на имейл <strong>{CONTROLLER_EMAIL}</strong> или писмено на
          нашия адрес. Отговаряме в срок от 30 дни (при сложност — до 90 дни с уведомление).
        </P>
      </Section>

      <Section title="5. Право на жалба до КЗЛД">
        <P>
          Ако смятате, че обработваме данните ви незаконосъобразно, имате право да подадете жалба
          до надзорния орган:
        </P>
        <UL
          items={[
            `${KDPZ_ADDRESS}`,
            `Имейл: ${KDPZ_EMAIL}`,
            `Уебсайт: ${KDPZ_URL}`,
          ]}
        />
        <P>
          Насърчаваме ви първо да се свържете с нас, за да се опитаме да разрешим проблема
          извънсъдебно.
        </P>
      </Section>

      <Section title="6. Защита на данните">
        <P>
          Прилагаме подходящи технически и организационни мерки (криптиране на данни при пренос,
          ограничен достъп, пароли и сесийна автентикация) за защита на личните ви данни от
          неоторизиран достъп, изтриване или разкриване. При нарушение на сигурността, което
          представлява риск за вашите права, ще уведомим КЗЛД в срок от 72 часа и вас — без излишно
          забавяне.
        </P>
      </Section>

      <Section title="7. Автоматизирано вземане на решения">
        <P>
          Не извършваме автоматизирано вземане на решения, включително профилиране, което да
          поражда правни последици или значително да засяга субектите на данни.
        </P>
      </Section>

      <Section title="8. Промени в политиката">
        <P>
          При съществени промени ще актуализираме датата в горния ред и ще публикуваме актуализирана
          версия на тази страница. При промени, изискващи ново съгласие, ще ви уведомим изрично.
        </P>
      </Section>
    </article>
  );
}

/* ─── Terms & Conditions ─────────────────────────────── */
function TermsAndConditions() {
  return (
    <article>
      <p className="mb-8 text-sm text-[oklch(0.52_0.02_65)]">
        Последна актуализация: {LAST_UPDATED}
      </p>

      <Section title="1. Страни и приложимост">
        <P>
          Настоящите Общи условия („ОУ") уреждат отношенията между {CONTROLLER_NAME}
          („Наемодател", „Ние") и всяко физическо или юридическо лице („Гост", „Клиент"), което
          наема вила чрез уебсайта {SITE_URL} или директно по телефон/имейл.
        </P>
        <P>
          С подаване на заявка за резервация Гостът потвърждава, че е прочел, разбрал и приема тези
          ОУ. Приложимото право е българското законодателство: Закон за задълженията и договорите
          (ЗЗД), Закон за защита на потребителите (ЗЗП), Закон за туризма (ЗТ) и свързаните
          нормативни актове.
        </P>
      </Section>

      <Section title="2. Обект на наем">
        <P>
          {CONTROLLER_NAME} отдава под наем три самостоятелни вили (Вила 1, Вила 2 и Вила Deluxe),
          намиращи се на адрес: {CONTROLLER_ADDRESS}. Всяка вила включва 2 спални, 2 бани,
          всекидневна с камина на дърва, напълно оборудвана кухня, веранда с барбекю и тераса.
          Максималният капацитет е 6 (шест) гости на вила.
        </P>
      </Section>

      <Section title="3. Резервация и потвърждение">
        <Sub title="3.1 Процес на заявка">
          <P>
            Заявките за резервация се подават чрез формата на уебсайта, по имейл или по телефон.
            Заявката не представлява сключен договор. Договорът за наем се счита сключен едва след
            изрично потвърждение от страна на Наемодателя.
          </P>
        </Sub>
        <Sub title="3.2 Задатък и плащане">
          <P>
            При потвърждение на резервацията Гостът заплаща авансово задатък в размер, посочен от
            Наемодателя при потвърждение. Остатъкът от наемната цена се заплаща при настаняване или
            съгласно уговорения начин на плащане. Задатъкът по чл. 93 ЗЗД служи за гаранция за
            изпълнение.
          </P>
        </Sub>
        <Sub title="3.3 Цени">
          <P>
            Цените са в евро (EUR) за нощувка за цяла вила (до 6 гости), включващи курортна такса и
            паркинг. Цените за официални празници и почивни дни могат да се различават от
            публикуваните на сайта и се уговарят индивидуално. Наемодателят запазва правото да
            актуализира цените, без да засяга вече потвърдени резервации.
          </P>
        </Sub>
      </Section>

      <Section title="4. Настаняване и напускане">
        <UL
          items={[
            "Настаняване (check-in): след 15:00 ч. При невъзможност за пристигане до 20:00 ч. Гостът уведомява предварително.",
            "Напускане (check-out): до 11:00 ч. Закъсняло напускане без предварително уговаряне може да бъде таксувано.",
            "При настаняване Гостът представя документ за самоличност. Наемодателят е длъжен да регистрира всички настанени лица по Закона за туризма.",
            "Нерегистрирани лица нямат право да пренощуват в обекта.",
          ]}
        />
      </Section>

      <Section title="5. Правила за ползване">
        <Sub title="5.1 Разрешено">
          <UL
            items={[
              "Ползване на вилата за целите на туристическо настаняване от заявения брой гости.",
              "Пушене само на обособените тераси на открито.",
              "Ползване на камина (дървата се закупуват допълнително).",
              "Барбекю на верандата при спазване на противопожарните правила.",
            ]}
          />
        </Sub>
        <Sub title="5.2 Забранено">
          <UL
            items={[
              "Пушене в затворените помещения — при установено нарушение се налага неустойка в размер на сумата посочена в сайта.",
              "Настаняване на лица, невписани в резервацията, без предварително съгласие.",
              "Внасяне на собствени електрически или газови нагревателни уреди.",
              "Преместване на мебели между стаите.",
              "Провеждане на шумни мероприятия след 23:00 ч. и преди 07:00 ч.",
              "Настаняване на домашни любимци.",
              "Всякакво действие, нарушаващо спокойствието на съседните вили.",
            ]}
          />
        </Sub>
      </Section>

      <Section title="6. Отмяна на резервация">
        <Sub title="6.1 Отмяна от страна на Госта">
          <UL
            items={[
              "Над 30 дни преди настаняване: пълно възстановяване на задатъка.",
              "14–30 дни преди настаняване: задатъкът се задържа изцяло като неустойка.",
              "Под 14 дни преди настаняване или неявяване: задатъкът се задържа и може да бъде поискано заплащане на пълната наемна цена за резервирания период.",
            ]}
          />
          <P>
            При отмяна, дължаща се на форсмажор (непреодолима сила), страните се договарят
            индивидуално.
          </P>
        </Sub>
        <Sub title="6.2 Отмяна от страна на Наемодателя">
          <P>
            При невъзможност за предоставяне на вилата поради форсмажор или непредвидени
            обстоятелства, Наемодателят връща на Госта платените суми в пълен размер в срок до 14
            дни. Ако отмяната е по вина на Наемодателя, Гостът може да претендира допълнително
            обезщетение съгласно ЗЗД.
          </P>
        </Sub>
      </Section>

      <Section title="7. Отговорност и щети">
        <P>
          Гостът носи отговорност за вреди, причинени на имуществото на вилата по негова вина или
          по вина на придружаващите го лица. Установените вреди се заплащат по пазарна стойност.
        </P>
        <P>
          Наемодателят не носи отговорност за: загуба на лични вещи на Госта в обекта; инциденти,
          причинени от неспазване на правилата за ползване; щети, причинени от природни бедствия
          или действия на трети лица извън контрола на Наемодателя.
        </P>
        <P>
          Видеонаблюдението на терена е само за целите на сигурността и не освобождава Госта от
          отговорност.
        </P>
      </Section>

      <Section title="8. VIP програма">
        <P>
          Гостите, наели вила три или повече пъти в рамките на една календарна година, могат да
          получат персонална VIP карта с привилегии, описани на уебсайта. Програмата е доброволна,
          без задължителен членски внос, и може да бъде изменяна или прекратявана от Наемодателя с
          предварително уведомление.
        </P>
      </Section>

      <Section title="9. Интелектуална собственост">
        <P>
          Всички текстове, снимки, лога, графики и друго съдържание на уебсайта са собственост на
          {CONTROLLER_NAME} или са използвани по надлежен лиценз. Копирането, разпространението или
          публикуването им без изрично писмено разрешение е забранено.
        </P>
      </Section>

      <Section title="10. Изменения на Общите условия">
        <P>
          Наемодателят може да изменя настоящите ОУ по всяко време. Актуалната версия е достъпна
          на {SITE_URL}/legal. За резервации, направени преди влизане в сила на изменението,
          приложими са ОУ към датата на резервацията.
        </P>
      </Section>

      <Section title="11. Извънсъдебно решаване на спорове">
        <P>
          При спор, свързан с онлайн договор, потребителят може да се обърне към Платформата за
          онлайн решаване на спорове на ЕК:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--gold)] underline-offset-2 hover:text-[var(--gold)]"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          . Потребителите могат да отправят жалби и до Комисията за защита на потребителите (КЗП):
          тел. 0700 111 22, уебсайт{" "}
          <a
            href="https://www.kzp.bg"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--gold)] underline-offset-2 hover:text-[var(--gold)]"
          >
            kzp.bg
          </a>
          .
        </P>
      </Section>

      <Section title="12. Приложимо право и съдебна компетентност">
        <P>
          Настоящите ОУ се уреждат от и тълкуват в съответствие с българското право. За всички
          спорове, непостигнали извънсъдебно решение, компетентен е съответният български съд
          съгласно разпоредбите на ГПК, като за потребителски спорове се прилагат правилата на ЗЗП.
        </P>
      </Section>
    </article>
  );
}

/* ─── Cookie Policy ──────────────────────────────────── */
function CookiePolicy() {
  return (
    <article>
      <p className="mb-8 text-sm text-[oklch(0.52_0.02_65)]">
        Последна актуализация: {LAST_UPDATED}
      </p>

      <Section title="1. Какво са бисквитките?">
        <P>
          Бисквитките (cookies) са малки текстови файлове, записани в браузъра ви при посещение на
          уебсайт. Те не могат да изпълняват код и не носят вируси. Позволяват на уебсайта да ви
          разпознае при следващо посещение, да запази предпочитанията ви и да функционира правилно.
        </P>
        <P>
          Правното основание за ползването на бисквитки се съдържа в чл. 5, пар. 3 от Директива
          2002/58/ЕО (ePrivacy Directive) и чл. 6, пар. 1, б. „а" и „е" от GDPR, въведени в
          националното законодателство.
        </P>
      </Section>

      <Section title="2. Видове бисквитки и локално съхранение">
        <Sub title="2.1 Публичен сайт — строго необходими">
          <P>
            Тези записи са необходими за запомняне на избора ви относно бисквитките и не могат да
            бъдат изключени без да се покаже banner-ът отново при следващо посещение.
          </P>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[oklch(0_0_0/0.08)] text-left">
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Име</th>
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Тип</th>
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Цел</th>
                  <th className="py-2 font-semibold text-[oklch(0.28_0.02_55)]">Срок</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(0_0_0/0.05)] text-[oklch(0.4_0.02_60)]">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">pamporovo_cookie_consent</td>
                  <td className="py-2 pr-4">localStorage</td>
                  <td className="py-2 pr-4">Запис на предпочитанията ви за бисквитки</td>
                  <td className="py-2">12 месеца</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Sub>

        <Sub title="2.2 Публичен сайт — аналитични (със съгласие)">
          <P>
            Активират се само след натискане на „Приемам всички" или включване на категорията в
            „Настройки". Използваме Google Analytics 4 (Measurement ID: G-6W50FH0F0D) за
            анонимна статистика за посещения и поведение на сайта.
          </P>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[oklch(0_0_0/0.08)] text-left">
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Бисквитка</th>
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Доставчик</th>
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Цел</th>
                  <th className="py-2 font-semibold text-[oklch(0.28_0.02_55)]">Срок</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(0_0_0/0.05)] text-[oklch(0.4_0.02_60)]">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">_ga, _ga_*</td>
                  <td className="py-2 pr-4">Google Analytics</td>
                  <td className="py-2 pr-4">Различаване на потребители и сесии</td>
                  <td className="py-2">До 2 години</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Sub>

        <Sub title="2.3 Публичен сайт — функционални / трети страни (със съгласие)">
          <P>
            Интерактивната карта (Google Maps) се зарежда само след ваше съгласие. Google може да
            постави собствени бисквитки при embed на картата.
          </P>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[oklch(0_0_0/0.08)] text-left">
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Източник</th>
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Цел</th>
                  <th className="py-2 font-semibold text-[oklch(0.28_0.02_55)]">Срок</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(0_0_0/0.05)] text-[oklch(0.4_0.02_60)]">
                <tr>
                  <td className="py-2 pr-4">Google Maps iframe</td>
                  <td className="py-2 pr-4">Показване на локацията на вилите</td>
                  <td className="py-2">Според политиката на Google</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Sub>

        <Sub title="2.4 Локално съхранение без бисквитки">
          <P>
            Следните данни се пазят локално в браузъра и не изискват отделно съгласие, но ги
            оповестяваме за прозрачност:
          </P>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[oklch(0_0_0/0.08)] text-left">
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Ключ</th>
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Тип</th>
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Цел</th>
                  <th className="py-2 font-semibold text-[oklch(0.28_0.02_55)]">Срок</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(0_0_0/0.05)] text-[oklch(0.4_0.02_60)]">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">pamporovo-weather-v1</td>
                  <td className="py-2 pr-4">sessionStorage</td>
                  <td className="py-2 pr-4">Кеш на данни за времето в hero секцията</td>
                  <td className="py-2">До затваряне на таба</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">theme</td>
                  <td className="py-2 pr-4">localStorage</td>
                  <td className="py-2 pr-4">Предпочитание за светла/тъмна тема</td>
                  <td className="py-2">1 година</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Sub>

        <Sub title="2.5 Администраторски панел (/admin)">
          <P>
            Посетителите на главния сайт не получават тези бисквитки. Те се използват само при
            вход в администраторската зона:
          </P>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[oklch(0_0_0/0.08)] text-left">
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Бисквитка</th>
                  <th className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)]">Цел</th>
                  <th className="py-2 font-semibold text-[oklch(0.28_0.02_55)]">Срок</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(0_0_0/0.05)] text-[oklch(0.4_0.02_60)]">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">admin_session</td>
                  <td className="py-2 pr-4">Удостоверяване на администраторска сесия</td>
                  <td className="py-2">7 дни</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Sub>
      </Section>

      <Section title="3. Как да управлявате бисквитките?">
        <P>
          Можете да промените предпочитанията си по всяко време чрез бутона „Управление на
          бисквитки" в долната част на сайта или чрез banner-а при първо посещение.
        </P>
        <P>
          Можете също да контролирате и/или изтривате бисквитките чрез настройките на браузъра:
        </P>
        <UL
          items={[
            "Google Chrome: Настройки → Поверителност и сигурност → Бисквитки и данни на сайтове",
            "Mozilla Firefox: Настройки → Поверителност и сигурност → Бисквитки и данни на сайтове",
            "Safari: Предпочитания → Поверителност → Управление на данните на уебсайтовете",
            "Microsoft Edge: Настройки → Бисквитки и разрешения за сайтове",
          ]}
        />
        <P>
          Изтриването на задължителните бисквитки може да наруши функционирането на сайта (напр.
          администраторската зона ще изисква повторно влизане).
        </P>
        <P>
          Можете да изразите предпочитанията си относно аналитичните бисквитки на{" "}
          <a
            href="https://optout.aboutads.info"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--gold)] underline-offset-2 hover:text-[var(--gold)]"
          >
            optout.aboutads.info
          </a>{" "}
          или{" "}
          <a
            href="https://www.youronlinechoices.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--gold)] underline-offset-2 hover:text-[var(--gold)]"
          >
            youronlinechoices.eu
          </a>
          .
        </P>
      </Section>

      <Section title="4. Промени в политиката за бисквитки">
        <P>
          Тази политика може да се актуализира при въвеждане на нови инструменти или изисквания на
          законодателството. Актуалната версия е винаги достъпна на {SITE_URL}/legal.
        </P>
      </Section>

      <Section title="5. Контакт">
        <P>
          За въпроси, свързани с бисквитките и обработването на данни, пишете ни на{" "}
          <a
            href={`mailto:${CONTROLLER_EMAIL}`}
            className="underline decoration-[var(--gold)] underline-offset-2 hover:text-[var(--gold)]"
          >
            {CONTROLLER_EMAIL}
          </a>
          .
        </P>
      </Section>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function LegalPage() {
  const [search] = useLocation();
  const params = new URLSearchParams(search.split("?")[1] ?? "");
  const initial = (params.get("tab") as Tab | null) ?? "privacy";
  const [active, setActive] = useState<Tab>(TABS.some(t => t.id === initial) ? initial : "privacy");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    document.title = `Правна информация — ${SITE.name}`;
    return () => {
      document.title = SITE.name;
    };
  }, []);

  const current = TABS.find(t => t.id === active)!;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <SiteHeader />

      {/* Hero */}
      <div className="bg-[var(--ink)] pb-0 pt-28 md:pt-32">
        <div className="container mx-auto px-4 pb-0">
          <p className="mb-2 font-display text-xs tracking-[0.2em] text-[var(--gold)] uppercase">
            Правна информация
          </p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">
            {current.label}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
            {CONTROLLER_NAME} · {SITE_URL}
          </p>

          {/* Tabs */}
          <div className="mt-8 flex gap-0 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={[
                  "legal-tab whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors",
                  active === tab.id
                    ? "border-b-2 border-[var(--gold)] text-[var(--gold)]"
                    : "border-b-2 border-transparent text-white/55 hover:text-white/85",
                ].join(" ")}
                aria-selected={active === tab.id}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {active === "privacy" && <PrivacyPolicy />}
          {active === "terms" && <TermsAndConditions />}
          {active === "cookies" && <CookiePolicy />}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
