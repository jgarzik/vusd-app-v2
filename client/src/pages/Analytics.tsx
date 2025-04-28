/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * Analytics.tsx - Dashboard for VUSD treasury analytics
 * 
 * This page provides comprehensive visualizations and data insights for the VUSD treasury.
 * Key features:
 * - Treasury composition breakdown (T1 and T2 assets)
 * - Collateralization ratio monitoring
 * - Detailed asset listings with real-time values
 * - Interactive visualizations using recharts
 * 
 * The analytics are designed to provide transparency about the backing assets of VUSD,
 * showing how the stablecoin maintains its peg through a diversified portfolio of assets.
 * T1 assets (stablecoins) are shown separately from T2 assets (stETH, LP tokens) to clearly
 * communicate the risk profile of the treasury.
 */

import TreasuryCard from "@/components/analytics/TreasuryCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTreasury } from "@/hooks/useTreasury";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

/**
 * Analytics component for visualizing VUSD treasury data.
 * 
 * @returns {JSX.Element} The Analytics page component
 * 
 * @remarks
 * This component provides a comprehensive dashboard for VUSD treasury analytics including:
 * - Key metrics: Treasury value, circulating supply, and collateralization ratio
 * - Visual breakdowns of treasury composition through interactive charts
 * - Detailed listings of both T1 assets (whitelisted stablecoins) and T2 assets (other)
 * 
 * The visualizations use a consistent color scheme to differentiate between asset types:
 * - Blue gradient for T1 assets (whitelisted stablecoins)
 * - Green gradient for T2 assets (other treasury holdings)
 * 
 * All monetary values are formatted consistently using the formatCurrency utility.
 */
const Analytics = () => {
  const { treasuryData, loading } = useTreasury();
  
  // Color constants for consistent visual styling
  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6366F1'];
  const T1_COLOR = '#3B82F6';
  const T2_COLOR = '#10B981';
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-6">VUSD Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-400">Treasury Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? "Loading..." : formatCurrency(treasuryData.totalValue)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-400">Circulating Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? "Loading..." : formatCurrency(treasuryData.circulatingSupply)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-400">Collateralization Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? "Loading..." : `${(treasuryData.collateralizationRatio * 100).toFixed(2)}%`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Full-width Treasury Composition Card with horizontal layout */}
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Treasury Composition</CardTitle>
          <CardDescription>Distribution of assets in the VUSD treasury</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 bg-background-light">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">T1 (Whitelisted Stablecoins)</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">{formatCurrency(treasuryData.t1Value)}</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 bg-background-light">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">T2 (Other Assets)</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">{formatCurrency(treasuryData.t2Value)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 bg-background-light">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-medium">Excess Value</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium text-green-500">+{formatCurrency(treasuryData.excessValue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {loading ? (
            <div className="h-[350px] flex items-center justify-center">Loading...</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 mb-2">
              {/* Left side: Main Treasury Composition Pie Chart (T1 assets individually + T2 as a single slice) */}
              <div className="flex-1 relative">
                <div className="text-base font-semibold mb-2 text-center bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Complete Treasury Composition</div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        ...treasuryData.t1Assets.map(asset => ({
                          name: asset.symbol,
                          value: asset.value,
                          symbol: asset.symbol,
                          isT1: true
                        })),
                        { 
                          name: 'T2 Assets', 
                          value: treasuryData.t2Value, 
                          symbol: 'T2 Assets',
                          isT2: true 
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={110}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => entry.symbol}
                      paddingAngle={2}
                    >
                      {/* T1 Assets get blue colors with different shades */}
                      {treasuryData.t1Assets.map((_, index) => (
                        <Cell 
                          key={`t1-cell-${index}`} 
                          fill={`hsl(210, 100%, ${55 + (index * 10)}%)`} 
                          stroke="#131720"
                          strokeWidth={1}
                        />
                      ))}
                      {/* T2 Assets get a distinct green color */}
                      <Cell 
                        key="t2-cell" 
                        fill={T2_COLOR} 
                        stroke="#131720"
                        strokeWidth={1}
                      />
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: 10 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Center: Visual Connection between charts (horizontal now) */}
              <div className="hidden md:flex flex-col justify-center items-center w-20 mx-2 relative">
                {/* Horizontal connecting line with animated gradient */}
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer"></div>
                
                {/* Circle in the middle of the line */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-background-card rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_10px_rgba(5,150,105,0.3)]">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full"></div>
                </div>
                
                {/* Arrow at the right side */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-emerald-500 drop-shadow-[0_0_3px_rgba(5,150,105,0.5)]" />
                </div>
                
                {/* No text label anymore */}
              </div>
              
              {/* Mobile only connector (vertical) */}
              <div className="flex md:hidden justify-center items-center h-16 relative my-2">
                <div className="h-full w-0.5 bg-gradient-to-b from-blue-600 via-teal-500 to-green-600 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer"></div>
                <div className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-background-card rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_10px_rgba(5,150,105,0.3)]">
                  <div className="w-3.5 h-3.5 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full"></div>
                </div>
                <div className="absolute bottom-0 -translate-y-1/2">
                  <ArrowRight className="h-5 w-5 text-emerald-500 transform -rotate-90 drop-shadow-[0_0_3px_rgba(5,150,105,0.5)]" />
                </div>
              </div>
              
              {/* Right side: T2 Assets Detail Pie Chart */}
              <div className="flex-1">
                <div className="text-base font-semibold mb-2 text-center bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">T2 Assets Breakdown</div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={treasuryData.t2Assets}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={110}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="symbol"
                      label={(entry) => entry.symbol}
                      paddingAngle={3}
                    >
                      {treasuryData.t2Assets.map((entry, index) => (
                        <Cell 
                          key={`t2-cell-${index}`} 
                          fill={`hsl(${140 + (index * 30)}, 80%, 45%)`}
                          stroke="#131720"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: 10 }}
                      formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid for other cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Treasury Assets Detail</CardTitle>
            <CardDescription>Whitelisted and non-whitelisted assets in the treasury</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-blue-500 font-medium mb-2">T1 Assets (Whitelisted Stablecoins)</h3>
                <div className="space-y-2">
                  {treasuryData.t1Assets.map((asset) => (
                    <div key={asset.symbol} className="flex justify-between items-center p-2 bg-background-light rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center bg-blue-900 text-xs`}>
                          {asset.symbol.substring(0, 1)}
                        </div>
                        <span>{asset.name}</span>
                      </div>
                      <div>{formatCurrency(asset.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm text-purple-500 font-medium mb-2">T2 Assets (Non-whitelisted)</h3>
                <div className="space-y-2">
                  {treasuryData.t2Assets.map((asset) => (
                    <div key={asset.symbol} className="flex justify-between items-center p-2 bg-background-light rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center bg-purple-900 text-xs`}>
                          {asset.symbol.substring(0, 1)}
                        </div>
                        <span>{asset.name}</span>
                      </div>
                      <div>{formatCurrency(asset.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
