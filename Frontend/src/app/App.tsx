import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { InputForm } from "@/app/components/InputForm";
import { ResultsSection } from "@/app/components/ResultsSection";
import { SchemesRecommendation } from "@/app/components/SchemesRecommendation";
import { WeatherDashboard } from "@/app/components/WeatherDashboard";
import { DiseaseDetection } from "@/app/components/DiseaseDetection";
import ChatWidget from "@/app/components/ChatWidget";
import { Sprout, Wheat, ShieldAlert, Globe, CloudSun, Stethoscope, Loader2 } from "lucide-react";
import { getPrediction, type PredictionResponse, type PredictionInput } from "@/app/services/api";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "as", label: "অসমীয়া" },
  { code: "bn", label: "বাংলা" },
  { code: "brx", label: "बड़ो" },
  { code: "doi", label: "डोगरी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ks", label: "कॉशुर" },
  { code: "gom", label: "कोंकणी" },
  { code: "mai", label: "मैथिली" },
  { code: "ml", label: "മലയാളം" },
  { code: "mni", label: "মৈতৈলোন্" },
  { code: "mr", label: "मराठी" },
  { code: "ne", label: "नेपाली" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "sa", label: "संस्कृतम्" },
  { code: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "sd", label: "سنڌي" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "ur", label: "اردو" },
];

function AILoadingSequence() {
  const [step, setStep] = useState(0);
  
  const steps = [
    "Analyzing Nitrogen, Phosphorus, Potassium levels...",
    "Fetching live geospatial weather data...",
    "Cross-referencing historical market demand...",
    "Running Random Forest ML prediction model...",
    "Match found! Generating advisory..."
  ];

  useEffect(() => {
    if (step < steps.length - 1) {
      const timer = setTimeout(() => {
        setStep(s => s + 1);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="agri-card p-8 md:p-12 flex flex-col justify-center animate-fade-in relative overflow-hidden min-h-[300px]">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, var(--color-ink) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="relative z-10 w-full max-w-md mx-auto space-y-5">
        {steps.map((text, i) => (
          <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${i === step ? 'opacity-100 translate-x-0' : i < step ? 'opacity-40 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            {i < step ? (
              <div className="w-6 h-6 rounded-full bg-[var(--color-green-deep)] flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            ) : i === step ? (
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-mustard)] flex-shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-[var(--color-border-line)] flex-shrink-0" />
            )}
            <p className={`text-sm md:text-base ${i === step ? 'font-bold text-[var(--color-ink)]' : 'text-[var(--color-ink-soft)]'}`}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'crop' | 'schemes' | 'weather' | 'disease'>('crop');
  const [results, setResults] = useState<PredictionResponse | null>(null);
  const [lastInput, setLastInput] = useState<PredictionInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);

    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const input: PredictionInput = {
      N: parseFloat(fd.get('nitrogen') as string),
      P: parseFloat(fd.get('phosphorus') as string),
      K: parseFloat(fd.get('potassium') as string),
      temperature: parseFloat(fd.get('temperature') as string),
      humidity: parseFloat(fd.get('humidity') as string),
      ph: parseFloat(fd.get('ph') as string),
      rainfall: parseFloat(fd.get('rainfall') as string),
    };
    setLastInput(input);

    try {
      const response = await getPrediction(input);
      if (response && response.top_1 && response.top_3) {
        setResults(response);
      } else {
        throw new Error('Invalid response structure from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.generic');
      setError(errorMessage);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 bg-[var(--color-paper)]/90 backdrop-blur-md border-b border-[var(--color-border-line)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-agri-green-deep)] flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-none text-[var(--color-ink)]" style={{fontFamily: 'var(--font-display)'}}>AgriMitra</span>
                <span className="text-[10px] text-[var(--color-ink-soft)] font-medium uppercase tracking-widest mt-0.5">Kisan Support</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => setActiveTab('crop')} className={`text-sm font-medium transition-colors ${activeTab === 'crop' ? 'text-[var(--color-agri-green-deep)]' : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'}`}>{t("tabs.cropRecommendation")}</button>
              <button onClick={() => setActiveTab('schemes')} className={`text-sm font-medium transition-colors ${activeTab === 'schemes' ? 'text-[var(--color-agri-green-deep)]' : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'}`}>{t("tabs.governmentSchemes")}</button>
              <button onClick={() => setActiveTab('weather')} className={`text-sm font-medium transition-colors ${activeTab === 'weather' ? 'text-[var(--color-agri-green-deep)]' : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'}`}>{t("tabs.weather")}</button>
              <button onClick={() => setActiveTab('disease')} className={`text-sm font-medium transition-colors ${activeTab === 'disease' ? 'text-[var(--color-agri-green-deep)]' : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'}`}>Disease AI</button>
            </nav>

            <div className="flex items-center gap-4">
               <select
                 value={i18n.language}
                 onChange={(e) => i18n.changeLanguage(e.target.value)}
                 className="bg-transparent text-[var(--color-ink)] text-sm font-medium cursor-pointer outline-none"
                 aria-label={t("nav.language")}
               >
                 {LANGUAGES.map((lang) => (
                   <option key={lang.code} value={lang.code}>{lang.label}</option>
                 ))}
               </select>
               <button className="btn-primary hidden sm:flex px-4 py-2 text-sm" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Analyze Soil</button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="container mx-auto px-4 py-12 max-w-6xl w-full">
        {activeTab === 'crop' ? (
          <div className="space-y-24 animate-fade-in-up">
            
            {/* ── Hero Section ── */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              <div className="lg:col-span-5 space-y-6">
                <span className="eyebrow">Smart Advisory System</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl text-[var(--color-ink)] leading-tight">
                  Grow the <i>right</i> crop for your soil.
                </h1>
                <p className="text-lg text-[var(--color-ink-soft)] leading-relaxed">
                  Upload your soil report or detect your location to get a highly accurate crop recommendation tailored to your exact field conditions.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                   <button className="btn-primary" onClick={() => {
                     const form = document.getElementById('soil-form');
                     if(form) form.scrollIntoView({behavior: 'smooth'});
                   }}>Upload Soil Report</button>
                   <button className="btn-secondary" onClick={() => setActiveTab('schemes')}>View Schemes</button>
                </div>
                <p className="text-xs text-[var(--color-ink-soft)] opacity-80 pt-2 font-medium">
                  Works offline via app. SMS & IVR support available.
                </p>
              </div>
              
              <div className="lg:col-span-7 relative" id="soil-form">
                <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="agri-card !border-red-300 bg-red-50 p-6 animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-800" style={{fontFamily: 'var(--font-display)'}}>{t("errors.title")}</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {results && !isLoading && (
              <div className="animate-fade-in-up scroll-mt-24" id="results-view">
                <ResultsSection data={results} userInput={lastInput} />
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="animate-fade-in-up scroll-mt-24 mt-8">
                <AILoadingSequence />
              </div>
            )}

            {/* ── How It Works ── */}
            {!results && !isLoading && (
              <section className="agri-card p-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border-line)]">
                  <div className="p-8">
                    <span className="eyebrow mb-2 block">Step 01</span>
                    <h3 className="text-xl font-bold mb-3">Upload Report</h3>
                    <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">Enter the values from your official Soil Health Card, or use our GPS auto-detect to fetch local data instantly.</p>
                  </div>
                  <div className="p-8 bg-[var(--color-paper-deep)]/30">
                    <span className="eyebrow mb-2 block">Step 02</span>
                    <h3 className="text-xl font-bold mb-3">AI Detection</h3>
                    <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">Our system cross-references your soil with live weather patterns and historical market demand.</p>
                  </div>
                  <div className="p-8">
                    <span className="eyebrow mb-2 block">Step 03</span>
                    <h3 className="text-xl font-bold mb-3">Get Recommendation</h3>
                    <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">Receive a detailed growth-match percentage and alternative crop suggestions to maximize your yield.</p>
                  </div>
                </div>
              </section>
            )}

            {/* ── Accessibility / Access Tiers ── */}
            <section className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h2 className="text-3xl font-bold text-[var(--color-ink)]">Accessible for Every Farmer</h2>
                <p className="text-[var(--color-ink-soft)]">AgriMitra is designed to work in low-connectivity areas, regardless of your device or digital literacy.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="agri-card p-6">
                  <span className="eyebrow mb-3 block">Tier 1</span>
                  <h4 className="font-bold text-lg mb-2">Mobile App</h4>
                  <p className="text-sm text-[var(--color-ink-soft)]">Offline-first Android application. Syncs data when connectivity is restored.</p>
                </div>
                <div className="agri-card p-6 bg-[var(--color-paper-deep)]/20">
                  <span className="eyebrow mb-3 block">Tier 2</span>
                  <h4 className="font-bold text-lg mb-2">SMS Integration</h4>
                  <p className="text-sm text-[var(--color-ink-soft)]">Send basic soil parameters via text message and receive recommendations instantly.</p>
                </div>
                <div className="agri-card p-6">
                  <span className="eyebrow mb-3 block">Tier 3</span>
                  <h4 className="font-bold text-lg mb-2">IVR Call Line</h4>
                  <p className="text-sm text-[var(--color-ink-soft)]">Toll-free number with voice recognition in 22 regional languages. No smartphone needed.</p>
                </div>
                <div className="agri-card p-6 bg-[var(--color-paper-deep)]/20">
                  <span className="eyebrow mb-3 block">Tier 4</span>
                  <h4 className="font-bold text-lg mb-2">Village Kiosk</h4>
                  <p className="text-sm text-[var(--color-ink-soft)]">Integrated with Common Service Centres (CSC) for assisted uploading by local operators.</p>
                </div>
              </div>
            </section>

          </div>
        ) : activeTab === 'schemes' ? (
          <SchemesRecommendation />
        ) : activeTab === 'disease' ? (
          <DiseaseDetection />
        ) : (
          <WeatherDashboard />
        )}
      </main>

      {/* ── Closing CTA Band ── */}
      {activeTab === 'crop' && (
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="rounded-2xl p-10 md:p-16 bg-gradient-to-br from-[var(--color-agri-green)] to-[var(--color-agri-green-deep)] text-center text-white shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
             <div className="relative z-10 max-w-2xl mx-auto space-y-6">
               <h2 className="text-3xl md:text-4xl font-bold" style={{fontFamily: 'var(--font-display)'}}>Ready to optimize your yield?</h2>
               <p className="text-green-50 text-lg">Join thousands of farmers making data-driven decisions for better harvests and higher profits.</p>
               <button className="bg-white text-[var(--color-agri-green-deep)] font-semibold py-3 px-8 rounded-lg mt-4 hover:bg-[var(--color-paper)] transition-colors shadow-lg" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Upload Soil Report Now</button>
             </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border-line)] bg-[var(--color-paper-deep)]/30 mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold text-lg text-[var(--color-ink)]" style={{fontFamily: 'var(--font-display)'}}>AgriMitra</div>
          <p className="text-xs text-[var(--color-ink-soft)]">
            Information provided is for advisory purposes. Always consult local agricultural experts.
          </p>
        </div>
      </footer>

      {/* ── Chat Widget ── */}
      <ChatWidget />
    </div>
  );
}
