export interface QuestionData {
  value: number;
  prompt: string;
  answer: string;
  isDailyDouble: boolean;
}

export interface CategoryData {
  name: string;
  questions: QuestionData[];
}

export interface BoardData {
  categories: CategoryData[];
}

export interface BoardResponseDto {
  id: string;
  title: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  dataJson: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  color?: string;
}