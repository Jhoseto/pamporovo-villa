/** Ski facts for JSON-LD ItemList — shared between SEO and UI */

export type PisteDifficulty = "green" | "blue" | "red" | "black";

export interface PisteFact {
  number: string;
  name: string;
  difficulty: PisteDifficulty;
  lengthM: number;
}

export interface LiftFact {
  route: string;
  type: string;
  lengthM: number;
  capacity: number;
}

export const PISTE_FACTS: PisteFact[] = [
  { number: "1", name: "Язовира (Малката стена)", difficulty: "red", lengthM: 857 },
  { number: "2", name: "Стената", difficulty: "black", lengthM: 1258 },
  { number: "3", name: "Арх. Петър Петров (Европейската)", difficulty: "black", lengthM: 1766 },
  { number: "4", name: "Снежанка", difficulty: "black", lengthM: 1342 },
  { number: "5", name: "Малина", difficulty: "red", lengthM: 2799 },
  { number: "6", name: "Пампорово (Туристическа)", difficulty: "green", lengthM: 3343 },
  { number: "7", name: "Орловец", difficulty: "blue", lengthM: 1054 },
  { number: "8", name: "Перелик (Южните)", difficulty: "blue", lengthM: 876 },
  { number: "9", name: "Смолянски езера", difficulty: "blue", lengthM: 2405 },
  { number: "10", name: "Дельово дере (Дамска)", difficulty: "blue", lengthM: 1447 },
  { number: "11", name: "Картола", difficulty: "red", lengthM: 967 },
  { number: "12", name: "Стойките 1", difficulty: "blue", lengthM: 3638 },
  { number: "13", name: "Фън слоуп / Бордър крос", difficulty: "blue", lengthM: 346 },
];

export const LIFT_FACTS: LiftFact[] = [
  { route: "Стойките — връх Снежанка", type: "Седалков лифт", lengthM: 2992, capacity: 2400 },
  { route: "Ски център 1 — Студенец", type: "4-седалков лифт", lengthM: 734, capacity: 2000 },
  { route: "Студенец — връх Снежанка", type: "4-седалков лифт", lengthM: 1100, capacity: 2400 },
  { route: "Малина — връх Снежанка", type: "Седалков лифт", lengthM: 2140, capacity: 1800 },
  { route: "Смолянски езера — връх Снежанка", type: "Седалков лифт", lengthM: 1550, capacity: 365 },
  { route: "Малина — Студенец", type: "Седалков лифт", lengthM: 1350, capacity: 475 },
];
