import { KnowledgeItem, KnowledgeStats } from '../types';

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8787/api'
  : 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api';

export async function getKnowledgeItems(): Promise<KnowledgeItem[]> {
  try {
    const response = await fetch(`${API_BASE}/knowledge`);
    const data = await response.json();
    return data.items.map((item: any) => ({
      ...item,
      addedAt: new Date(item.addedAt),
      fileType: item.file_type
    }));
  } catch (error) {
    console.error('Failed to fetch knowledge items:', error);
    return [];
  }
}

export async function getKnowledgeStats(): Promise<KnowledgeStats> {
  const items = await getKnowledgeItems();
  
  return {
    totalItems: items.length,
    files: items.filter(item => item.type === 'file').length,
    links: items.filter(item => item.type === 'link').length,
    contexts: items.filter(item => item.type === 'context').length,
    totalSize: items.reduce((total, item) => total + (item.size || 0), 0)
  };
}

export async function updateKnowledgeItem(id: string, data: Partial<KnowledgeItem>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to update knowledge item:', error);
    return false;
  }
}

export async function deleteKnowledgeItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/knowledge/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to delete knowledge item:', error);
    return false;
  }
}

export async function searchKnowledgeItems(query: string): Promise<KnowledgeItem[]> {
  try {
    if (!query.trim()) {
      return getKnowledgeItems();
    }
    
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results.map((item: any) => ({
      ...item,
      addedAt: new Date(item.added_at),
      fileType: item.file_type
    }));
  } catch (error) {
    console.error('Failed to search knowledge items:', error);
    return [];
  }
}