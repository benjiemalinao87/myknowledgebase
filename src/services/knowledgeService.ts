import { KnowledgeItem, KnowledgeStats } from '../types';

// Mock data for demonstration
const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: '1',
    type: 'file',
    title: 'Kitchen Renovation Guide.pdf',
    fileType: 'pdf',
    size: 2400000,
    addedAt: new Date('2024-12-15'),
    status: 'active',
    tags: ['kitchen', 'renovation', 'guide']
  },
  {
    id: '2',
    type: 'link',
    title: 'Home Depot - Bathroom Tiles',
    url: 'https://www.homedepot.com/bathroom-tiles',
    addedAt: new Date('2024-12-14'),
    status: 'active',
    tags: ['bathroom', 'tiles', 'materials']
  },
  {
    id: '3',
    type: 'file',
    title: 'Electrical Wiring Basics.docx',
    fileType: 'docx',
    size: 1800000,
    addedAt: new Date('2024-12-13'),
    status: 'active',
    tags: ['electrical', 'wiring', 'safety']
  },
  {
    id: '4',
    type: 'context',
    title: 'Living Room Renovation Context',
    content: 'Planning to renovate a 15x20 living room with hardwood floors, budget of $15,000, modern farmhouse style preferred.',
    addedAt: new Date('2024-12-12'),
    status: 'active',
    tags: ['living room', 'budget', 'farmhouse']
  },
  {
    id: '5',
    type: 'link',
    title: 'DIY Plumbing Repairs',
    url: 'https://www.familyhandyman.com/plumbing-repairs',
    addedAt: new Date('2024-12-11'),
    status: 'processing',
    tags: ['plumbing', 'diy', 'repairs']
  }
];

export async function getKnowledgeItems(): Promise<KnowledgeItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockKnowledgeItems;
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

export async function deleteKnowledgeItem(id: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In a real app, this would make an API call
  const index = mockKnowledgeItems.findIndex(item => item.id === id);
  if (index > -1) {
    mockKnowledgeItems.splice(index, 1);
    return true;
  }
  return false;
}

export async function searchKnowledgeItems(query: string): Promise<KnowledgeItem[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query.trim()) {
    return mockKnowledgeItems;
  }
  
  const lowercaseQuery = query.toLowerCase();
  return mockKnowledgeItems.filter(item => 
    item.title.toLowerCase().includes(lowercaseQuery) ||
    item.content?.toLowerCase().includes(lowercaseQuery) ||
    item.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}