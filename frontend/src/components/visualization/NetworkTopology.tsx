import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface NodeData extends d3.SimulationNodeDatum {
  id: number;
  type: number;
  status: 'normal' | 'compromised' | 'isolated' | 'detected';
}

export interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: number | NodeData;
  target: number | NodeData;
  traffic: number;
}

interface NetworkProps {
  nodes: NodeData[];
  links: LinkData[];
  width?: number;
  height?: number;
}

export const NetworkTopology: React.FC<NetworkProps> = ({ nodes, links, width = 800, height = 500 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Define glowing dropshadows within the SVG
    const defs = svg.append("defs");
    ['green', 'red', 'yellow', 'blue'].forEach(color => {
      const filter = defs.append("filter").attr("id", `glow-${color}`);
      filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    });

    const g = svg.append('g');

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(30));

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(0, 240, 255, 0.2)')
      .attr('stroke-width', d => Math.max(1, (d.traffic || 0) / 50));

    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, NodeData>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any
      );

    const getNodeColor = (status: string) => {
      if (status === 'compromised') return '#ff003c';
      if (status === 'detected') return '#facc15';
      if (status === 'isolated') return '#475569';
      return '#00ff41'; // normal
    };

    const getGlowFilter = (status: string) => {
      if (status === 'compromised') return 'url(#glow-red)';
      if (status === 'detected') return 'url(#glow-yellow)';
      if (status === 'isolated') return 'none';
      return 'url(#glow-green)';
    };

    nodeGroup.append('circle')
      .attr('r', 14)
      .attr('fill', '#0a192f')
      .attr('stroke', d => getNodeColor(d.status))
      .attr('stroke-width', 2)
      .style('filter', d => getGlowFilter(d.status));

    nodeGroup.append('text')
      .text(d => d.id.toString())
      .attr('x', 0)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeData).x!)
        .attr('y1', d => (d.source as NodeData).y!)
        .attr('x2', d => (d.target as NodeData).x!)
        .attr('y2', d => (d.target as NodeData).y!);

      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  return (
    <div className="w-full h-full min-h-[500px]">
      <svg ref={svgRef} className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};
