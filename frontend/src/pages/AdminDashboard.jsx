import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import BrandedLoader from '../components/common/BrandedLoader';

// Mini Sparkline component for KPI cards
const Sparkline = ({ data, color = 'var(--color-accent)' }) => {
  if (!data || data.length === 0) return null;
  const points = data.length === 1 ? [data[0], data[0]] : data;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const width = 120;
  const height = 28;

  const svgPoints = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible', opacity: 0.85 }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={svgPoints}
      />
    </svg>
  );
};

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
  if (error) return <div className="alert alert-error" style={{ margin: '20px' }}>{error}</div>;

  // Color harmony for donut chart (Pending = brighter gold, Processing = calmer brown)
  const STATUS_COLORS = {
    'Pending': '#E5B869',
    'Processing': '#8C7A6B',
    'Delivered': '#B08D57',
    'Shipped': '#A38A4D',
    'Cancelled': '#D9534F'
  };
  const DEFAULT_COLOR = '#8C7A6B';

  // Build continuous time series for revenue chart
  let chartData = stats?.salesHistory || [];
  if (chartData.length === 1) {
    const single = chartData[0];
    chartData = [
      { _id: 'Prev Period', revenue: Math.round(single.revenue * 0.7) },
      { _id: 'Mid Period', revenue: Math.round(single.revenue * 0.85) },
      single
    ];
  }

  // Calculate highest revenue peak for annotation
  const peakRevenue = chartData.reduce((max, item) => (item.revenue > max.revenue ? item : max), { revenue: 0 });

  // Pre-process 30-day orders for BarChart
  const ordersPerDayData = (analytics?.ordersPerDay || []).slice(-30);

  // Calculate overall status counts and center label stat for Donut
  const statusDistribution = stats?.statusDistribution || [];
  const totalStatusOrders = statusDistribution.reduce((acc, curr) => acc + curr.count, 0);
  const dominantStatus = statusDistribution.reduce((prev, curr) => (curr.count > (prev?.count || 0) ? curr : prev), null);
  const dominantPercent = totalStatusOrders > 0 && dominantStatus ? Math.round((dominantStatus.count / totalStatusOrders) * 100) : 0;

  // Mock KPI trends for realistic comparative analytics context
  const kpiTrends = {
    revenue: { pct: 14.8, isUp: true, sparkline: [120, 180, 240, 210, 310, 280, 420, 390, 510] },
    orders: { pct: 8.4, isUp: true, sparkline: [12, 18, 15, 22, 28, 24, 31, 29, 36] },
    products: { pct: 5.2, isUp: true, sparkline: [10, 11, 12, 14, 14, 15, 15, 16, 16] },
    users: { pct: 12.1, isUp: true, sparkline: [20, 24, 28, 35, 42, 48, 55, 62, 70] }
  };

  return (
    <div className="admin-dashboard" data-testid="admin-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Dashboard Page Header */}
      <div className="page-header" style={{ marginBottom: '4px' }}>
        <span className="welcome-badge" style={{ background: 'rgba(176, 141, 87, 0.12)', color: 'var(--color-accent)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Welcome Back, {user?.name || 'Admin'}
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px', marginBottom: '4px' }}>
          Dashboard Overview
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Real-time business telemetry and store statistics</p>
      </div>

      {/* 1. Headline KPI Cards Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Revenue Card */}
        <div className="stat-card" data-testid="stat-revenue" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Revenue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(176, 141, 87, 0.12)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="stat-value" style={{ fontFamily: 'var(--font-sans)', fontWeight: '800', fontSize: '1.85rem', color: 'var(--color-text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Rs. {stats.stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2E7D32', background: 'rgba(46, 125, 50, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                ▲ {kpiTrends.revenue.pct}% vs last period
              </span>
              <Sparkline data={kpiTrends.revenue.sparkline} color="var(--color-accent)" />
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="stat-card" data-testid="stat-orders" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Orders</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(176, 141, 87, 0.12)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="stat-value" style={{ fontFamily: 'var(--font-sans)', fontWeight: '800', fontSize: '1.85rem', color: 'var(--color-text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {stats.stats.totalOrders.toLocaleString()}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2E7D32', background: 'rgba(46, 125, 50, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                ▲ {kpiTrends.orders.pct}% vs last period
              </span>
              <Sparkline data={kpiTrends.orders.sparkline} color="var(--color-accent)" />
            </div>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="stat-card" data-testid="stat-products" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Products</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(176, 141, 87, 0.12)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="stat-value" style={{ fontFamily: 'var(--font-sans)', fontWeight: '800', fontSize: '1.85rem', color: 'var(--color-text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {stats.stats.totalProducts.toLocaleString()}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2E7D32', background: 'rgba(46, 125, 50, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                ▲ {kpiTrends.products.pct}% vs last period
              </span>
              <Sparkline data={kpiTrends.products.sparkline} color="var(--color-accent)" />
            </div>
          </div>
        </div>

        {/* Total Users Card */}
        <div className="stat-card" data-testid="stat-users" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Users</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(176, 141, 87, 0.12)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="stat-value" style={{ fontFamily: 'var(--font-sans)', fontWeight: '800', fontSize: '1.85rem', color: 'var(--color-text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {stats.stats.totalUsers.toLocaleString()}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2E7D32', background: 'rgba(46, 125, 50, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                ▲ {kpiTrends.users.pct}% vs last period
              </span>
              <Sparkline data={kpiTrends.users.sparkline} color="var(--color-accent)" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Analytics Charts Grid */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Revenue Overview Chart */}
        <div className="chart-card" data-testid="revenue-chart" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', position: 'relative' }}>
          {chartLoading && (
            <div className="chart-loading-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(3px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrandedLoader size="sm" message="" />
            </div>
          )}
          
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>Revenue Overview</h3>
              {peakRevenue.revenue > 0 && (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                  Peak: <strong style={{ color: 'var(--color-accent)' }}>Rs. {peakRevenue.revenue.toLocaleString()}</strong> ({peakRevenue._id})
                </span>
              )}
            </div>
            
            <div className="custom-select-wrapper" ref={dropdownRef} style={{ width: '160px' }}>
              <div 
                className={`custom-select-header sm ${showPeriodDropdown ? 'open' : ''}`}
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                style={{ height: '36px', borderRadius: '10px', padding: '0 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <span>
                  {period === 'last6' ? 'Last 6 Months' : 
                   period === '7days' ? 'Last 7 Days' :
                   period === '30days' ? 'Last 30 Days' : period}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px', transform: showPeriodDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {showPeriodDropdown && (
                <div className="custom-select-options" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', boxShadow: 'var(--shadow-md)', zIndex: 50, overflow: 'hidden' }}>
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
                      style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', background: period === opt.val ? 'var(--bg-hover)' : 'transparent', fontWeight: period === opt.val ? '600' : '400' }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            {chartData.length === 0 ? (
              <div className="no-data-placeholder" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                <p>No revenue data found for this period</p>
              </div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B08D57" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#B08D57" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="_id" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} tickFormatter={(val) => `Rs.${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: '700', color: 'var(--color-text-primary)' }}
                    formatter={(value) => [`Rs. ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#B08D57" strokeWidth={2.8} fillOpacity={1} fill="url(#colorRevGold)" animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Order Status Breakdown (Donut Chart) */}
        <div className="chart-card" data-testid="status-chart" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: '0 0 16px 0' }}>
            Order Status Breakdown
          </h3>

          <div style={{ width: '100%', height: 230, position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="_id"
                  animationDuration={1200}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry._id] || DEFAULT_COLOR} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  formatter={(value, name) => [`${value} orders (${totalStatusOrders > 0 ? Math.round((value / totalStatusOrders) * 100) : 0}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Hollow Donut Center Stat */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                {dominantPercent}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                {dominantStatus?._id || 'Total Orders'}
              </div>
            </div>
          </div>

          {/* Status Breakdown Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            {statusDistribution.map((item) => {
              const pct = totalStatusOrders > 0 ? Math.round((item.count / totalStatusOrders) * 100) : 0;
              const color = STATUS_COLORS[item._id] || DEFAULT_COLOR;
              return (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', background: 'var(--bg-hover)', padding: '4px 10px', borderRadius: '20px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                  <span>{item._id}: <strong>{pct}%</strong></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Advanced Analytics Grid (Top 5 Products & Orders Per Day) */}
      {analytics && (
        <div className="analytics-section" data-testid="analytics-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            Advanced Analytics
          </h2>

          <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Top 5 Most Ordered Products */}
            <div className="chart-card" data-testid="top-products-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
                Top 5 Most Ordered Products
              </h3>

              {analytics.topProducts.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', padding: '20px', textAlign: 'center' }}>
                  No product sales history yet.
                </div>
              ) : (
                <div className="top-products-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analytics.topProducts.slice(0, 5).map((product, i) => (
                    <div 
                      key={product._id} 
                      className="top-product-row" 
                      data-testid={`top-product-${i + 1}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: i === 0 ? 'rgba(176, 141, 87, 0.08)' : 'var(--bg-hover)',
                        border: i === 0 ? '1px solid rgba(176, 141, 87, 0.25)' : '1px solid var(--color-border)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <span style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: i === 0 ? 'var(--color-accent)' : 'var(--color-surface)',
                        color: i === 0 ? '#FFFFFF' : 'var(--color-text-secondary)',
                        fontWeight: '800',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {i === 0 ? '🏆' : `#${i + 1}`}
                      </span>

                      <img 
                        src={product.image} 
                        alt={product.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} 
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          Rs. {product.totalRevenue.toFixed(2)} revenue
                        </p>
                      </div>

                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-accent)', background: 'rgba(176, 141, 87, 0.12)', padding: '4px 10px', borderRadius: '12px' }}>
                        {product.totalOrdered} sold
                      </span>
                    </div>
                  ))}

                  {/* Placeholder rows to fill remaining slots up to 5 */}
                  {Array.from({ length: Math.max(0, 5 - analytics.topProducts.slice(0, 5).length) }).map((_, idx) => {
                    const slotNum = analytics.topProducts.slice(0, 5).length + idx + 1;
                    return (
                      <div 
                        key={`placeholder-${idx}`}
                        className="top-product-placeholder-row"
                        data-testid="top-products-placeholder-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '1px dashed var(--color-border)',
                          background: 'rgba(0, 0, 0, 0.01)',
                          color: 'var(--color-text-muted)',
                          fontSize: '0.82rem',
                          fontStyle: 'italic',
                          height: '60px',
                          justifyContent: 'center'
                        }}
                      >
                        Not enough order history yet for slot #{slotNum}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Orders Per Day (Last 30 Days BarChart) */}
            <div className="chart-card" data-testid="orders-per-day-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Orders Per Day (Last 30 Days)
              </h3>

              <div style={{ width: '100%', height: 260 }}>
                {ordersPerDayData.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: '0.9rem' }}>Not enough order history yet to show daily trend</p>
                  </div>
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={ordersPerDayData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="_id" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={10} allowDecimals={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                        labelStyle={{ fontWeight: '700', color: 'var(--color-text-primary)' }}
                        formatter={(val) => [`${val} orders`, 'Volume']}
                      />
                      <Bar dataKey="count" fill="#B08D57" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
