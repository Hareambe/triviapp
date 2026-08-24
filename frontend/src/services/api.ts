import type { BoardResponseDto } from '../types/board';

const API_BASE = 'http://localhost:5032/api';

export interface CreateBoardPayload {
  title: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  dataJson: string;
}

export async function fetchBoards(): Promise<BoardResponseDto[]> {
  const res = await fetch(`${API_BASE}/boards`);
  if (!res.ok) throw new Error('Failed to fetch boards');
  return res.json();
}

export async function fetchBoardById(id: string): Promise<BoardResponseDto> {
  const res = await fetch(`${API_BASE}/boards/${id}`);
  if (!res.ok) throw new Error('Failed to fetch board');
  return res.json();
}

export async function createBoard(payload: CreateBoardPayload): Promise<BoardResponseDto> {
  const res = await fetch(`${API_BASE}/boards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to create board');
    throw new Error(errText || 'Failed to create board');
  }
  return res.json();
}

export async function updateBoard(id: string, payload: CreateBoardPayload): Promise<BoardResponseDto> {
  const res = await fetch(`${API_BASE}/boards/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to update board');
    throw new Error(errText || 'Failed to update board');
  }
  return res.json();
}

export async function deleteBoard(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/boards/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete board');
}