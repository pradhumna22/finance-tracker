export default function HealthScore({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'
  const label = score >= 70 ? 'Healthy' : score >= 40 ? 'Moderate' : 'Needs Work'

  return (
    <div className="flex flex-col items-center">
      <div className={`text-6xl font-bold ${color}`}>{score}</div>
      <div className="text-gray-400 text-sm mt-1">Financial Health Score</div>
      <div className={`text-xs font-medium mt-1 ${color}`}>{label}</div>
    </div>
  )
}
