import { Question } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_SPEED = 5;
export const BULLET_SPEED = 8;
export const SPAWN_RATE_BASE = 60; // Frames

export const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "¿Cuál es el agente causante de la Tos Ferina (Pertussis)?",
    options: [
      "Staphylococcus aureus",
      "Bordetella pertussis",
      "Influenza Tipo A",
      "Streptococcus pneumoniae"
    ],
    correctAnswer: 1,
    explanation: "La tos ferina es una infección bacteriana causada por el cocobacilo Gram-negativo Bordetella pertussis."
  },
  {
    id: 2,
    question: "¿Qué grupo tiene la mayor tasa de mortalidad por Pertussis?",
    options: [
      "Adolescentes",
      "Mujeres embarazadas",
      "Lactantes < 2 meses",
      "Ancianos > 80 años"
    ],
    correctAnswer: 2,
    explanation: "Los lactantes menores de 2 meses son demasiado pequeños para ser vacunados y tienen la mayor incidencia de enfermedad y mortalidad."
  },
  {
    id: 3,
    question: "¿Cuál es el tratamiento antibiótico de primera línea recomendado?",
    options: [
      "Penicilina",
      "Macrólidos (Azitromicina/Claritromicina)",
      "Amoxicilina",
      "Vancomicina"
    ],
    correctAnswer: 1,
    explanation: "Se recomiendan macrólidos como la Azitromicina o Claritromicina para disminuir la gravedad de la enfermedad y la infectividad."
  },
  {
    id: 4,
    question: "¿Qué es la estrategia 'Capullo' (Cocooning)?",
    options: [
      "Envolver al bebé en mantas calientes",
      "Aislar al bebé durante 6 meses",
      "Vacunar a los contactos cercanos (padres, hermanos)",
      "Usar un humidificador constantemente"
    ],
    correctAnswer: 2,
    explanation: "La estrategia Capullo implica vacunar a los miembros del hogar y contactos cercanos para proteger al recién nacido."
  },
  {
    id: 5,
    question: "¿Qué prueba diagnóstica es preferible en las primeras 3 semanas?",
    options: [
      "Radiografía de tórax",
      "Cultivo de sangre",
      "PCR de secreciones nasofaríngeas",
      "Análisis de orina"
    ],
    correctAnswer: 2,
    explanation: "La prueba de PCR de secreciones nasofaríngeas posteriores es el estándar para el diagnóstico dentro de las primeras 3 semanas."
  },
  {
    id: 6,
    question: "¿Cuándo deben vacunarse las mujeres embarazadas para una transferencia óptima de anticuerpos?",
    options: [
      "Primer trimestre",
      "Entre las semanas 16 y 32 de gestación",
      "Inmediatamente después del parto",
      "Solo si tienen síntomas"
    ],
    correctAnswer: 1,
    explanation: "La vacunación entre las semanas 16-32 maximiza la transferencia transplacentaria de anticuerpos al feto."
  },
  {
    id: 7,
    question: "¿Qué caracteriza a la etapa 'Paroxística'?",
    options: [
      "Solo secreción nasal",
      "Fase de recuperación",
      "Ataques rápidos de tos y sonido de 'gallo' (whoop)",
      "Fiebre alta y erupción cutánea"
    ],
    correctAnswer: 2,
    explanation: "La fase paroxística implica tos rápida debido a la incapacidad de expulsar moco, a menudo con el clásico sonido de 'gallo'."
  }
];