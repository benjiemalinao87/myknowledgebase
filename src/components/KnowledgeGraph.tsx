import React, { useEffect, useRef, useState, useCallback } from 'react';
import { KnowledgeGraph as KnowledgeGraphType } from '../types/visualization';

interface KnowledgeGraphProps {
  graph: KnowledgeGraphType;
  selectedNode?: string;
  onNodeSelect: (id: string) => void;
}

export function KnowledgeGraph({ graph, selectedNode, onNodeSelect }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Simple force-directed layout simulation
  const layoutNodes = useCallback(() => {
    const width = 500;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    const initialPositions: Record<string, { x: number; y: number }> = {};
    
    graph.nodes.forEach((node, index) => {
      const angle = (index / graph.nodes.length) * 2 * Math.PI;
      const radius = node.type === 'concept' ? 80 : 120 + Math.random() * 80;
      
      initialPositions[node.id] = {
        x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 60,
        y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 60,
      };
    });
    
    return initialPositions;
  }, [graph.nodes]);

  useEffect(() => {
    const positions = layoutNodes();
    setNodePositions(positions);
  }, [layoutNodes]);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setDraggedNode(nodeId);
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const nodePos = nodePositions[nodeId];
      setDragOffset({
        x: e.clientX - rect.left - nodePos.x,
        y: e.clientY - rect.top - nodePos.y,
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedNode || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    // Constrain to SVG bounds
    const constrainedX = Math.max(20, Math.min(480, newX));
    const constrainedY = Math.max(20, Math.min(380, newY));
    
    setNodePositions(prev => ({
      ...prev,
      [draggedNode]: { x: constrainedX, y: constrainedY }
    }));
  }, [draggedNode, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (draggedNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, handleMouseMove, handleMouseUp]);

  const positionedNodes = graph.nodes.map(node => ({
    ...node,
    ...(nodePositions[node.id] || { x: 250, y: 200 })
  }));

  const getNodeRadius = (node: any) => {
    switch (node.type) {
      case 'concept': return Math.max(8, Math.min(20, node.size));
      case 'source': return Math.max(5, Math.min(12, node.size));
      default: return 6;
    }
  };

  const getNodeColor = (node: any) => {
    if (selectedNode === node.id) return '#1D4ED8';
    return node.color || '#93C5FD';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">🕸️ Knowledge Graph</h3>
        <div className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-lg">
          {graph.nodes.length} nodes • {graph.links.length} connections
        </div>
      </div>
      
      <div className="relative">
        <svg ref={svgRef} width="600" height="450" className="border border-gray-200/60 rounded-xl shadow-inner bg-gradient-to-br from-gray-50 to-white">
          <defs>
            <filter id="node-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Links */}
          {graph.links.map((link, index) => {
            const sourceNode = positionedNodes.find(n => n.id === link.source);
            const targetNode = positionedNodes.find(n => n.id === link.target);
            
            if (!sourceNode || !targetNode) return null;
            
            return (
              <line
                key={index}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={link.type === 'semantic' ? '#CBD5E1' : '#E2E8F0'}
                strokeWidth={Math.max(1, link.strength * 4)}
                opacity={0.7}
                className="transition-opacity duration-200"
              />
            );
          })}
          
          {/* Nodes */}
          {positionedNodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={getNodeRadius(node)}
                fill={getNodeColor(node)}
                stroke={selectedNode === node.id ? '#1D4ED8' : '#9CA3AF'}
                strokeWidth={selectedNode === node.id ? 4 : 2}
                filter={selectedNode === node.id ? "url(#node-glow)" : "none"}
                className={`transition-all duration-300 hover:stroke-blue-500 hover:r-8 ${
                  draggedNode === node.id ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onClick={() => onNodeSelect(node.id)}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                style={{ cursor: draggedNode === node.id ? 'grabbing' : 'grab' }}
              />
              {node.type === 'concept' && (
                <text
                  x={node.x}
                  y={node.y + 30}
                  textAnchor="middle"
                  className="text-xs fill-gray-800 font-semibold pointer-events-none select-none"
                >
                  {node.label.length > 15 ? `${node.label.slice(0, 15)}...` : node.label}
                </text>
              )}
            </g>
          ))}
        </svg>
        
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50/60 rounded-xl border border-gray-200/40">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-200 shadow-sm"></div>
              <span className="text-sm text-gray-700 font-medium">Source Documents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#FF6B6B' }}></div>
              <span className="text-sm text-gray-700 font-medium">Concept Clusters</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Semantic Links</span>
            </div>
          </div>
          <div className="text-sm text-gray-600 text-center font-medium bg-blue-50/60 p-3 rounded-xl border border-blue-200/40">
            ✨ Drag nodes to rearrange the graph and explore relationships
          </div>
        </div>
      </div>
    </div>
  );
}