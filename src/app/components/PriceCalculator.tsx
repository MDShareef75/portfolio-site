import { useState } from 'react';

const PROJECT_TIERS = {
  'Web Development': [
    { label: 'Basic Portfolio / Informational', min: 2500, max: 12500 },
    { label: 'Small Business Website', min: 12500, max: 50000 },
    { label: 'Custom Web App (React/Next.js)', min: 50000, max: 150000 },
    { label: 'E-commerce Website (WooCommerce)', min: 37500, max: 100000 },
    { label: 'Enterprise Web Platform', min: 75000, max: 375000 },
  ],
  'Mobile App Development': [
    { label: 'Simple App (MVP)', min: 50000, max: 125000 },
    { label: 'Medium Complexity App', min: 125000, max: 312500 },
    { label: 'Complex App', min: 312500, max: 937500 },
    { label: 'Cross-platform (Flutter)', min: 35000, max: 90000, note: '20–30% cheaper than native' },
  ],
  'E-commerce Solutions': [
    { label: 'Shopify Basic Setup', min: 7500, max: 25000 },
    { label: 'WooCommerce Site', min: 25000, max: 75000 },
    { label: 'Custom E-commerce App', min: 75000, max: 250000 },
    { label: 'Enterprise E-commerce', min: 250000, max: 1250000 },
  ],
  'Freelance Packages': [
    { label: 'Starter', min: 3750, max: 7500, note: 'Static site or basic app' },
    { label: 'Growth', min: 12500, max: 37500, note: 'Dynamic site or MVP app' },
    { label: 'Premium', min: 50000, max: 200000, note: 'Full-stack app with backend, analytics, integrations' },
  ],
} as const;

type ProjectType = keyof typeof PROJECT_TIERS;
type Tier = (typeof PROJECT_TIERS)[ProjectType][number];

const PROJECT_TYPES = Object.keys(PROJECT_TIERS) as ProjectType[];

const FEATURES = [
  { label: 'User Authentication', price: 5000 },
  { label: 'Payment Integration', price: 8000 },
  { label: 'Admin Dashboard', price: 10000 },
  { label: 'Push Notifications', price: 6000 },
  { label: 'API Integration', price: 7000 },
  { label: 'Chat/Support', price: 4000 },
  { label: 'Analytics/Reports', price: 5000 },
  { label: 'SEO Optimization', price: 3000 },
  { label: 'Custom Design', price: 7000 },
];

const DELIVERY_OPTIONS = [
  { label: '1 week (rush)', multiplier: 1.5 },
  { label: '2 weeks', multiplier: 1.2 },
  { label: '1 month', multiplier: 1 },
  { label: '2+ months', multiplier: 0.9 },
];

export default function PriceCalculator() {
  const [budget, setBudget] = useState('');
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[2].label);
  const [projectType, setProjectType] = useState<ProjectType>(PROJECT_TYPES[0]);
  const [tier, setTier] = useState<string>(PROJECT_TIERS[PROJECT_TYPES[0]][0].label);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [email, setEmail] = useState('');
  const [mailStatus, setMailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mailMsg, setMailMsg] = useState('');

  const handleFeatureChange = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  // Update tier when projectType changes
  const tiers = PROJECT_TIERS[projectType];
  const selectedTier = tiers.find((t) => t.label === tier) || tiers[0];

  // Calculate min/max base
  const featuresTotal = FEATURES.filter((f) => selectedFeatures.includes(f.label)).reduce((sum, f) => sum + f.price, 0);
  const deliveryMultiplier = DELIVERY_OPTIONS.find((d) => d.label === delivery)?.multiplier || 1;
  const minPrice = Math.round((selectedTier.min + featuresTotal) * deliveryMultiplier);
  const maxPrice = Math.round((selectedTier.max + featuresTotal) * deliveryMultiplier);

  return (
    <div className="bg-[#112240]/80 rounded-2xl p-8 my-16 max-w-2xl mx-auto shadow-lg border border-[#233554]">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">Project Price Calculator</h2>
      <form
        onSubmit={async e => {
          e.preventDefault();
          setShowBreakdown(true);
          setMailStatus('idle');
          setMailMsg('');
          // Send mail
          try {
            const res = await fetch('/api/price-calc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                budget,
                delivery,
                projectType,
                tier,
                features: selectedFeatures,
                minPrice,
                maxPrice,
              }),
            });
            const data = await res.json();
            if (res.ok) {
              setMailStatus('success');
              setMailMsg('Thank you! Your request has been sent.');
            } else {
              setMailStatus('error');
              setMailMsg(data.error || 'Failed to send mail.');
            }
          } catch (err) {
            setMailStatus('error');
            setMailMsg('Failed to send mail.');
          }
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-[#64ffda] mb-2">Your Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#233554]/50 border border-[#64ffda]/20 text-white focus:ring-2 focus:ring-[#64ffda] focus:border-transparent"
            placeholder="your@email.com"
            required
          />
        </div>
        <div>
          <label className="block text-[#64ffda] mb-2">Your Budget (₹)</label>
          <input
            type="number"
            min="0"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#233554]/50 border border-[#64ffda]/20 text-white focus:ring-2 focus:ring-[#64ffda] focus:border-transparent"
            placeholder="Enter your budget"
            required
          />
        </div>
        <div>
          <label className="block text-[#64ffda] mb-2">Delivery Time</label>
          <select
            value={delivery}
            onChange={e => setDelivery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#233554]/50 border border-[#64ffda]/20 text-white focus:ring-2 focus:ring-[#64ffda] focus:border-transparent"
          >
            {DELIVERY_OPTIONS.map(opt => (
              <option key={opt.label} value={opt.label}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[#64ffda] mb-2">Type of Project</label>
          <select
            value={projectType}
            onChange={e => {
              setProjectType(e.target.value as ProjectType);
              setTier(PROJECT_TIERS[e.target.value as ProjectType][0].label);
            }}
            className="w-full px-4 py-2 rounded-lg bg-[#233554]/50 border border-[#64ffda]/20 text-white focus:ring-2 focus:ring-[#64ffda] focus:border-transparent"
          >
            {PROJECT_TYPES.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[#64ffda] mb-2">Project Tier</label>
          <select
            value={tier}
            onChange={e => setTier(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#233554]/50 border border-[#64ffda]/20 text-white focus:ring-2 focus:ring-[#64ffda] focus:border-transparent"
          >
            {tiers.map((opt) => (
              <option key={opt.label} value={opt.label}>{opt.label}{'note' in opt && opt.note ? ` (${opt.note})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[#64ffda] mb-2">Features</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FEATURES.map(f => (
              <label key={f.label} className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(f.label)}
                  onChange={() => handleFeatureChange(f.label)}
                  className="accent-[#64ffda]"
                />
                <span>{f.label} <span className="text-xs text-[#64ffda]">(+₹{f.price.toLocaleString()})</span></span>
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#64ffda] to-blue-400 text-[#0a192f] hover:from-blue-400 hover:to-[#64ffda] transition-all duration-500 py-3 rounded-lg font-medium transform hover:scale-[1.02]"
        >
          Calculate Price
        </button>
      </form>
      {showBreakdown && (
        <div className="mt-8 bg-[#0a192f]/70 p-6 rounded-xl border border-[#233554]">
          <h3 className="text-xl font-bold mb-4 text-[#64ffda]">Detailed Price Breakdown</h3>
          <ul className="mb-4 text-gray-300">
            <li><strong>Base Price ({tier}):</strong> ₹{selectedTier.min.toLocaleString()} – ₹{selectedTier.max.toLocaleString()}</li>
            {selectedFeatures.length > 0 && (
              <li><strong>Features:</strong>
                <ul className="ml-4 list-disc">
                  {FEATURES.filter(f => selectedFeatures.includes(f.label)).map(f => (
                    <li key={f.label}>{f.label}: ₹{f.price.toLocaleString()}</li>
                  ))}
                </ul>
              </li>
            )}
            <li><strong>Delivery Time:</strong> {delivery} (x{deliveryMultiplier})</li>
          </ul>
          <div className="text-lg font-bold text-white mb-2">Estimated Price Range: <span className="text-[#64ffda]">₹{minPrice.toLocaleString()} – ₹{maxPrice.toLocaleString()}</span></div>
          {budget && (
            <div className={maxPrice > Number(budget) ? 'text-red-400' : 'text-green-400'}>
              {maxPrice > Number(budget)
                ? 'Estimated price may exceed your budget.'
                : 'Estimated price is within your budget!'}
            </div>
          )}
          {mailStatus === 'success' && <div className="mt-4 text-green-400 font-semibold">{mailMsg}</div>}
          {mailStatus === 'error' && <div className="mt-4 text-red-400 font-semibold">{mailMsg}</div>}
          <button
            className="mt-4 px-6 py-2 bg-[#64ffda] text-[#0a192f] rounded-lg font-semibold hover:bg-blue-400 transition-all"
            onClick={() => { setShowBreakdown(false); setMailStatus('idle'); setMailMsg(''); }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
} 