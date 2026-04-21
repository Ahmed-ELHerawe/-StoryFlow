import React, { useState } from 'react'
import { useAnalyticsStore } from '../stores/analytics'
import { ENDING_CONFIG } from '../data/stories'

function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2)
  if (!node) return null

  const ending = node.endingType ? ENDING_CONFIG[node.endingType] : null
  const isLeaf  = node.endingType !== null && node.endingType !== undefined

  return (
    <div className="relative" style={{ marginRight: depth * 24 }}>
      {/* Node */}
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border mb-2 cursor-pointer transition-all ${
          isLeaf
            ? ending ? `${ending.bg} border-opacity-50` : 'bg-ink-800 border-ink-600'
            : 'bg-ink-800 border-ink-600 hover:border-gold-500/40'
        }`}
        onClick={() => !isLeaf && setExpanded(!expanded)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
          isLeaf ? 'bg-gold-500/20 text-gold-400' : 'bg-ink-700 text-mist-400'
        }`}>
          {isLeaf ? ending?.emoji || '⭕' : expanded ? '▼' : '▶'}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isLeaf && ending ? ending.color : 'text-mist-200'}`}>
            {node.title}
          </p>
          {node.totalVotes > 0 && (
            <p className="text-xs text-mist-500">{node.totalVotes} اختيار</p>
          )}
        </div>
      </div>

      {/* Children */}
      {!isLeaf && expanded && node.children?.map((edge, i) => (
        <div key={edge.choiceId} className="mr-4 mb-3">
          {/* Choice label */}
          <div className="flex items-center gap-2 mb-1.5 pr-2">
            <div className="w-0.5 h-full bg-ink-600 rounded" />
            <span className="text-lg">{edge.icon}</span>
            <span className="text-xs text-mist-400 flex-1 truncate">{edge.choiceText}</span>
            {edge.votes > 0 && (
              <span className="text-xs text-mist-500 flex-shrink-0">{edge.pct}%</span>
            )}
          </div>
          {/* Popularity bar */}
          {edge.votes > 0 && (
            <div className="h-1 bg-ink-700 rounded-full mb-2 mr-8">
              <div
                className="h-full bg-gold-500/60 rounded-full transition-all duration-500"
                style={{ width: `${edge.pct}%` }}
              />
            </div>
          )}
          {edge.child && <TreeNode node={edge.child} depth={depth + 1} />}
        </div>
      ))}
    </div>
  )
}

export default function StoryTree({ story }) {
  const { getStoryTree } = useAnalyticsStore()
  const tree = getStoryTree(story.id, story)

  if (!tree) return null

  return (
    <div className="card-dark p-4">
      <p className="text-xs text-mist-500 font-medium mb-4">خريطة قرارات القراء</p>
      <TreeNode node={tree} />
      <p className="text-xs text-mist-600 mt-3 text-center">
        اضغط على أي عقدة لتوسيعها أو تصغيرها
      </p>
    </div>
  )
}
