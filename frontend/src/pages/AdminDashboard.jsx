import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import BrandedLoader from '../components/common/BrandedLoader';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('last6');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPeriodDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial Fetch (Stats, Default Chart & Analytics)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [dashRes, analyticsRes] = await Promise.all([
          api.get(`/admin/dashboard?period=${period}`),
          api.get('/admin/analytics'),
        ]);
        setStats(dashRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter-based Fetch (Chart only)
  useEffect(() => {
    // Skip if it's the initial period or still loading the whole page
    if (loading || period === 'last6') return;

    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const { data } = await api.get(`/admin/dashboard?period=${period}`);
        setStats(prev => ({
          ...prev,
          salesHistory: data.salesHistory
        }));
      } catch (err) {
        console.error('Failed to load chart data');
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, [period]);

  if (loading) return <BrandedLoader fullPage message="Summarizing Store Stats..." />;
  if (error) return <div className="error-message">{error}</div>;

  const STATUS_COLORS = {
    'Pending': '#f59e0b',
    'Processing': '#3b82f6',
    'Shipped': '#6366f1',
    'Delivered': '#10b981',
    'Cancelled': '#ef4444'
  };

  const DEFAULT_COLOR = '#94a3b8';

  // Pad data if only 1 point exists to make it look like a real graph
  const chartData = stats.salesHistory.length === 1 
    ? [{ _id: 'Start', revenue: 0 }, ...stats.salesHistory]
    : stats.salesHistory;

  return (
    <div className="admin-dashboard" data-testid="admin-dashboard">
      <div className="page-header">
        <div className="welcome-badge">Welcome Back, {user?.name || 'Admin'}</div>
        <h1>Dashboard Overview</h1>
        <p>Real-time statistics and system performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" data-testid="stat-revenue">
          <div className="stat-header">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <h2 className="stat-value">${stats.stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        <div className="stat-card" data-testid="stat-orders">
          <div className="stat-header">
            <div className="stat-label">Total Orders</div>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
          </div>
          <h2 className="stat-value">{stats.stats.totalOrders.toLocaleString()}</h2>
        </div>

        <div className="stat-card" data-testid="stat-products">
          <div className="stat-header">
            <div className="stat-label">Total Products</div>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          </div>
          <h2 className="stat-value">{stats.stats.totalProducts.toLocaleString()}</h2>
        </div>

        <div className="stat-card" data-testid="stat-users">
          <div className="stat-header">
            <div className="stat-label">Total Users</div>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <h2 className="stat-value">{stats.stats.totalUsers.toLocaleString()}</h2>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card" data-testid="revenue-chart">
          {chartLoading && (
            <div className="chart-loading-overlay">
              <BrandedLoader size="sm" message="" />
            </div>
          )}
          
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Revenue Overview</h3>
            
            <div className="custom-select-wrapper" ref={dropdownRef} style={{ width: '180px' }}>
              <div 
                className={`custom-select-header sm ${showPeriodDropdown ? 'open' : ''}`}
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              >
                <span>
                  {period === 'last6' ? 'Last 6 Months' : 
                   period === '7days' ? 'Last 7 Days' :
                   period === '30days' ? 'Last 30 Days' : period}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', transform: showPeriodDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {showPeriodDropdown && (
                <div className="custom-select-options">
                  {[
                    { val: '7days', label: 'Last 7 Days' },
                    { val: '30days', label: 'Last 30 Days' },
                    { val: 'last6', label: 'Last 6 Months' },
                    { val: '2026', label: '2026' },
                    { val: '2025', label: '2025' }
                  ].map((opt) => (
                    <div 
                      key={opt.val}
                      className={`custom-select-option ${period === opt.val ? 'selected' : ''}`}
                      onClick={() => { setPeriod(opt.val); setShowPeriodDropdown(false); }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ width: '100%', height: 300, position: 'relative' }}>
            {chartData.length === 0 ? (
              <div className="no-data-placeholder" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.5 }}>📉</div>
                <p>No revenue data found for this period</p>
                <p style={{ fontSize: '0.8rem' }}>Try selecting a different date range</p>
              </div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="_id" stroke="var(--text-secondary)" fontSize={12} tickMargin={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--primary-light)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="chart-card" data-testid="status-chart">
          <h3>Order Status breakdown</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                  label={({ _id, count }) => `${_id}: ${count}`}
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry._id] || DEFAULT_COLOR} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Analytics Section ── */}
      {analytics && (
        <div className="analytics-section" data-testid="analytics-section">
          <h2 className="analytics-section-title">Advanced Analytics</h2>

          <div className="analytics-grid">
            {/* Top 5 Most Ordered Products */}
            <div className="chart-card" data-testid="top-products-card">
              <h3>🏆 Top 5 Most Ordered Products</h3>
              {analytics.topProducts.length === 0 ? (
                <div className="empty-state-sm">No order data yet.</div>
              ) : (
                <div className="top-products-list">
                  {analytics.topProducts.map((product, i) => (
                    <div key={product._id} className="top-product-row" data-testid={`top-product-${i + 1}`}>
                      <span className="top-product-rank">#{i + 1}</span>
                      <img src={product.image} alt={product.name} className="top-product-img" />
                      <div className="top-product-info">
                        <p className="top-product-name">{product.name}</p>
                        <p className="top-product-meta">${product.totalRevenue.toFixed(2)} revenue</p>
                      </div>
                      <div className="top-product-badge">{product.totalOrdered} sold</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders Per Day */}
            <div className="chart-card" data-testid="orders-per-day-card">
              <h3>📅 Orders Per Day (Last 30 Days)</h3>
              {analytics.ordersPerDay.length === 0 ? (
                <div className="empty-state-sm">No orders in the last 30 days.</div>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <AreaChart data={analytics.ordersPerDay}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="_id" stroke="var(--text-secondary)" fontSize={10} tickMargin={8} />
                      <YAxis stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--secondary)' }}
                        formatter={(v) => [v, 'Orders']}
                      />
                      <Area type="monotone" dataKey="count" stroke="var(--secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
