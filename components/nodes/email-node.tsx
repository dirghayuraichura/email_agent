import { Handle, Position } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EmailNode() {
  return (
    <Card className="w-[200px]">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Email</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </CardContent>
    </Card>
  )
} 