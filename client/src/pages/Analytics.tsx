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
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={treasuryData.assets}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="symbol"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {treasuryData.assets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <TreasuryCard />
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
