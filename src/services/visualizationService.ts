import { VisualizationData, VectorEmbedding, SemanticCluster, ProcessingMetadata, KnowledgeGraph } from '../types/visualization';
import { KnowledgeItem } from '../types';

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8787/api'
  : 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api';

// Generate mock vector embeddings
function generateMockEmbedding(sourceId: string, dimensions: number = 384): VectorEmbedding {
  return {
    id: `emb_${Math.random().toString(36).substr(2, 9)}`,
    sourceId,
    vector: Array.from({ length: dimensions }, () => Math.random() * 2 - 1),
    dimensions,
    model: 'text-embedding-ada-002',
    createdAt: new Date(),
  };
}

// Generate semantic clusters
function generateSemanticClusters(items: KnowledgeItem[]): SemanticCluster[] {
  const clusters = [
    {
      id: 'cluster_kitchen',
      name: 'Kitchen & Appliances',
      color: '#FF6B6B',
      confidence: 0.87,
    },
    {
      id: 'cluster_bathroom',
      name: 'Bathroom & Plumbing',
      color: '#4ECDC4',
      confidence: 0.92,
    },
    {
      id: 'cluster_electrical',
      name: 'Electrical & Wiring',
      color: '#45B7D1',
      confidence: 0.78,
    },
    {
      id: 'cluster_flooring',
      name: 'Flooring & Surfaces',
      color: '#96CEB4',
      confidence: 0.83,
    },
    {
      id: 'cluster_exterior',
      name: 'Exterior & Landscaping',
      color: '#FFEAA7',
      confidence: 0.75,
    },
  ];

  return clusters.map(cluster => ({
    ...cluster,
    centroid: Array.from({ length: 384 }, () => Math.random() * 2 - 1),
    items: items
      .filter(() => Math.random() > 0.6)
      .slice(0, Math.floor(Math.random() * 4) + 1)
      .map(item => item.id),
  }));
}

// Generate processing metadata
function generateProcessingMetadata(items: KnowledgeItem[]): ProcessingMetadata[] {
  const entities = ['kitchen', 'bathroom', 'electrical', 'plumbing', 'renovation', 'DIY', 'tools', 'materials'];
  const keywords = ['repair', 'install', 'replace', 'upgrade', 'maintenance', 'safety', 'cost', 'design'];

  return items.map(item => ({
    id: `meta_${item.id}`,
    sourceId: item.id,
    chunkSize: Math.floor(Math.random() * 1000) + 500,
    overlap: Math.floor(Math.random() * 100) + 50,
    tokenCount: Math.floor(Math.random() * 2000) + 1000,
    processingTime: Math.floor(Math.random() * 5000) + 1000,
    extractedEntities: entities.filter(() => Math.random() > 0.7).slice(0, 3),
    keywords: keywords.filter(() => Math.random() > 0.6).slice(0, 4),
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
    complexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
  }));
}

// Generate knowledge graph
function generateKnowledgeGraph(items: KnowledgeItem[], clusters: SemanticCluster[]): KnowledgeGraph {
  const nodes = [
    ...items.map(item => ({
      id: item.id,
      label: item.title,
      type: 'source' as const,
      size: Math.random() * 20 + 10,
      color: '#E3F2FD',
      metadata: item,
    })),
    ...clusters.map(cluster => ({
      id: cluster.id,
      label: cluster.name,
      type: 'concept' as const,
      size: cluster.items.length * 5 + 15,
      color: cluster.color,
      metadata: cluster,
    })),
  ];

  const links = [];
  
  // Add cluster connections
  clusters.forEach(cluster => {
    cluster.items.forEach(itemId => {
      links.push({
        source: itemId,
        target: cluster.id,
        strength: Math.random() * 0.8 + 0.2,
        type: 'semantic' as const,
      });
    });
  });

  // Add similarity connections between items
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (Math.random() > 0.7) {
        links.push({
          source: items[i].id,
          target: items[j].id,
          strength: Math.random() * 0.6 + 0.1,
          type: 'similarity' as const,
        });
      }
    }
  }

  return { nodes, links };
}

export async function getVisualizationData(items: KnowledgeItem[]): Promise<VisualizationData> {
  try {
    const response = await fetch(`${API_BASE}/visualizations`);
    const data = await response.json();
    
    // Transform the data to match our types
    return {
      embeddings: data.embeddings.map((e: any) => ({
        ...e,
        vector: Array.from({ length: 384 }, () => Math.random() * 2 - 1), // Mock vectors for now
        createdAt: new Date(e.createdAt)
      })),
      clusters: data.clusters.map((c: any) => ({
        ...c,
        centroid: Array.from({ length: 384 }, () => Math.random() * 2 - 1) // Mock centroids
      })),
      metadata: data.metadata,
      knowledgeGraph: data.knowledgeGraph,
      stats: data.stats
    };
  } catch (error) {
    console.error('Failed to fetch visualization data:', error);
    // Fallback to generating mock data if API fails
    const embeddings = items.flatMap(item => 
      Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => generateMockEmbedding(item.id))
    );

    const clusters = generateSemanticClusters(items);
    const metadata = generateProcessingMetadata(items);
    const knowledgeGraph = generateKnowledgeGraph(items, clusters);

    const stats = {
      totalVectors: embeddings.length,
      avgSimilarity: Math.random() * 0.4 + 0.6,
      clusterCount: clusters.length,
      processingEfficiency: Math.random() * 0.3 + 0.7,
    };

    return {
      embeddings,
      clusters,
      metadata,
      knowledgeGraph,
      stats,
    };
  }
}