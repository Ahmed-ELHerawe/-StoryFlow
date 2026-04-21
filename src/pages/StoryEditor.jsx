import React, { useCallback, useState } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  Handle, Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStoriesStore } from '../stores'
import { GENRES, ENDING_CONFIG } from '../data/stories'

// ─── Custom Nodes ─────────────────────────────────────────────────────────────

function ChapterNode({ data, selected }) {
  const isEnding = data.endingType !== null && data.endingType !== undefined
  const ending = isEnding ? ENDING_CONFIG[data.endingType] : null

  return (
    <div className={`rounded-xl border px-4 py-3 min-w-[160px] max-w-[200px] text-center shadow-lg transition-all ${
      selected ? 'border-gold-500' : isEnding ? 'border-green-500/40' : 'border-ink-500'
    } ${isEnding ? 'bg-green-500/10' : 'bg-ink-800'}`}
      style={{ fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#f5c842', width: 10, height: 10 }} />
      <div className="text-lg mb-1">{isEnding ? ending?.emoji || '⭕' : '📖'}</div>
      <div className="text-xs font-bold text-mist-100 truncate">{data.label}</div>
      {isEnding && <div className={`text-xs mt-0.5 ${ending?.color}`}>{ending?.label}</div>}
      {!isEnding && (
        <Handle type="source" position={Position.Bottom} style={{ background: '#f5c842', width: 10, height: 10 }} />
      )}
    </div>
  )
}

const nodeTypes = { chapter: ChapterNode }

// ─── Convert story to flow nodes/edges ────────────────────────────────────────

function storyToFlow(story) {
  if (!story) return { nodes: [], edges: [] }
  const nodes = []
  const edges = []
  const visited = new Set()

  const layerMap = {}
  const assignLayer = (id, layer) => {
    if (visited.has(id)) return
    visited.add(id)
    layerMap[id] = Math.max(layerMap[id] || 0, layer)
    const ch = story.chapters[id]
    if (!ch) return
    ch.choices?.forEach(c => assignLayer(c.nextChapterId, layer + 1))
  }
  assignLayer(story.startChapterId, 0)

  const layerCounts = {}
  Object.entries(layerMap).forEach(([, l]) => { layerCounts[l] = (layerCounts[l] || 0) + 1 })
  const layerIdx = {}

  Object.entries(layerMap).forEach(([id, layer]) => {
    layerIdx[layer] = (layerIdx[layer] || 0)
    const count = layerCounts[layer]
    const x = (layerIdx[layer] - (count - 1) / 2) * 220
    const y = layer * 140
    layerIdx[layer]++
    const ch = story.chapters[id]
    nodes.push({
      id,
      type: 'chapter',
      position: { x, y },
      data: { label: ch?.title || id, endingType: ch?.endingType ?? null },
    })
    ch?.choices?.forEach((c, i) => {
      edges.push({
        id: `${id}-${c.nextChapterId}-${i}`,
        source: id,
        target: c.nextChapterId,
        label: c.text?.slice(0, 20) + (c.text?.length > 20 ? '…' : ''),
        style: { stroke: '#f5c842', strokeWidth: 1.5 },
        labelStyle: { fill: '#9088b8', fontSize: 10, fontFamily: 'Tajawal' },
        labelBgStyle: { fill: '#1c1c28', fillOpacity: 0.9 },
      })
    })
  })

  return { nodes, edges }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StoryFlowEditor() {
  const { getAllStories } = useStoriesStore()
  const allStories = getAllStories()
  const [selectedStory, setSelectedStory] = useState(allStories[0]?.id || '')
  const story = allStories.find(s => s.id === selectedStory)

  const { nodes: initNodes, edges: initEdges } = storyToFlow(story)
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  const onConnect = useCallback(params => setEdges(e => addEdge({ ...params, style: { stroke: '#f5c842' } }, e)), [])

  const handleStoryChange = (id) => {
    setSelectedStory(id)
    const s = allStories.find(st => st.id === id)
    const { nodes: n, edges: e } = storyToFlow(s)
    setNodes(n)
    setEdges(e)
  }

  return (
    <div className="min-h-screen pt-16 bg-ink-950">
      <div className="max-w-full px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-mist-100">محرر القصص المرئي</h1>
            <p className="text-mist-500 text-xs mt-0.5">اسحب العقد لإعادة ترتيبها — شجرة القصة التفاعلية</p>
          </div>
          <select
            value={selectedStory}
            onChange={e => handleStoryChange(e.target.value)}
            className="input-dark w-auto text-sm"
            style={{ direction: 'rtl' }}
          >
            {allStories.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          {/* Legend */}
          <div className="flex items-center gap-3 mr-auto text-xs text-mist-500 flex-wrap">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-ink-700 border border-ink-500 inline-block" /> فصل</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/40 inline-block" /> نهاية</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-gold-500 inline-block" /> اختيار</span>
          </div>
        </div>

        {/* Flow canvas */}
        <div
          className="rounded-2xl overflow-hidden border border-ink-700"
          style={{ height: 'calc(100vh - 180px)' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            style={{ background: '#0a0a0f' }}
            defaultEdgeOptions={{ style: { stroke: '#f5c842', strokeWidth: 1.5 } }}
          >
            <Background color="#26263a" gap={24} size={1} />
            <Controls style={{ button: { background: '#1c1c28', border: '1px solid #3a3a52', color: '#b8b2d4' } }} />
            <MiniMap
              style={{ background: '#12121a', border: '1px solid #26263a' }}
              nodeColor={n => n.data?.endingType ? '#1D9E75' : '#534AB7'}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
