import {
  ALL_ATTRACTIONS,
  CAVES,
  ECO_TRAILS,
  LANDMARKS,
  PISTE_DIFFICULTY_LABELS,
  PISTES,
  RESORT_STATS,
  SKI_EXTRAS,
  SKI_LIFTS,
  SUMMER_ACTIVITIES,
  WINTER_ACTIVITIES,
} from "../../client/src/data/pamporovoContent";
import { LIFT_FACTS } from "../pamporovoSkiData";

type WriteJson = (name: string, data: unknown) => void;

export function extractGuide(writeJson: WriteJson): void {
  const attractions: Record<string, unknown> = {};
  for (const a of ALL_ATTRACTIONS) {
    attractions[a.id] = {
      title: a.title,
      distance: a.distance,
      duration: a.duration ?? "",
      description: a.description,
      highlights: a.highlights,
    };
  }

  writeJson("guide", {
    nav: {
      ariaLabel: "Секции на страницата",
      intro: "Курортът",
      winter: "Зима",
      summer: "Лято",
      landmarks: "Околността",
      caves: "Пещери",
    },
    sticky: {
      book: "Резервирай",
      rent: "Наем · цени",
    },
    ui: {
      pisteNumber: "№",
      pisteName: "Писта",
      difficulty: "Трудност",
      length: "Дължина",
      note: "Бележка",
      dash: "—",
      meters: "м",
      route: "Маршрут",
      liftType: "Тип",
      capacity: "Капацитет/ч",
      capacityPerHour: "Капацитет/час",
    },
    difficulty: { ...PISTE_DIFFICULTY_LABELS },
    sections: {
      intro: {
        eyebrow: "Курортът",
        title: "Сърцето на Родопите",
        subtitle:
          "На 1650 м надморска височина, в подножието на връх Снежанка — най-старият български ски курорт, основан през 1933 г.",
        panoramaAlt: "Зимен курорт Пампорово — хотели и писти в Родопите",
        towerAlt: "Кулата Снежанка — символ на Пампорово",
        p1: "Два основни ски центъра — Студенец и Малина — свързани с връх Снежанка (1926 м). Пистите са между 1400 и 1926 m, с модерни лифтове и над 80 снежни оръдия.",
        p2: "Лятото курортът се превръща в база за еко туризъм — маркирани пътеки, колоездене, конна езда и безброй забележителности на 15–60 минути с кола до Смолян, Широка лъка, Чудните мостове и подземните дворци на Западните Родопи.",
        cta: "Резервирай вила в Пампорово",
      },
      winter: {
        eyebrow: "Зима",
        title: "Ски зона — писти и лифтове",
        subtitle: "37+ км маркирани писти за ски и сноуборд, нощно каране на Стената и маршрути за ски бягане",
        skiAlt: "Седалков лифт към връх Снежанка — кулата над Пампорово",
        pistesHeading: "Писти по трудност",
        liftsHeading: "Лифтове и съоръжения",
        activitiesHeading: "Зимни активности",
      },
      summer: {
        eyebrow: "Лято",
        title: "Еко пътеки и природа",
        subtitle: "Каньонът на водопадите, Смолянските езера, Орфеевите скали — на минути от курорта",
        summerAlt: "Планинско езеро в Родопите — лятна еко пътека край Пампорово",
        activitiesHeading: "Летни активности",
      },
      landmarks: {
        eyebrow: "Околността",
        title: "Забележителности и села",
        subtitle: "Архитектурни резервати, обсерватория, планетариум и автентичен родопски фолклор",
      },
      caves: {
        eyebrow: "Подземен свят",
        title: "Пещери и ждрела",
        subtitle: "Ягодинска пещера, Дяволското гърло, Триградско ждрело и Ухловица — съкровища на Западните Родопи",
        footer:
          "Вилите Pamporovo Villa са на Райковски ливади — идеална база за зимни и летни приключения в целия регион.",
        cta: "Виж свободни дати и резервирай",
      },
    },
    stats: RESORT_STATS.map((s) => ({ value: s.value, label: s.label })),
    pistes: PISTES.map((p) => ({ name: p.name, note: p.note ?? "" })),
    skiLifts: SKI_LIFTS.map((l) => ({
      route: l.route,
      type: l.type,
      note: l.note ?? "",
    })),
    liftFacts: LIFT_FACTS.map((l) => ({ route: l.route, type: l.type })),
    skiExtras: [...SKI_EXTRAS],
    winterActivities: WINTER_ACTIVITIES.map((a) => ({ title: a.title, description: a.description })),
    summerActivities: SUMMER_ACTIVITIES.map((a) => ({ title: a.title, description: a.description })),
    attractions,
    lists: {
      eco: ECO_TRAILS.map((a) => a.id),
      landmarks: LANDMARKS.map((a) => a.id),
      caves: CAVES.map((a) => a.id),
    },
  });
}
