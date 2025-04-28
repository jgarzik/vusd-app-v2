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

const Analytics = () => {
  const { treasuryData, loading } = useTreasury();
  
  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6366F1'];
  
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Treasury Composition</CardTitle>
            <CardDescription>Distribution of assets in the VUSD treasury</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-300">T1 (Whitelisted Stablecoins)</div>
                <div className="text-sm font-medium">{formatCurrency(treasuryData.t1Value)}</div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-300">T2 (Other Assets)</div>
                <div className="text-sm font-medium">{formatCurrency(treasuryData.t2Value)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-300">Excess Value</div>
                <div className="text-sm font-medium text-green-500">+{formatCurrency(treasuryData.excessValue)}</div>
              </div>
            </div>
            
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[...treasuryData.t1Assets, ...treasuryData.t2Assets]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="symbol"
                    // Remove the on-chart labels to prevent overlapping
                    label={false}
                  >
                    {[...treasuryData.t1Assets, ...treasuryData.t2Assets].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    wrapperStyle={{ paddingTop: 20 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
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
      
      <Card>
        <CardHeader>
          <CardTitle>VUSD Activity</CardTitle>
          <CardDescription>Minting and redemption volume over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="mt-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Mon', mint: 120000, redeem: 80000 },
                    { name: 'Tue', mint: 145000, redeem: 100000 },
                    { name: 'Wed', mint: 260000, redeem: 120000 },
                    { name: 'Thu', mint: 320000, redeem: 190000 },
                    { name: 'Fri', mint: 280000, redeem: 220000 },
                    { name: 'Sat', mint: 150000, redeem: 100000 },
                    { name: 'Sun', mint: 90000, redeem: 50000 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="mint" name="Minted" fill="#3B82F6" />
                  <Bar dataKey="redeem" name="Redeemed" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Week 1', mint: 800000, redeem: 500000 },
                    { name: 'Week 2', mint: 1200000, redeem: 780000 },
                    { name: 'Week 3', mint: 980000, redeem: 850000 },
                    { name: 'Week 4', mint: 1500000, redeem: 1100000 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="mint" name="Minted" fill="#3B82F6" />
                  <Bar dataKey="redeem" name="Redeemed" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="yearly" className="mt-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Jan', mint: 3500000, redeem: 2800000 },
                    { name: 'Feb', mint: 4200000, redeem: 3100000 },
                    { name: 'Mar', mint: 5100000, redeem: 3800000 },
                    { name: 'Apr', mint: 4800000, redeem: 4200000 },
                    { name: 'May', mint: 6500000, redeem: 5100000 },
                    { name: 'Jun', mint: 7800000, redeem: 6300000 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="mint" name="Minted" fill="#3B82F6" />
                  <Bar dataKey="redeem" name="Redeemed" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
