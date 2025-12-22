import { Activity, ActivityCategory } from '../types';

export const ACTIVITIES: Activity[] = [
  // Higiene Pessoal
  { id: 'hygiene_1', name: 'Escovar os dentes 3x ao dia', points: 3, category: 'hygiene' },
  { id: 'hygiene_2', name: 'Usar fio dental', points: 1, category: 'hygiene' },
  { id: 'hygiene_3', name: 'Tomar banho', points: 2, category: 'hygiene' },
  { id: 'hygiene_4', name: 'Lavar bem o cabelo', points: 1, category: 'hygiene' },
  { id: 'hygiene_5', name: 'Passar desodorante', points: 1, category: 'hygiene' },
  { id: 'hygiene_6', name: 'Lavar o rosto de manhã', points: 1, category: 'hygiene' },
  { id: 'hygiene_7', name: 'Manter unhas limpas e cortadas', points: 1, category: 'hygiene' },
  { id: 'hygiene_8', name: 'Trocar roupas íntimas diariamente', points: 1, category: 'hygiene' },
  { id: 'hygiene_9', name: 'Guardar produtos de higiene no local correto', points: 1, category: 'hygiene' },
  { id: 'hygiene_10', name: 'Dar descarga sempre que fizer o n. 2', points: 1, category: 'hygiene' },

  // Organização
  { id: 'org_1', name: 'Arrumar a cama', points: 2, category: 'organization' },
  { id: 'org_2', name: 'Manter o quarto organizado', points: 3, category: 'organization' },
  { id: 'org_3', name: 'Guardar roupas e sapatos', points: 2, category: 'organization' },
  { id: 'org_4', name: 'Colocar roupas sujas no cesto', points: 1, category: 'organization' },
  { id: 'org_5', name: 'Organizar mochila/material escolar', points: 2, category: 'organization' },

  // Tarefas Domésticas
  { id: 'chores_1', name: 'Lavar ou ajudar a lavar louça', points: 3, category: 'chores' },
  { id: 'chores_2', name: 'Levar louça da mesa para a pia', points: 1, category: 'chores' },
  { id: 'chores_3', name: 'Secar e guardar louça', points: 1, category: 'chores' },
  { id: 'chores_4', name: 'Preparar o próprio café da manhã', points: 3, category: 'chores' },
  { id: 'chores_5', name: 'Ajudar a varrer ou passar pano no chão', points: 3, category: 'chores' },
  { id: 'chores_6', name: 'Tirar o lixo / ajudar na limpeza', points: 2, category: 'chores' },

  // Cuidados com Pet
  { id: 'pet_1', name: 'Colocar comida para Lola', points: 2, category: 'pet_care' },
  { id: 'pet_2', name: 'Trocar água', points: 2, category: 'pet_care' },
  { id: 'pet_3', name: 'Recolher fezes', points: 3, category: 'pet_care' },
  { id: 'pet_4', name: 'Ajudar na limpeza dos potes de comida e água', points: 1, category: 'pet_care' },
  { id: 'pet_5', name: 'Brincar/dar atenção', points: 1, category: 'pet_care' },

  // Desenvolvimento Pessoal
  { id: 'dev_1', name: 'Ler livro 30 min', points: 3, category: 'development' },
  { id: 'dev_2', name: 'Fazer as tarefas escolares com atenção', points: 3, category: 'development' },
  { id: 'dev_3', name: 'Atividade física 30 min', points: 4, category: 'development' },
  { id: 'dev_4', name: 'Praticar instrumento 15 min', points: 3, category: 'development' },
  { id: 'dev_5', name: 'Desenhar, pintar ou escrever 15min', points: 2, category: 'development' },
  { id: 'dev_6', name: 'Explorar hobbies criativos', points: 2, category: 'development' },

  // Comportamento
  { id: 'behavior_1', name: 'Cumprir horários combinados', points: 3, category: 'behavior' },
  { id: 'behavior_2', name: 'Acordar quando chamado pelos pais', points: 3, category: 'behavior' },
  { id: 'behavior_3', name: 'Ficar pronto para ir para a Escola no horário', points: 3, category: 'behavior' },
  { id: 'behavior_4', name: 'Ajudar sem precisar ser lembrado', points: 3, category: 'behavior' },
  { id: 'behavior_5', name: 'Cuidar dos próprios pertences', points: 3, category: 'behavior' },
  { id: 'behavior_6', name: 'Respeitar regras da casa', points: 3, category: 'behavior' },
  { id: 'behavior_7', name: 'Comunicar-se com educação e respeito', points: 3, category: 'behavior' },
];

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  hygiene: 'Higiene Pessoal',
  organization: 'Organização',
  chores: 'Tarefas Domésticas',
  pet_care: 'Cuidados com Pet',
  development: 'Desenvolvimento Pessoal',
  behavior: 'Comportamento',
};

export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  hygiene: '🧼',
  organization: '🗂️',
  chores: '🏠',
  pet_care: '🐕',
  development: '📚',
  behavior: '⭐',
};
