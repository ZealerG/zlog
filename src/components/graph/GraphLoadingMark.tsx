type GraphLoadingMarkProps = {
  label?: string
}

export function GraphLoadingMark({
  label = "正在加载文章关系图谱",
}: GraphLoadingMarkProps) {
  return (
    <span className="graph-loading-mark" role="status">
      <span className="graph-loading-cluster" aria-hidden>
        <span className="graph-loading-edge graph-loading-edge-a" />
        <span className="graph-loading-edge graph-loading-edge-b" />
        <span className="graph-loading-edge graph-loading-edge-c" />
        <span className="graph-loading-node graph-loading-node-a" />
        <span className="graph-loading-node graph-loading-node-b" />
        <span className="graph-loading-node graph-loading-node-c" />
        <span className="graph-loading-node graph-loading-node-d" />
      </span>
      <span className="sr-only">{label}</span>
    </span>
  )
}
