export interface VectorEmbedding {
  id: string;
  sourceId: string;
  vector: number[];
  dimensions: number;
  model: string;
  createdAt: Date;
}

export interface SemanticCluster {
  id: string;
  name: string;
  centroid: number[];
  items: string[];
  color: string;
  confidence: number;
}

export interface ProcessingMetadata {
  id: string;
  sourceId: string;
  chunkSize: number;
  overlap: number;
  tokenCount: number;
  processingTime: number;
  extractedEntities: string[];
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'low' | 'medium' | 'high';
}

export interface KnowledgeGraph {
  nodes: Array<{
    id: string;
    label: string;
    type: 'source' | 'concept' | 'entity';
    size: number;
    color: string;
    metadata?: any;
  }>;
  links: Array<{
    source: string;
    target: string;
    strength: number;
    type: 'semantic' | 'reference' | 'similarity';
  }>;
}

export interface VisualizationData {
  embeddings: VectorEmbedding[];
  clusters: SemanticCluster[];
  metadata: ProcessingMetadata[];
  knowledgeGraph: KnowledgeGraph;
  stats: {
    totalVectors: number;
    avgSimilarity: number;
    clusterCount: number;
    processingEfficiency: number;
  };
}