'use client'

import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// Sample data for the chart
const chartData = [
  { year: '2016', value: 5000 },
  { year: '2017', value: 15000 },
  { year: '2018', value: 35000 },
  { year: '2019', value: 50000 },
  { year: '2020', value: 8000 },
  { year: '2021', value: 12000 },
  { year: '2022', value: 45000 },
  { year: '2023', value: 95000 },
]

const paymentData = [
  { name: 'QR Code', value: 25, color: '#ffc0cb' },
  { name: 'Dinheiro', value: 15, color: '#bfdbfe' },
  { name: 'Fiado', value: 45, color: '#fef3c7' },
  { name: 'Débito', value: 15, color: '#a7f3d0' },
]

const topProducts = [
  { name: 'Beijinho - GROWTH', percentage: 100 },
  { name: 'PANIC 150g - ADAPTOGEN', percentage: 85 },
  { name: 'FEMINI WHEY goog - MAX', percentage: 75 },
  { name: 'Beijinho - GROWTH', percentage: 65 },
  { name: 'Beijinho - GROWTH', percentage: 55 },
]

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <main className="ml-48 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Home</h1>
          <button className="px-6 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100 transition-colors">
            Informações
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Daily Sales Card */}
          <Card className="border-2 border-emerald-400">
            <CardHeader>
              <CardTitle className="text-center text-gray-700 font-normal text-base">
                Valor de Vendas Diárias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-500 mb-1">R$ 19.000,00</p>
                <p className="text-xs text-gray-500 mb-6">Total de Vendas diárias</p>
                
                <div className="flex justify-around pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantidade vendas</p>
                    <p className="text-2xl font-semibold text-gray-800">15.000</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
                    <p className="text-2xl font-semibold text-emerald-500">R$ 8.300,00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Sales Card */}
          <Card className="border-2 border-emerald-400">
            <CardHeader>
              <CardTitle className="text-center text-gray-700 font-normal text-base">
                Valor de Vendas do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-500 mb-1">R$ 56.000,00</p>
                <p className="text-xs text-gray-500 mb-6">Total de Vendas diárias</p>
                
                <div className="flex justify-around pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total deste Mês</p>
                    <p className="text-2xl font-semibold text-emerald-500">R$ 38.500,00</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
                    <p className="text-2xl font-semibold text-emerald-500">R$ 8.300,00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <ChartContainer
              config={{
                value: {
                  label: 'Vendas',
                  color: 'hsl(142.1 76.2% 36.3%)',
                },
              }}
              className="h-[400px]"
            >
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142.1 70.6% 45.3%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(142.1 70.6% 45.3%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Area
                  dataKey="value"
                  type="monotone"
                  fill="url(#fillValue)"
                  fillOpacity={0.4}
                  stroke="hsl(142.1 70.6% 45.3%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Payment Methods Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Vendas por Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ChartContainer
                config={{
                  qrcode: { label: 'QR Code', color: '#ffc0cb' },
                  dinheiro: { label: 'Dinheiro', color: '#bfdbfe' },
                  fiado: { label: 'Fiado', color: '#fef3c7' },
                  debito: { label: 'Débito', color: '#a7f3d0' },
                }}
                className="h-[280px] w-full"
              >
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                {paymentData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                5 Produtos mais vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topProducts.map((product, index) => (
                  <div key={index}>
                    <p className="text-sm text-gray-700 mb-2">{product.name}</p>
                    <div className="relative w-full h-4 bg-rose-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${product.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
