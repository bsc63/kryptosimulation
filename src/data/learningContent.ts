import { GlossaryTerm, Mission } from '../types/blockchain';

export const GLOSSARY_ITEMS: GlossaryTerm[] = [
  {
    term: 'Blockchain',
    simpleName: 'Die unveränderbare Kette',
    explanation:
      'Ein digitales Kassenbuch, das nicht auf einem einzelnen Bank-Server liegt, sondern verteilt bei allen Teilnehmern. Jeder neue Block wird wie mit einem Wachssiegel an den vorherigen Block angehängt.',
    everydayAnalogy:
      'Stell dir ein Schul-Klassenbuch vor, von dem jeder Schüler eine Kopie im Rucksack hat. Wenn jemand heimlich eine Note ändern will, merken die anderen sofort, dass ihre Kopien nicht übereinstimmen.',
    iconName: 'Link',
  },
  {
    term: 'Mining (Schürfen)',
    simpleName: 'Geld-Erzeugung & Absicherung',
    explanation:
      'Der Vorgang, bei dem Computer Transaktionen prüfen, in einen Block packen und ein schweres mathematisches Rätsel lösen. Als Lohn für die Rechenleistung erhält der Finder neue Münzen ("Block-Belohnung").',
    everydayAnalogy:
      'Wie ein Sudoku-Wettbewerb: Wer das Rätsel als Erster gelöst hat, zeigt es allen, darf die Buchseite einkleben und bekommt dafür 10 EduCoins als Belohnung.',
    iconName: 'Pickaxe',
  },
  {
    term: 'Hash (Prüfsumme)',
    simpleName: 'Der digitale Fingerabdruck',
    explanation:
      'Eine mathematische Einwegfunktion (z.B. SHA-256), die aus jedem beliebigen Text eine feste 64-stellige Zeichenkette erzeugt. Schon wenn du einen einzigen Buchstaben änderst, sieht der Hash völlig anders aus ("Lawineneffekt").',
    everydayAnalogy:
      'Wie ein Mixer: Du kannst Erdbeeren zu Smoothie pürieren (einfach). Aber aus dem Smoothie kannst du niemals die originale Erdbeere wiederherstellen (Einwegfunktion).',
    iconName: 'Fingerprint',
  },
  {
    term: 'Nonce',
    simpleName: 'Die Rätsel-Glückszahl',
    explanation:
      'Ein Zähler (eine Zahl ab 0), den der Miner im Block verändert, bis der erzeugte Hash die Vorgabe erfüllt (z.B. mit "00" beginnt). Das kann man nur durch endloses Ausprobieren schaffen.',
    everydayAnalogy:
      'Wie ein dreistelliges Zahlenschloss am Spind: Man muss 001, 002, 003... durchprobieren, bis es "Klick" macht.',
    iconName: 'Dices',
  },
  {
    term: 'Mempool',
    simpleName: 'Der Warteraum für Überweisungen',
    explanation:
      'Wenn Schüler Geld versenden, landen die Aufträge zuerst im Mempool. Erst wenn ein Miner die Transaktionen in einen neuen Block aufnimmt und diesen schürft, sind sie endgültig bestätigt.',
    everydayAnalogy:
      'Wie ein Postkasten am Sekretariat: Schüler werfen Zettel ein, und der Hausmeister leert ihn einmal pro Stunde und heftet die Zettel in den Ordner ab.',
    iconName: 'Inbox',
  },
  {
    term: 'Wallet & Adresse',
    simpleName: 'Die digitale Geldbörse',
    explanation:
      'Enthält deine öffentliche Adresse (wie deine E-Mail oder IBAN, die jeder sehen darf) und deinen privaten Schlüssel (wie dein geheimes Passwort zum Bestätigen von Überweisungen).',
    everydayAnalogy:
      'Deine Adresse ist wie der Einwurfschlitz deines Briefkastens (jeder kann etwas hineinwerfen). Dein privater Schlüssel ist der einzige Schlüssel zum Öffnen.',
    iconName: 'Wallet',
  },
  {
    term: 'Proof-of-Work',
    simpleName: 'Der Arbeitsnachweis',
    explanation:
      'Der Beweis, dass für die Erstellung eines Blocks echte Computerarbeit und Strom aufgewendet wurde. Weil das Aufwand kostet, lohnt sich Betrug nicht, denn gefälschte Blöcke werden vom Netzwerk sofort abgelehnt.',
    everydayAnalogy:
      'Wenn du eine 10-seitige Hausarbeit handschriftlich abgibst, sieht die Lehrkraft sofort: Du hast echte Zeit und Mühe investiert.',
    iconName: 'ShieldCheck',
  },
  {
    term: 'Coinbase-Transaktion',
    simpleName: 'Frisch gedruckte Münzen',
    explanation:
      'Die allererste Transaktion in jedem Block. Sie hat keinen menschlichen Absender, sondern wird vom Blockchain-Protokoll neu erschaffen und an den Finder des Blocks überwiesen.',
    everydayAnalogy:
      'Der Moment, in dem die Zentralbank eine neue Münze prägt – nur dass hier der fleißige Miner die Münze direkt erhält!',
    iconName: 'Coins',
  },
];

export interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'Geld-Erzeugung',
    question: 'Woher kommen eigentlich neue EduCoins in einer Blockchain?',
    options: [
      'Eine Bank druckt sie nach Belieben aus.',
      'Sie entstehen als Belohnung für Miner, die einen neuen Block mit Rechenleistung lösen.',
      'Man kauft sie heimlich im Supermarkt.',
      'Jeder Schüler darf sich im Wallet so viele Münzen eintippen, wie er möchte.',
    ],
    correctIndex: 1,
    explanation:
      'Richtig! In Bitcoin und Proof-of-Work-Blockchains entstehen neue Münzen ausschließlich als "Block-Belohnung" (Coinbase) für die Rechenarbeit der Miner. So ist die Geldmenge streng geregelt.',
  },
  {
    id: 2,
    category: 'Fälschungssicherheit',
    question: 'Was passiert sofort, wenn jemand heimlich einen Betrag in Block #1 ändert?',
    options: [
      'Niemand merkt etwas und der Betrüger ist reich.',
      'Der Hash von Block #1 ändert sich komplett und die Kette zu Block #2 bricht ab.',
      'Das Internet wird weltweit für 10 Minuten abgeschaltet.',
      'Der Computer explodiert mit einem Warnton.',
    ],
    correctIndex: 1,
    explanation:
      'Genau! Durch die kryptografische Hashfunktion ändert sich der Fingerabdruck von Block #1 drastisch. Block #2 verweist aber noch auf den alten Hash – die Kette reißt ab und alle Computer lehnen die Fälschung ab!',
  },
  {
    id: 3,
    category: 'Mining & Nonce',
    question: 'Warum müssen Mining-Computer beim Schürfen so viel Strom und Zeit aufwenden?',
    options: [
      'Sie müssen milliardenfach verschiedene Zahlen (Nonces) ausprobieren, bis der Hash passt.',
      'Sie laden heimlich riesige Videospiele aus dem Netz herunter.',
      'Der Bildschirm muss auf maximaler Helligkeit leuchten.',
      'Die Tastatur tippt von alleine Texte ein.',
    ],
    correctIndex: 0,
    explanation:
      'Exakt! Weil man das Ergebnis eines Hashes nicht vorausberechnen kann, bleibt dem Computer nichts anderes übrig, als die "Nonce" wie ein Zahlenschloss Schritt für Schritt auszuprobieren, bis z.B. genügend Nullen am Anfang stehen.',
  },
  {
    id: 4,
    category: 'Warteraum (Mempool)',
    question: 'Wo befindet sich deine Überweisung direkt nach dem Klick auf "Senden"?',
    options: [
      'Sie ist sofort unumkehrbar für immer festgeschrieben.',
      'Im "Mempool" (Warteraum), bis ein Miner sie in den nächsten Block einpackt.',
      'Auf einem USB-Stick des Schuldirektors.',
      'Sie verschwindet im Papierkorb des Browsers.',
    ],
    correctIndex: 1,
    explanation:
      'Stimmt! Der Mempool ist der digitale Warteraum. Erst wenn ein Miner die Transaktionen bündelt und einen gültigen Block schürft, gilt die Überweisung als endgültig bestätigt.',
  },
  {
    id: 5,
    category: 'Dezentralität',
    question: 'Warum braucht eine echte Blockchain wie Bitcoin keine Bank oder Chefin?',
    options: [
      'Weil niemand Geld bezahlen muss.',
      'Weil mathematische Regeln und der Konsens aller Teilnehmer Betrug unmöglich machen.',
      'Weil Banken am Wochenende geschlossen haben.',
      'Weil Computer sowieso immer die Wahrheit sagen.',
    ],
    correctIndex: 1,
    explanation:
      'Großartig! Durch kryptografische Regeln, Verteilung auf viele Rechner und den "Proof-of-Work" kontrollieren sich alle Teilnehmer gegenseitig. Eine zentrale Kontrollstelle ist überflüssig.',
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1_tx',
    title: 'Mission 1: Die erste Überweisung',
    description: 'Sende mindestens 2 EduCoins von deinem Wallet oder von Lukas an eine Mitschülerin.',
    hint: 'Klicke oben rechts auf "Überweisen" und wähle Absender, Empfänger und Betrag.',
    completed: false,
    actionText: 'Überweisung senden',
  },
  {
    id: 'm2_mine',
    title: 'Mission 2: Block schürfen (Mining)',
    description: 'Bringe mindestens eine wartende Transaktion aus dem Mempool in einen neuen Block und kassiere 10 EDC Belohnung!',
    hint: 'Klicke im Mempool-Kasten auf "Jetzt minen" und starte den Rätsel-Löser.',
    completed: false,
    actionText: 'Block schürfen',
  },
  {
    id: 'm3_tamper',
    title: 'Mission 3: Der Fälschungs-Test',
    description: 'Versuche einen alten Block zu manipulieren und beobachte, wie die kryptografische Kette bricht.',
    hint: 'Öffne das "Fälschungs-Labor", ändere einen Betrag und sieh dir die rote Alarm-Meldung an.',
    completed: false,
    actionText: 'Fälschung testen',
  },
  {
    id: 'm4_quiz',
    title: 'Mission 4: Das Blockchain-Diplom',
    description: 'Beantworte die 5 Quiz-Fragen im Wissens-Check, um dein Schul-Diplom zu erhalten.',
    hint: 'Klicke im Navigations-Menü auf "Schüler-Quiz".',
    completed: false,
    actionText: 'Quiz starten',
  },
];
